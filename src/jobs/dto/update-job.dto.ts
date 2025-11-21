import { PartialType } from "@nestjs/mapped-types";
import { CreateJobDto } from "./create-job.dto";
import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsString()
  @IsOptional()
  @IsIn(["open", "closed", "cancelled", "hired"])
  status?: string;
}
