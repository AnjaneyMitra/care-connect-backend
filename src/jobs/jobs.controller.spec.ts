import { Test, TestingModule } from "@nestjs/testing";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

describe("JobsController", () => {
  let controller: JobsController;

  const mockJobsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByParent: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getApplications: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
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
      const req = { user: { id: "parent-123" } };
      const mockJob = { id: "job-123", ...createJobDto };

      mockJobsService.create.mockResolvedValue(mockJob);

      const result = await controller.create(createJobDto, req);

      expect(result).toEqual(mockJob);
      expect(mockJobsService.create).toHaveBeenCalledWith(
        createJobDto,
        "parent-123",
      );
    });
  });

  describe("findOne", () => {
    it("should return a job", async () => {
      const mockJob = { id: "job-123", title: "Test Job" };
      mockJobsService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne("job-123");

      expect(result).toEqual(mockJob);
    });
  });

  describe("findByParent", () => {
    it("should return jobs for a parent", async () => {
      const mockJobs = [{ id: "job-123" }, { id: "job-456" }];
      mockJobsService.findByParent.mockResolvedValue(mockJobs);

      const result = await controller.findByParent("parent-123");

      expect(result).toEqual(mockJobs);
    });
  });

  describe("update", () => {
    it("should update a job", async () => {
      const updateDto = { title: "Updated" } as any;
      const req = { user: { id: "parent-123" } };
      const mockJob = { id: "job-123", ...updateDto };

      mockJobsService.update.mockResolvedValue(mockJob);

      const result = await controller.update("job-123", updateDto, req);

      expect(result).toEqual(mockJob);
    });
  });

  describe("remove", () => {
    it("should delete a job", async () => {
      const req = { user: { id: "parent-123" } };
      const mockJob = { id: "job-123", status: "cancelled" };

      mockJobsService.remove.mockResolvedValue(mockJob);

      const result = await controller.remove("job-123", req);

      expect(result).toEqual(mockJob);
    });
  });

  describe("getApplications", () => {
    it("should return applications for a job", async () => {
      const mockApplications = [
        { id: "app-123", nanny_id: "nanny-1" },
        { id: "app-456", nanny_id: "nanny-2" },
      ];
      mockJobsService.getApplications.mockResolvedValue(mockApplications);

      const result = await controller.getApplications("job-123");

      expect(result).toEqual(mockApplications);
    });
  });
});
