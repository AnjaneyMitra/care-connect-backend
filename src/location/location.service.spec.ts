import { Test, TestingModule } from "@nestjs/testing";
import { LocationService } from "./location.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("LocationService", () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findMany: jest.fn(),
            },
            jobs: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
