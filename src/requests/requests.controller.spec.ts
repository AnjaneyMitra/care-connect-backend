import { Test, TestingModule } from "@nestjs/testing";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("RequestsController", () => {
  let controller: RequestsController;
  let service: RequestsService;

  const mockRequestsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAllByParent: jest.fn(),
    cancel: jest.fn(),
    viewMatches: jest.fn(),
  };

  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockRequest = { user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
    service = module.get<RequestsService>(RequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a service request", async () => {
      const createDto = {
        date: "2025-12-25",
        start_time: "09:00:00",
        duration_hours: 4,
        num_children: 2,
        children_ages: [3, 5],
        special_requirements: "Allergy-friendly",
        required_skills: ["first-aid"],
        max_hourly_rate: 25,
      };

      const mockResponse = { id: "request-123", ...createDto, status: "pending" };
      mockRequestsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockRequest, createDto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("findOne", () => {
    it("should return a service request", async () => {
      const mockResponse = {
        id: "request-123",
        status: "assigned",
        assignments: [],
      };
      mockRequestsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne("request-123");

      expect(service.findOne).toHaveBeenCalledWith("request-123");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("findAllMyRequests", () => {
    it("should return all requests for the authenticated user", async () => {
      const mockRequests = [
        { id: "request-1", status: "pending" },
        { id: "request-2", status: "assigned" },
      ];
      mockRequestsService.findAllByParent.mockResolvedValue(mockRequests);

      const result = await controller.findAllMyRequests(mockRequest);

      expect(service.findAllByParent).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockRequests);
    });
  });

  describe("cancel", () => {
    it("should cancel a request", async () => {
      const mockResponse = {
        id: "request-123",
        status: "cancelled",
        assignments: [],
      };
      mockRequestsService.cancel.mockResolvedValue(mockResponse);

      const result = await controller.cancel("request-123", mockRequest);

      expect(service.cancel).toHaveBeenCalledWith("request-123", mockUser.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("viewMatches", () => {
    it("should return potential matches for a request", async () => {
      const mockMatches = [
        {
          id: "nanny-1",
          firstName: "Jane",
          distance: 2.5,
          rating: 4.8,
          hourlyRate: 20,
        },
        {
          id: "nanny-2",
          firstName: "Mary",
          distance: 3.1,
          rating: 4.5,
          hourlyRate: 22,
        },
      ];
      mockRequestsService.viewMatches.mockResolvedValue(mockMatches);

      const result = await controller.viewMatches("request-123", mockRequest);

      expect(service.viewMatches).toHaveBeenCalledWith(
        "request-123",
        mockUser.id,
      );
      expect(result).toEqual(mockMatches);
    });
  });
});
