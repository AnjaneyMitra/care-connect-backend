import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestsService } from "../requests/requests.service";

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private requestsService: RequestsService,
  ) {}

  async findAllByNanny(nannyId: string) {
    return this.prisma.assignments.findMany({
      where: { nanny_id: nannyId },
      orderBy: { created_at: "desc" },
      include: {
        service_requests: {
          include: { users: { include: { profiles: true } } },
        },
      },
    });
  }

  async findPendingByNanny(nannyId: string) {
    return this.prisma.assignments.findMany({
      where: {
        nanny_id: nannyId,
        status: "pending",
      },
      orderBy: { created_at: "desc" },
      include: {
        service_requests: {
          include: { users: { include: { profiles: true } } },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.assignments.findUnique({
      where: { id },
      include: {
        service_requests: {
          include: { users: { include: { profiles: true } } },
        },
      },
    });
  }

  async accept(id: string, nannyId: string) {
    const assignment = await this.prisma.assignments.findUnique({
      where: { id },
      include: { service_requests: true },
    });

    if (!assignment) throw new NotFoundException("Assignment not found");
    if (assignment.nanny_id !== nannyId)
      throw new ForbiddenException("Not authorized");
    if (assignment.status !== "pending")
      throw new BadRequestException("Assignment is not pending");

    const request = assignment.service_requests;
    if (request.status !== "assigned") {
      throw new BadRequestException(
        `Cannot accept assignment. Request status is '${request.status}', expected 'assigned'`,
      );
    }

    // 1. Update assignment status
    await this.prisma.assignments.update({
      where: { id },
      data: {
        status: "accepted",
        responded_at: new Date(),
      },
    });

    // 2. Update request status
    await this.prisma.service_requests.update({
      where: { id: assignment.request_id },
      data: { status: "accepted" },
    });

    // 3. Create Booking
    const booking = await this.prisma.bookings.create({
      data: {
        job_id: null, // Not using jobs table anymore for this flow
        parent_id: assignment.service_requests.parent_id,
        nanny_id: nannyId,
        status: "confirmed",
        start_time: new Date(
          assignment.service_requests.date.toISOString().split("T")[0] +
            "T" +
            assignment.service_requests.start_time.toISOString().split("T")[1],
        ),
        // Calculate end time based on duration
        end_time: new Date(
          new Date(
            assignment.service_requests.date.toISOString().split("T")[0] +
              "T" +
              assignment.service_requests.start_time
                .toISOString()
                .split("T")[1],
          ).getTime() +
            Number(assignment.service_requests.duration_hours) * 60 * 60 * 1000,
        ),
      },
    });

    return { assignment, booking };
  }

  async reject(id: string, nannyId: string, reason?: string) {
    const assignment = await this.prisma.assignments.findUnique({
      where: { id },
      include: { service_requests: true },
    });

    if (!assignment) throw new NotFoundException("Assignment not found");
    if (assignment.nanny_id !== nannyId)
      throw new ForbiddenException("Not authorized");
    if (assignment.status !== "pending")
      throw new BadRequestException("Assignment is not pending");

    // 1. Update assignment status
    await this.prisma.assignments.update({
      where: { id },
      data: {
        status: "rejected",
        rejection_reason: reason,
        responded_at: new Date(),
      },
    });

    // 2. Update nanny acceptance rate
    const nanny = await this.prisma.users.findUnique({
      where: { id: nannyId },
      include: {
        nanny_details: true,
        assignments: {
          where: {
            status: { in: ["accepted", "rejected"] },
          },
        },
      },
    });

    if (nanny?.nanny_details && nanny.assignments.length > 0) {
      const acceptedCount = nanny.assignments.filter(
        (a) => a.status === "accepted",
      ).length;
      const totalResponses = nanny.assignments.length;
      const newAcceptanceRate = (acceptedCount / totalResponses) * 100;

      await this.prisma.nanny_details.update({
        where: { user_id: nannyId },
        data: { acceptance_rate: newAcceptanceRate },
      });
    }

    // 3. Reset request to pending and trigger re-matching
    await this.prisma.service_requests.update({
      where: { id: assignment.request_id },
      data: {
        status: "pending",
        current_assignment_id: null,
      },
    });

    // 4. Trigger auto-reassignment to next best match
    console.log(
      `Assignment ${id} rejected. Triggering re-match for request ${assignment.request_id}...`,
    );
    await this.requestsService.triggerMatching(assignment.request_id);

    return {
      success: true,
      message: "Assignment rejected and reassigned to next available nanny",
    };
  }
}
