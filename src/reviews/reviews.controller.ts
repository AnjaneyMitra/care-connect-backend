import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async createReview(
    @Body() body: { bookingId: string; rating: number; comment: string },
    @Request() req,
  ) {
    return this.reviewsService.createReview(
      body.bookingId,
      req.user.id,
      body.rating,
      body.comment,
    );
  }

  @Get("user/:userId")
  async getUserReviews(@Param("userId") userId: string) {
    return this.reviewsService.getReviewsForUser(userId);
  }

  @Get("booking/:bookingId")
  async getBookingReviews(@Param("bookingId") bookingId: string) {
    return this.reviewsService.getReviewForBooking(bookingId);
  }
}
