import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    bookingId: string,
    reviewerId: string,
    rating: number,
    comment: string,
  ) {
    // 1. Validate booking exists
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // 2. Validate booking status (must be COMPLETED)
    if (booking.status !== "COMPLETED") {
      throw new BadRequestException("Can only review completed bookings");
    }

    // 3. Determine reviewee (the other party)
    let revieweeId: string;
    if (reviewerId === booking.parent_id) {
      revieweeId = booking.nanny_id;
    } else if (reviewerId === booking.nanny_id) {
      revieweeId = booking.parent_id;
    } else {
      throw new BadRequestException("User is not part of this booking");
    }

    // 4. Check if review already exists
    const existingReview = await this.prisma.reviews.findFirst({
      where: {
        booking_id: bookingId,
        reviewer_id: reviewerId,
      },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this booking");
    }

    // 5. Create review
    return this.prisma.reviews.create({
      data: {
        booking_id: bookingId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
      },
    });
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
        created_at: "desc",
      },
    });
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
                last_name: true,
              },
            },
          },
        },
      },
    });
  }
}
