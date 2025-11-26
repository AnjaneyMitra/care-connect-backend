import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async createReview(
        reviewerId: string,
        createReviewDto: CreateReviewDto,
    ) {
        const { bookingId, rating, comment, ratingPunctuality, ratingProfessionalism, ratingCareQuality, ratingCommunication } = createReviewDto;

        // 1. Validate booking exists
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // 2. Validate booking status (must be COMPLETED)
        if (booking.status !== 'COMPLETED') {
            throw new BadRequestException('Can only review completed bookings');
        }

        // 3. Determine reviewee (the other party)
        let revieweeId: string;
        if (reviewerId === booking.parent_id) {
            revieweeId = booking.nanny_id;
        } else if (reviewerId === booking.nanny_id) {
            revieweeId = booking.parent_id;
        } else {
            throw new BadRequestException('User is not part of this booking');
        }

        // 4. Check if review already exists
        const existingReview = await this.prisma.reviews.findFirst({
            where: {
                booking_id: bookingId,
                reviewer_id: reviewerId,
            },
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this booking');
        }

        // 5. Create review with rating categories
        return this.prisma.reviews.create({
            data: {
                booking_id: bookingId,
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                rating,
                comment,
                rating_punctuality: ratingPunctuality,
                rating_professionalism: ratingProfessionalism,
                rating_care_quality: ratingCareQuality,
                rating_communication: ratingCommunication,
            },
        });
    }

    async updateReview(
        reviewId: string,
        userId: string,
        updateReviewDto: UpdateReviewDto,
    ) {
        // 1. Find the review
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // 2. Check ownership
        if (review.reviewer_id !== userId) {
            throw new ForbiddenException('You can only edit your own reviews');
        }

        // 3. Check if within edit window (24 hours)
        const hoursSinceCreation = (Date.now() - new Date(review.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            throw new BadRequestException('Reviews can only be edited within 24 hours of creation');
        }

        // 4. Update review
        const { bookingId, ratingPunctuality, ratingProfessionalism, ratingCareQuality, ratingCommunication, ...updateData } = updateReviewDto;

        const dataToUpdate: any = {
            ...updateData,
            updated_at: new Date(),
        };

        // Only update rating categories if they are provided
        if (ratingPunctuality !== undefined) {
            dataToUpdate.rating_punctuality = ratingPunctuality;
        }
        if (ratingProfessionalism !== undefined) {
            dataToUpdate.rating_professionalism = ratingProfessionalism;
        }
        if (ratingCareQuality !== undefined) {
            dataToUpdate.rating_care_quality = ratingCareQuality;
        }
        if (ratingCommunication !== undefined) {
            dataToUpdate.rating_communication = ratingCommunication;
        }

        return this.prisma.reviews.update({
            where: { id: reviewId },
            data: dataToUpdate,
        });
    }

    async deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
        // 1. Find the review
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // 2. Check authorization (admin only)
        if (!isAdmin) {
            throw new ForbiddenException('Only administrators can delete reviews');
        }

        // 3. Delete review
        await this.prisma.reviews.delete({
            where: { id: reviewId },
        });

        return { message: 'Review deleted successfully' };
    }

    async getReviewsForUser(userId: string) {
        return this.prisma.reviews.findMany({
            where: {
                reviewee_id: userId,
            },
            include: {
                users_reviews_reviewer_idTousers: {
                    select: {
                        id: true,
                        profiles: {
                            select: {
                                first_name: true,
                                last_name: true,
                                profile_image_url: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async getReviewsForNanny(nannyId: string) {
        // Get all reviews for this nanny
        const reviews = await this.prisma.reviews.findMany({
            where: {
                reviewee_id: nannyId,
            },
            include: {
                users_reviews_reviewer_idTousers: {
                    select: {
                        id: true,
                        role: true,
                        profiles: {
                            select: {
                                first_name: true,
                                last_name: true,
                                profile_image_url: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        // Calculate averages
        const averages = this.calculateAverages(reviews);

        return {
            reviews,
            averages,
            totalReviews: reviews.length,
        };
    }

    async getReviewsForParent(parentId: string) {
        // Get all reviews for this parent
        const reviews = await this.prisma.reviews.findMany({
            where: {
                reviewee_id: parentId,
            },
            include: {
                users_reviews_reviewer_idTousers: {
                    select: {
                        id: true,
                        role: true,
                        profiles: {
                            select: {
                                first_name: true,
                                last_name: true,
                                profile_image_url: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        // Calculate averages
        const averages = this.calculateAverages(reviews);

        return {
            reviews,
            averages,
            totalReviews: reviews.length,
        };
    }

    async getReviewForBooking(bookingId: string) {
        return this.prisma.reviews.findMany({
            where: { booking_id: bookingId },
            include: {
                users_reviews_reviewer_idTousers: {
                    select: {
                        id: true,
                        profiles: {
                            select: {
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                }
            }
        })
    }

    private calculateAverages(reviews: any[]) {
        if (reviews.length === 0) {
            return {
                overall: 0,
                punctuality: 0,
                professionalism: 0,
                careQuality: 0,
                communication: 0,
            };
        }

        const sum = reviews.reduce(
            (acc, review) => ({
                overall: acc.overall + (review.rating || 0),
                punctuality: acc.punctuality + (review.rating_punctuality || 0),
                professionalism: acc.professionalism + (review.rating_professionalism || 0),
                careQuality: acc.careQuality + (review.rating_care_quality || 0),
                communication: acc.communication + (review.rating_communication || 0),
            }),
            { overall: 0, punctuality: 0, professionalism: 0, careQuality: 0, communication: 0 }
        );

        return {
            overall: Number((sum.overall / reviews.length).toFixed(2)),
            punctuality: Number((sum.punctuality / reviews.length).toFixed(2)),
            professionalism: Number((sum.professionalism / reviews.length).toFixed(2)),
            careQuality: Number((sum.careQuality / reviews.length).toFixed(2)),
            communication: Number((sum.communication / reviews.length).toFixed(2)),
        };
    }
}
