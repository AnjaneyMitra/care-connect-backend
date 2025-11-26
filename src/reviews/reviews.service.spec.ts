import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateReviewDto } from './dto';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        bookings: {
            findUnique: jest.fn(),
        },
        reviews: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createReview', () => {
        const createReviewDto: CreateReviewDto = {
            bookingId: 'booking-123',
            rating: 5,
            comment: 'Great service!',
            ratingPunctuality: 5,
            ratingProfessionalism: 5,
            ratingCareQuality: 5,
            ratingCommunication: 5,
        };

        it('should create a review with rating categories', async () => {
            const mockBooking = {
                id: 'booking-123',
                parent_id: 'parent-123',
                nanny_id: 'nanny-123',
                status: 'COMPLETED',
            };

            const mockReview = {
                id: 'review-123',
                booking_id: 'booking-123',
                reviewer_id: 'parent-123',
                reviewee_id: 'nanny-123',
                rating: 5,
                comment: 'Great service!',
                rating_punctuality: 5,
                rating_professionalism: 5,
                rating_care_quality: 5,
                rating_communication: 5,
            };

            mockPrismaService.bookings.findUnique.mockResolvedValue(mockBooking);
            mockPrismaService.reviews.findFirst.mockResolvedValue(null);
            mockPrismaService.reviews.create.mockResolvedValue(mockReview);

            const result = await service.createReview('parent-123', createReviewDto);

            expect(result).toEqual(mockReview);
            expect(mockPrismaService.reviews.create).toHaveBeenCalledWith({
                data: {
                    booking_id: 'booking-123',
                    reviewer_id: 'parent-123',
                    reviewee_id: 'nanny-123',
                    rating: 5,
                    comment: 'Great service!',
                    rating_punctuality: 5,
                    rating_professionalism: 5,
                    rating_care_quality: 5,
                    rating_communication: 5,
                },
            });
        });

        it('should throw NotFoundException if booking not found', async () => {
            mockPrismaService.bookings.findUnique.mockResolvedValue(null);

            await expect(
                service.createReview('parent-123', createReviewDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if booking not completed', async () => {
            const mockBooking = {
                id: 'booking-123',
                parent_id: 'parent-123',
                nanny_id: 'nanny-123',
                status: 'IN_PROGRESS',
            };

            mockPrismaService.bookings.findUnique.mockResolvedValue(mockBooking);

            await expect(
                service.createReview('parent-123', createReviewDto),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if review already exists', async () => {
            const mockBooking = {
                id: 'booking-123',
                parent_id: 'parent-123',
                nanny_id: 'nanny-123',
                status: 'COMPLETED',
            };

            const existingReview = { id: 'existing-review' };

            mockPrismaService.bookings.findUnique.mockResolvedValue(mockBooking);
            mockPrismaService.reviews.findFirst.mockResolvedValue(existingReview);

            await expect(
                service.createReview('parent-123', createReviewDto),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateReview', () => {
        it('should update review within 24 hours', async () => {
            const mockReview = {
                id: 'review-123',
                reviewer_id: 'parent-123',
                created_at: new Date(),
            };

            const updateDto = {
                rating: 4,
                comment: 'Updated comment',
            };

            mockPrismaService.reviews.findUnique.mockResolvedValue(mockReview);
            mockPrismaService.reviews.update.mockResolvedValue({
                ...mockReview,
                ...updateDto,
            });

            const result = await service.updateReview('review-123', 'parent-123', updateDto);

            expect(result).toBeDefined();
            expect(mockPrismaService.reviews.update).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user is not the reviewer', async () => {
            const mockReview = {
                id: 'review-123',
                reviewer_id: 'parent-123',
                created_at: new Date(),
            };

            mockPrismaService.reviews.findUnique.mockResolvedValue(mockReview);

            await expect(
                service.updateReview('review-123', 'different-user', { rating: 4 }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if review is older than 24 hours', async () => {
            const oldDate = new Date();
            oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago

            const mockReview = {
                id: 'review-123',
                reviewer_id: 'parent-123',
                created_at: oldDate,
            };

            mockPrismaService.reviews.findUnique.mockResolvedValue(mockReview);

            await expect(
                service.updateReview('review-123', 'parent-123', { rating: 4 }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteReview', () => {
        it('should delete review if user is admin', async () => {
            const mockReview = { id: 'review-123' };

            mockPrismaService.reviews.findUnique.mockResolvedValue(mockReview);
            mockPrismaService.reviews.delete.mockResolvedValue(mockReview);

            const result = await service.deleteReview('review-123', 'admin-123', true);

            expect(result).toEqual({ message: 'Review deleted successfully' });
            expect(mockPrismaService.reviews.delete).toHaveBeenCalledWith({
                where: { id: 'review-123' },
            });
        });

        it('should throw ForbiddenException if user is not admin', async () => {
            const mockReview = { id: 'review-123' };

            mockPrismaService.reviews.findUnique.mockResolvedValue(mockReview);

            await expect(
                service.deleteReview('review-123', 'user-123', false),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getReviewsForNanny', () => {
        it('should return reviews with averages for nanny', async () => {
            const mockReviews = [
                {
                    id: 'review-1',
                    rating: 5,
                    rating_punctuality: 5,
                    rating_professionalism: 5,
                    rating_care_quality: 5,
                    rating_communication: 5,
                },
                {
                    id: 'review-2',
                    rating: 4,
                    rating_punctuality: 4,
                    rating_professionalism: 4,
                    rating_care_quality: 4,
                    rating_communication: 4,
                },
            ];

            mockPrismaService.reviews.findMany.mockResolvedValue(mockReviews);

            const result = await service.getReviewsForNanny('nanny-123');

            expect(result.reviews).toEqual(mockReviews);
            expect(result.totalReviews).toBe(2);
            expect(result.averages.overall).toBe(4.5);
            expect(result.averages.punctuality).toBe(4.5);
        });
    });

    describe('getReviewsForParent', () => {
        it('should return reviews with averages for parent', async () => {
            const mockReviews = [
                {
                    id: 'review-1',
                    rating: 5,
                    rating_punctuality: 5,
                    rating_professionalism: 5,
                    rating_care_quality: 5,
                    rating_communication: 5,
                },
            ];

            mockPrismaService.reviews.findMany.mockResolvedValue(mockReviews);

            const result = await service.getReviewsForParent('parent-123');

            expect(result.reviews).toEqual(mockReviews);
            expect(result.totalReviews).toBe(1);
            expect(result.averages.overall).toBe(5);
        });
    });
});
