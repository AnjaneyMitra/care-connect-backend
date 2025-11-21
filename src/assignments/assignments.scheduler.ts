import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { RequestsService } from "../requests/requests.service";

@Injectable()
export class AssignmentsScheduler {
  private readonly logger = new Logger(AssignmentsScheduler.name);

  constructor(
    private prisma: PrismaService,
    private requestsService: RequestsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredAssignments() {
    this.logger.debug("Checking for expired assignments...");

    try {
      // Find all pending assignments past their deadline
      const expiredAssignments = await this.prisma.assignments.findMany({
        where: {
          status: "pending",
          response_deadline: {
            lt: new Date(),
          },
        },
        include: {
          service_requests: true,
          users: {
            include: { nanny_details: true },
          },
        },
      });

      if (expiredAssignments.length === 0) {
        this.logger.debug("No expired assignments found");
        return;
      }

      this.logger.log(
        `Found ${expiredAssignments.length} expired assignment(s)`,
      );

      for (const assignment of expiredAssignments) {
        try {
          // 1. Mark assignment as timeout
          await this.prisma.assignments.update({
            where: { id: assignment.id },
            data: {
              status: "timeout",
              responded_at: new Date(),
            },
          });

          // 2. Update nanny acceptance rate
          const nanny = assignment.users;
          if (nanny?.nanny_details) {
            const allAssignments = await this.prisma.assignments.findMany({
              where: {
                nanny_id: nanny.id,
                status: { in: ["accepted", "rejected", "timeout"] },
              },
            });

            if (allAssignments.length > 0) {
              const acceptedCount = allAssignments.filter(
                (a) => a.status === "accepted",
              ).length;
              const newAcceptanceRate =
                (acceptedCount / allAssignments.length) * 100;

              await this.prisma.nanny_details.update({
                where: { user_id: nanny.id },
                data: { acceptance_rate: newAcceptanceRate },
              });
            }
          }

          // 3. Reset request to pending
          await this.prisma.service_requests.update({
            where: { id: assignment.request_id },
            data: {
              status: "pending",
              current_assignment_id: null,
            },
          });

          // 4. Trigger re-matching
          this.logger.log(
            `Assignment ${assignment.id} timed out. Triggering re-match...`,
          );
          await this.requestsService.triggerMatching(assignment.request_id);
        } catch (error) {
          this.logger.error(
            `Failed to process expired assignment ${assignment.id}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Processed ${expiredAssignments.length} expired assignment(s)`,
      );
    } catch (error) {
      this.logger.error("Error checking expired assignments:", error);
    }
  }
}
