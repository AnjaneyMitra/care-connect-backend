import { Module } from "@nestjs/common";
import { AssignmentsService } from "./assignments.service";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsScheduler } from "./assignments.scheduler";
import { PrismaModule } from "../prisma/prisma.module";
import { RequestsModule } from "../requests/requests.module";

@Module({
  imports: [PrismaModule, RequestsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsScheduler],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
