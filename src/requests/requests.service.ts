import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class RequestsService {
  private readonly validTransitions: Record<string, string[]> = {
    pending: ["assigned", "cancelled", "no_matches"],
    assigned: ["accepted", "pending", "cancelled"], // can go back to pending on rejection/timeout
    accepted: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [], // terminal state
    cancelled: [], // terminal state
    no_matches: ["cancelled"], // can be cancelled by parent
  };

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const allowedTransitions = this.validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
          `Allowed transitions: ${allowedTransitions.join(", ") || "none"}`,
      );
    }
  }

  async create(parentId: string, createRequestDto: CreateRequestDto) {
    // 1. Get parent profile for location
    const parent = await this.usersService.findOne(parentId);
    if (
      !parent ||
      !parent.profiles ||
      !parent.profiles.lat ||
      !parent.profiles.lng
    ) {
      throw new BadRequestException(
        "Parent profile incomplete. Address and location required.",
      );
    }

    // 2. Create the service request
    const request = await this.prisma.service_requests.create({
      data: {
        parent_id: parentId,
        date: new Date(createRequestDto.date),
        start_time: new Date(`1970-01-01T${createRequestDto.start_time}Z`), // Store as time on dummy date
        duration_hours: createRequestDto.duration_hours,
        num_children: createRequestDto.num_children,
        children_ages: createRequestDto.children_ages || [],
        special_requirements: createRequestDto.special_requirements,
        required_skills: createRequestDto.required_skills || [],
        max_hourly_rate: createRequestDto.max_hourly_rate,
        location_lat: parent.profiles.lat,
        location_lng: parent.profiles.lng,
        status: "pending",
      },
    });

    // 3. Trigger auto-matching
    await this.triggerMatching(request.id);

    return request;
  }

  async triggerMatching(requestId: string) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: requestId },
      include: { assignments: true },
    });

    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending") return null; // Don't match if already assigned/accepted

    // Get IDs of nannies already assigned (rejected or timeout)
    const excludedNannyIds = request.assignments.map((a) => a.nanny_id);

    // Build exclusion SQL
    const excludedIdsSql =
      excludedNannyIds.length > 0
        ? `AND u.id NOT IN (${excludedNannyIds.map((id) => `'${id}'`).join(",")})`
        : "";

    const radiusKm = 10;

    // Step 1: Get nearby nannies with distance
    console.log(
      `[DEBUG] Searching for nannies near lat=${request.location_lat}, lng=${request.location_lng}, radius=${radiusKm}km`,
    );

    // Debug: Check what nannies exist
    const allNannies = await this.prisma.$queryRawUnsafe(`
      SELECT u.id, u.role, u.is_verified, p.lat, p.lng, p.first_name, nd.is_available_now
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN nanny_details nd ON u.id = nd.user_id
      WHERE u.role = 'nanny'
    `);
    console.log(`[DEBUG] All nannies in DB:`, allNannies);

    const nearbyNannies = (await this.prisma.$queryRawUnsafe(`
            SELECT u.id, 
                   (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * 
                    cos(radians(p.lng) - radians(${request.location_lng})) + 
                    sin(radians(${request.location_lat})) * sin(radians(p.lat)))) AS distance
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN nanny_details nd ON u.id = nd.user_id
            WHERE u.role = 'nanny'
            AND u.is_verified = true
            AND nd.is_available_now = true
            ${excludedIdsSql}
            AND (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * 
                 cos(radians(p.lng) - radians(${request.location_lng})) + 
                 sin(radians(${request.location_lat})) * sin(radians(p.lat)))) < ${radiusKm}
            ORDER BY distance ASC
        `)) as any[];

    console.log(
      `[DEBUG] Found ${nearbyNannies.length} nearby nannies:`,
      nearbyNannies,
    );

    if (nearbyNannies.length === 0) {
      console.log(`No nearby nannies found for request ${requestId}`);
      this.validateStatusTransition(request.status, "no_matches");
      await this.prisma.service_requests.update({
        where: { id: requestId },
        data: { status: "no_matches" },
      });
      return null;
    }

    // Step 2: Get full nanny details including skills, rate, and reviews
    const nannyIds = nearbyNannies.map((n) => n.id);
    const nanniesWithDetails = await this.prisma.users.findMany({
      where: { id: { in: nannyIds } },
      include: {
        nanny_details: true,
        reviews_reviews_reviewee_idTousers: {
          select: { rating: true },
        },
      },
    });

    // Step 3: Filter and score candidates
    const requestDate = new Date(request.date);
    const requestDay = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][requestDate.getDay()];
    const requestStartTime = request.start_time.toISOString().substring(11, 16); // HH:MM
    const requestEndTime = this.addHoursToTime(
      requestStartTime,
      Number(request.duration_hours),
    );

    const scoredCandidates = nanniesWithDetails
      .map((nanny) => {
        const distance =
          nearbyNannies.find((n) => n.id === nanny.id)?.distance || 0;
        const nannyDetails = nanny.nanny_details;

        if (!nannyDetails) return null;

        // Filter by hourly rate
        if (
          request.max_hourly_rate &&
          nannyDetails.hourly_rate &&
          Number(nannyDetails.hourly_rate) > Number(request.max_hourly_rate)
        ) {
          return null;
        }

        // Filter by required skills
        const requiredSkills = request.required_skills || [];
        const nannySkills = nannyDetails.skills || [];
        if (requiredSkills.length > 0) {
          const hasAllSkills = requiredSkills.every((skill) =>
            nannySkills.some((ns) => ns.toLowerCase() === skill.toLowerCase()),
          );
          if (!hasAllSkills) return null;
        }

        // Check availability schedule
        const availabilitySchedule = nannyDetails.availability_schedule as any;
        if (availabilitySchedule && availabilitySchedule[requestDay]) {
          const daySlots = availabilitySchedule[requestDay] as Array<{
            start: string;
            end: string;
          }>;
          const isAvailable = daySlots.some(
            (slot) =>
              requestStartTime >= slot.start && requestEndTime <= slot.end,
          );
          if (!isAvailable) return null;
        }

        // Calculate rating (average from reviews)
        const reviews = nanny.reviews_reviews_reviewee_idTousers || [];
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviews.length
            : 3; // Default rating if no reviews

        // Calculate composite score (lower is better for distance, higher is better for rating)
        // Normalize: distance (0-10km → 100-0 points), rating (1-5 → 0-100 points), rate match (0-100 points)
        const distanceScore = Math.max(0, 100 - (distance / radiusKm) * 100); // Closer = higher score
        const ratingScore = (avgRating / 5) * 100; // Higher rating = higher score

        // Rate score: if nanny charges less, they score higher
        const maxRate = Number(request.max_hourly_rate) || 100;
        const nannyRate = Number(nannyDetails.hourly_rate) || maxRate;
        const rateScore = Math.max(
          0,
          ((maxRate - nannyRate) / maxRate) * 100 + 50,
        ); // Lower rate = higher score

        // Weighted composite: 40% distance, 30% rating, 30% rate
        const compositeScore =
          distanceScore * 0.4 + ratingScore * 0.3 + rateScore * 0.3;

        return {
          id: nanny.id,
          distance,
          rating: avgRating,
          hourlyRate: nannyDetails.hourly_rate,
          compositeScore,
        };
      })
      .filter((c) => c !== null)
      .sort((a, b) => b.compositeScore - a.compositeScore); // Highest score first

    if (scoredCandidates.length === 0) {
      console.log(
        `No matching nannies found for request ${requestId} after filtering`,
      );
      this.validateStatusTransition(request.status, "no_matches");
      await this.prisma.service_requests.update({
        where: { id: requestId },
        data: { status: "no_matches" },
      });
      return null;
    }

    // Step 4: Assign to best match
    const bestMatch = scoredCandidates[0];
    const assignment = await this.prisma.assignments.create({
      data: {
        request_id: requestId,
        nanny_id: bestMatch.id,
        response_deadline: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        status: "pending",
        rank_position: request.assignments.length + 1,
      },
    });

    this.validateStatusTransition(request.status, "assigned");
    await this.prisma.service_requests.update({
      where: { id: requestId },
      data: {
        status: "assigned",
        current_assignment_id: assignment.id,
      },
    });

    console.log(
      `Assigned request ${requestId} to nanny ${bestMatch.id} (score: ${bestMatch.compositeScore.toFixed(2)})`,
    );
    return assignment;
  }

  // Helper to add hours to time string (HH:MM format)
  private addHoursToTime(time: string, hours: number): string {
    const [h, m] = time.split(":").map(Number);
    const totalMinutes = h * 60 + m + hours * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
  }

  async findOne(id: string) {
    return this.prisma.service_requests.findUnique({
      where: { id },
      include: {
        users: {
          include: { profiles: true },
        },
        assignments: {
          include: { users: { include: { profiles: true } } },
        },
      },
    });
  }

  async findAllByParent(parentId: string) {
    return this.prisma.service_requests.findMany({
      where: { parent_id: parentId },
      orderBy: { created_at: "desc" },
      include: {
        assignments: {
          where: { status: "pending" },
          include: { users: { include: { profiles: true } } },
        },
      },
    });
  }

  async cancel(requestId: string, parentId: string) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: requestId },
      include: { assignments: { where: { status: "pending" } } },
    });

    if (!request) throw new NotFoundException("Request not found");
    if (request.parent_id !== parentId) {
      throw new BadRequestException("Not authorized to cancel this request");
    }

    // Only allow cancellation if status is pending, assigned, or no_matches
    const cancellableStatuses = ["pending", "assigned", "no_matches"];
    if (!cancellableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Cannot cancel request with status: ${request.status}`,
      );
    }

    // Cancel any pending assignments
    if (request.assignments.length > 0) {
      await this.prisma.assignments.updateMany({
        where: {
          request_id: requestId,
          status: "pending",
        },
        data: {
          status: "cancelled",
          responded_at: new Date(),
        },
      });
    }

    // Update request status
    this.validateStatusTransition(request.status, "cancelled");
    const updated = await this.prisma.service_requests.update({
      where: { id: requestId },
      data: {
        status: "cancelled",
        current_assignment_id: null,
      },
      include: {
        assignments: true,
      },
    });

    return updated;
  }

  async viewMatches(requestId: string, parentId: string) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException("Request not found");
    if (request.parent_id !== parentId) {
      throw new BadRequestException(
        "Not authorized to view matches for this request",
      );
    }

    // Get nearby nannies (similar logic to triggerMatching but return all)
    const radiusKm = 10;
    const nearbyNannies = (await this.prisma.$queryRawUnsafe(`
            SELECT u.id, 
                   (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * 
                    cos(radians(p.lng) - radians(${request.location_lng})) + 
                    sin(radians(${request.location_lat})) * sin(radians(p.lat)))) AS distance
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN nanny_details nd ON u.id = nd.user_id
            WHERE u.role = 'nanny'
            AND u.is_verified = true
            AND nd.is_available_now = true
            AND (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * 
                 cos(radians(p.lng) - radians(${request.location_lng})) + 
                 sin(radians(${request.location_lat})) * sin(radians(p.lat)))) < ${radiusKm}
            ORDER BY distance ASC
            LIMIT 20
        `)) as any[];

    if (nearbyNannies.length === 0) {
      return [];
    }

    // Get full details
    const nannyIds = nearbyNannies.map((n) => n.id);
    const nanniesWithDetails = await this.prisma.users.findMany({
      where: { id: { in: nannyIds } },
      include: {
        profiles: true,
        nanny_details: true,
        reviews_reviews_reviewee_idTousers: {
          select: { rating: true },
        },
      },
    });

    // Calculate ratings and format response
    const requestDate = new Date(request.date);
    const requestDay = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][requestDate.getDay()];
    const requestStartTime = request.start_time.toISOString().substring(11, 16);
    const requestEndTime = this.addHoursToTime(
      requestStartTime,
      Number(request.duration_hours),
    );

    return nanniesWithDetails.map((nanny) => {
      const distance =
        nearbyNannies.find((n) => n.id === nanny.id)?.distance || 0;
      const reviews = nanny.reviews_reviews_reviewee_idTousers || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          : null;

      const nannyDetails = nanny.nanny_details;
      const availabilitySchedule = nannyDetails?.availability_schedule as any;
      let isAvailableForSlot = true;

      if (availabilitySchedule && availabilitySchedule[requestDay]) {
        const daySlots = availabilitySchedule[requestDay] as Array<{
          start: string;
          end: string;
        }>;
        isAvailableForSlot = daySlots.some(
          (slot) =>
            requestStartTime >= slot.start && requestEndTime <= slot.end,
        );
      }

      return {
        id: nanny.id,
        firstName: nanny.profiles?.first_name,
        lastName: nanny.profiles?.last_name,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: reviews.length,
        hourlyRate: nannyDetails?.hourly_rate,
        experienceYears: nannyDetails?.experience_years,
        skills: nannyDetails?.skills || [],
        isAvailableForSlot,
        acceptanceRate: nannyDetails?.acceptance_rate,
      };
    });
  }
}
