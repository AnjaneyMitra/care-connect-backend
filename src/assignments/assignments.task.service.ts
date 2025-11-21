import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { RequestsService } from "../requests/requests.service";

@Injectable()
export class AssignmentsTaskService {
  private readonly logger = new Logger(AssignmentsTaskService.name);

  constructor(
    private prisma: PrismaService,
    private requestsService: RequestsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAssignmentTimeouts() {
    this.logger.debug("Checking for assignment timeouts...");

    const now = new Date();
    const expiredAssignments = await this.prisma.assignments.findMany({
      where: {
        status: "pending",
        response_deadline: {
          lt: now,
        },
      },
    });

    if (expiredAssignments.length === 0) {
      return;
    }

    this.logger.log(`Found ${expiredAssignments.length} expired assignments.`);

    for (const assignment of expiredAssignments) {
      try {
        // 1. Update status to timeout
        await this.prisma.assignments.update({
          where: { id: assignment.id },
          data: {
            status: "timeout",
            responded_at: now,
          },
        });

        // 2. Trigger re-matching
        this.logger.log(
          `Assignment ${assignment.id} timed out. Triggering re-match for request ${assignment.request_id}...`,
        );
        await this.requestsService.triggerMatching(assignment.request_id);
      } catch (error) {
        this.logger.error(
          `Error handling timeout for assignment ${assignment.id}`,
          error,
        );
      }
    }
  }
}
