import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateReviewDto, UpdateReviewDto } from "./dto";

@Controller("reviews")
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async createReview(
        @Body() createReviewDto: CreateReviewDto,
        @Request() req,
    ) {
        return this.reviewsService.createReview(
            req.user.id,
            createReviewDto,
        );
    }

    @Put(":id")
    @UseGuards(AuthGuard("jwt"))
    async updateReview(
        @Param("id") id: string,
        @Body() updateReviewDto: UpdateReviewDto,
        @Request() req,
    ) {
        return this.reviewsService.updateReview(id, req.user.id, updateReviewDto);
    }

    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    async deleteReview(@Param("id") id: string, @Request() req) {
        const isAdmin = req.user.role === "admin";
        return this.reviewsService.deleteReview(id, req.user.id, isAdmin);
    }

    @Get("nanny/:id")
    async getNannyReviews(@Param("id") id: string) {
        return this.reviewsService.getReviewsForNanny(id);
    }

    @Get("parent/:id")
    async getParentReviews(@Param("id") id: string) {
        return this.reviewsService.getReviewsForParent(id);
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
