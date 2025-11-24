import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) { }

  async create(parentId: string, createRequestDto: CreateRequestDto) {
    // 1. Get parent profile for location
    const parent = await this.usersService.findOne(parentId);
    console.log("RequestsService.create parent:", JSON.stringify(parent, null, 2));
    if (
      !parent ||
      !parent.profiles ||
      !parent.profiles.lat ||
      !parent.profiles.lng
    ) {
      console.log("Parent profile incomplete:", parent?.profiles);
      throw new BadRequestException(
        "Parent profile incomplete. Address and location required.",
      );
    }

    try {
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
    } catch (error) {
      console.error("Error creating service request:", error);
      throw error;
    }
  }

  async triggerMatching(requestId: string) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: requestId },
      include: { assignments: true }, // Include previous assignments
    });

    if (!request) throw new NotFoundException("Request not found");

    // Get IDs of nannies already assigned (rejected or timeout)
    const excludedNannyIds = request.assignments.map((a) => a.nanny_id);

    // Format excluded IDs for SQL NOT IN clause
    const excludedIdsSql =
      excludedNannyIds.length > 0
        ? `AND u.id NOT IN (${excludedNannyIds.map((id) => `'${id}'`).join(",")})`
        : "";

    // Hard Filters
    const radiusKm = 15; // Increased to 15km
    const maxRateSql = request.max_hourly_rate
      ? `AND nd.hourly_rate <= ${request.max_hourly_rate}`
      : "";

    // Skills Filter: Nanny must have ALL required skills
    // We use array overlap operator && to check if required_skills is contained in nanny skills
    // But Prisma raw query with arrays can be tricky. 
    // A simpler approach for raw SQL is to check if the intersection count matches the required count.
    // However, for simplicity and compatibility, we'll fetch candidates who match other criteria 
    // and filter by skills in memory if the SQL gets too complex, OR use the @> operator if Postgres supports it well.
    // Let's try to filter by skills in memory to be safe with array types, 
    // but we can add a basic check if possible.
    // Actually, let's do the skills check in memory to ensure correctness with the JSON/Array types.

    const nannies = (await this.prisma.$queryRawUnsafe(`
      SELECT 
        u.id, 
        u.email,
        nd.skills,
        nd.experience_years,
        nd.hourly_rate,
        nd.acceptance_rate,
        (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * cos(radians(p.lng) - radians(${request.location_lng})) + sin(radians(${request.location_lat})) * sin(radians(p.lat)))) AS distance
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      JOIN nanny_details nd ON u.id = nd.user_id
      WHERE u.role = 'nanny'
      AND u.is_verified = true
      AND nd.is_available_now = true
      ${excludedIdsSql}
      ${maxRateSql}
      AND (6371 * acos(cos(radians(${request.location_lat})) * cos(radians(p.lat)) * cos(radians(p.lng) - radians(${request.location_lng})) + sin(radians(${request.location_lat})) * sin(radians(p.lat)))) < ${radiusKm}
    `)) as any[];

    // In-Memory Filtering & Scoring
    const requiredSkills = request.required_skills || [];

    const scoredNannies = nannies
      .filter((nanny) => {
        // Filter by Skills
        if (requiredSkills.length === 0) return true;
        const nannySkills = nanny.skills || [];
        return requiredSkills.every((skill) => nannySkills.includes(skill));
      })
      .map((nanny) => {
        // Calculate Score
        let score = 0;

        // 1. Distance (Max 30 pts) - Closer is better
        // 0km = 30pts, 15km = 0pts
        const distanceScore = Math.max(0, 30 * (1 - nanny.distance / radiusKm));
        score += distanceScore;

        // 2. Experience (Max 20 pts) - More is better
        // 10+ years = 20pts
        const experience = nanny.experience_years || 0;
        const experienceScore = Math.min(20, experience * 2);
        score += experienceScore;

        // 3. Acceptance Rate (Max 20 pts)
        const acceptanceRate = Number(nanny.acceptance_rate) || 0;
        const acceptanceScore = (acceptanceRate / 100) * 20;
        score += acceptanceScore;

        // 4. Hourly Rate (Max 10 pts) - Lower is better (Value)
        // If rate is 0 (unlikely), give max points.
        // We compare against a baseline, say $50/hr. 
        // Or simpler: if they are well below max_hourly_rate (if set).
        // Let's just give points for being affordable.
        // $10/hr = 10pts, $50/hr = 0pts
        const rate = Number(nanny.hourly_rate) || 0;
        const rateScore = Math.max(0, 10 * (1 - (rate - 10) / 40));
        score += rateScore;

        return { ...nanny, score };
      })
      .sort((a, b) => b.score - a.score); // Sort by Score DESC

    if (scoredNannies.length > 0) {
      // Assign to the top-ranked candidate
      const bestMatch = scoredNannies[0];
      console.log(`Best match for request ${requestId}: ${bestMatch.id} (Score: ${bestMatch.score.toFixed(2)})`);

      // Create assignment
      const assignment = await this.prisma.assignments.create({
        data: {
          request_id: requestId,
          nanny_id: bestMatch.id,
          response_deadline: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          status: "pending",
          rank_position: request.assignments.length + 1,
        },
      });

      // Update request status
      await this.prisma.service_requests.update({
        where: { id: requestId },
        data: {
          status: "assigned",
          current_assignment_id: assignment.id,
        },
      });

      console.log(`Assigned request ${requestId} to nanny ${bestMatch.id}`);

      // Notify Nanny
      await this.notificationsService.sendPushNotification(
        bestMatch.id,
        "New Service Request",
        `You have a new service request nearby! Tap to view details.`,
      );

      return assignment;
    } else {
      console.log(`No nannies found for request ${requestId}`);
      // TODO: Notify parent no matches found
      return null;
    }
  }

  async findOne(id: string) {
    const request = await this.prisma.service_requests.findUnique({
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

    if (!request) {
      throw new NotFoundException(`Service request with ID ${id} not found`);
    }

    return request;
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
}
