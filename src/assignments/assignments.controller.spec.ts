import { Test, TestingModule } from "@nestjs/testing";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsService } from "./assignments.service";

describe("AssignmentsController", () => {
  let controller: AssignmentsController;
  let service: AssignmentsService;

  const mockAssignmentsService = {
    findAllByNanny: jest.fn(),
    findPendingByNanny: jest.fn(),
    findOne: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const mockUser = { id: "nanny-123", email: "nanny@example.com" };
  const mockRequest = { user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentsService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
    service = module.get<AssignmentsService>(AssignmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllMyAssignments", () => {
    it("should return all assignments for the authenticated nanny", async () => {
      const mockAssignments = [
        { id: "assignment-1", status: "pending" },
        { id: "assignment-2", status: "accepted" },
      ];
      mockAssignmentsService.findAllByNanny.mockResolvedValue(mockAssignments);

      const result = await controller.findAllMyAssignments(mockRequest);

      expect(service.findAllByNanny).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockAssignments);
    });
  });

  describe("findPendingAssignments", () => {
    it("should return pending assignments for the authenticated nanny", async () => {
      const mockPending = [{ id: "assignment-1", status: "pending" }];
      mockAssignmentsService.findPendingByNanny.mockResolvedValue(mockPending);

      const result = await controller.findPendingAssignments(mockRequest);

      expect(service.findPendingByNanny).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockPending);
    });
  });

  describe("findOne", () => {
    it("should return an assignment by id", async () => {
      const mockAssignment = {
        id: "assignment-1",
        status: "pending",
        service_requests: { id: "request-123" },
      };
      mockAssignmentsService.findOne.mockResolvedValue(mockAssignment);

      const result = await controller.findOne("assignment-1");

      expect(service.findOne).toHaveBeenCalledWith("assignment-1");
      expect(result).toEqual(mockAssignment);
    });
  });

  describe("accept", () => {
    it("should accept an assignment", async () => {
      const mockResponse = {
        assignment: { id: "assignment-1", status: "accepted" },
        booking: { id: "booking-123", status: "confirmed" },
      };
      mockAssignmentsService.accept.mockResolvedValue(mockResponse);

      const result = await controller.accept("assignment-1", mockRequest);

      expect(service.accept).toHaveBeenCalledWith("assignment-1", mockUser.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("reject", () => {
    it("should reject an assignment with a reason", async () => {
      const mockResponse = {
        success: true,
        message: "Assignment rejected and reassigned to next available nanny",
      };
      mockAssignmentsService.reject.mockResolvedValue(mockResponse);

      const result = await controller.reject("assignment-1", mockRequest, "Too far");

      expect(service.reject).toHaveBeenCalledWith(
        "assignment-1",
        mockUser.id,
        "Too far",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should reject an assignment without a reason", async () => {
      const mockResponse = {
        success: true,
        message: "Assignment rejected and reassigned to next available nanny",
      };
      mockAssignmentsService.reject.mockResolvedValue(mockResponse);

      const result = await controller.reject("assignment-1", mockRequest);

      expect(service.reject).toHaveBeenCalledWith(
        "assignment-1",
        mockUser.id,
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
