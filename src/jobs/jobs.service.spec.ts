import { Test, TestingModule } from "@nestjs/testing";
import { JobsService } from "./jobs.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("JobsService", () => {
  let service: JobsService;

  const mockPrismaService = {
    jobs: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    applications: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a job", async () => {
      const createJobDto = {
        title: "Need a babysitter",
        description: "For 2 kids",
        date: "2025-12-01",
        time: "10:00:00",
        location_lat: 40.7128,
        location_lng: -74.006,
      };
      const parentId = "parent-123";
      const mockJob = { id: "job-123", ...createJobDto, parent_id: parentId };

      mockPrismaService.jobs.create.mockResolvedValue(mockJob);

      const result = await service.create(createJobDto, parentId);

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.jobs.create).toHaveBeenCalledWith({
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
    });
  });

  describe("findOne", () => {
    it("should return a job by id", async () => {
      const jobId = "job-123";
      const mockJob = { id: jobId, title: "Test Job" };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne(jobId);

      expect(result).toEqual(mockJob);
    });

    it("should throw NotFoundException if job not found", async () => {
      mockPrismaService.jobs.findUnique.mockResolvedValue(null);

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a job", async () => {
      const jobId = "job-123";
      const userId = "parent-123";
      const updateDto = { title: "Updated Title" } as any;
      const mockJob = { id: jobId, parent_id: userId };
      const mockUpdatedJob = { ...mockJob, ...updateDto };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.jobs.update.mockResolvedValue(mockUpdatedJob);

      const result = await service.update(jobId, updateDto, userId);

      expect(result).toEqual(mockUpdatedJob);
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      const jobId = "job-123";
      const mockJob = { id: jobId, parent_id: "other-user" };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);

      await expect(service.update(jobId, {}, "wrong-user")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a job by setting status to cancelled", async () => {
      const jobId = "job-123";
      const userId = "parent-123";
      const mockJob = { id: jobId, parent_id: userId };
      const mockCancelledJob = { ...mockJob, status: "cancelled" };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.jobs.update.mockResolvedValue(mockCancelledJob);

      const result = await service.remove(jobId, userId);

      expect(result).toEqual(mockCancelledJob);
      expect(mockPrismaService.jobs.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: { status: "cancelled" },
      });
    });
  });
});
