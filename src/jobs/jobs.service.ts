import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, parentId: string) {
    return this.prisma.jobs.create({
      data: {
        ...createJobDto,
        parent_id: parentId,
        location_lat: createJobDto.location_lat,
        location_lng: createJobDto.location_lng,
      },
      include: {
        users: {
          include: {
            profiles: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.jobs.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            profiles: true,
          },
        },
        applications: {
          include: {
            users: {
              include: {
                profiles: true,
                nanny_details: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async findByParent(parentId: string) {
    return this.prisma.jobs.findMany({
      where: { parent_id: parentId },
      include: {
        applications: {
          include: {
            users: {
              include: {
                profiles: true,
                nanny_details: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string) {
    const job = await this.prisma.jobs.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.parent_id !== userId) {
      throw new ForbiddenException("You can only update your own jobs");
    }

    return this.prisma.jobs.update({
      where: { id },
      data: updateJobDto,
      include: {
        users: {
          include: {
            profiles: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const job = await this.prisma.jobs.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.parent_id !== userId) {
      throw new ForbiddenException("You can only delete your own jobs");
    }

    // Soft delete by setting status to cancelled
    return this.prisma.jobs.update({
      where: { id },
      data: { status: "cancelled" },
    });
  }

  async getApplications(jobId: string) {
    const job = await this.prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.prisma.applications.findMany({
      where: { job_id: jobId },
      include: {
        users: {
          include: {
            profiles: true,
            nanny_details: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}
