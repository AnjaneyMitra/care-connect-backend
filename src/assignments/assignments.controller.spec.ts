import { Test, TestingModule } from "@nestjs/testing";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsService } from "./assignments.service";

describe("AssignmentsController", () => {
  let controller: AssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: {
            findAllByNanny: jest.fn(),
            findPendingByNanny: jest.fn(),
            findOne: jest.fn(),
            accept: jest.fn(),
            reject: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
