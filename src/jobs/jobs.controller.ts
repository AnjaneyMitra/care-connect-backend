import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("jobs")
@UseGuards(AuthGuard("jwt"))
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.jobsService.findOne(id);
  }

  @Get("parent/:parentId")
  findByParent(@Param("parentId") parentId: string) {
    return this.jobsService.findByParent(parentId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobsService.update(id, updateJobDto, req.user.id);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.id);
  }

  @Get(":id/applications")
  getApplications(@Param("id") id: string) {
    return this.jobsService.getApplications(id);
  }
}
