import { Test, TestingModule } from "@nestjs/testing";
import { BookingsService } from "./bookings.service";
import { PrismaService } from "../prisma/prisma.service";
import { ChatService } from "../chat/chat.service";

describe("BookingsService", () => {
    let service: BookingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: PrismaService,
                    useValue: {
                        bookings: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                        },
                        jobs: {
                            findUnique: jest.fn(),
                        },
                    },
                },
                {
                    provide: ChatService,
                    useValue: {
                        createChat: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
