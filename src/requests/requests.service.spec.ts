import { Test, TestingModule } from "@nestjs/testing";
import { RequestsService } from "./requests.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";

describe("RequestsService", () => {
  let service: RequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: PrismaService,
          useValue: {
            service_requests: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            assignments: {
              create: jest.fn(),
            },
            $queryRawUnsafe: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendPushNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
