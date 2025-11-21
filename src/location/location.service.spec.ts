import { Test, TestingModule } from "@nestjs/testing";
import { LocationService } from "./location.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

describe("LocationService", () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-api-key"),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
