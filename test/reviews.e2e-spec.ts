import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Reviews (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let parentToken: string;
    let nannyToken: string;
    let adminToken: string;
    let parentId: string;
    let nannyId: string;
    let adminId: string;
    let bookingId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);

        // Create test users
        const parent = await prisma.users.create({
            data: {
                email: 'parent-review-test@test.com',
                password_hash: 'hashed',
                role: 'parent',
                is_verified: true,
            },
        });
        parentId = parent.id;

        const nanny = await prisma.users.create({
            data: {
                email: 'nanny-review-test@test.com',
                password_hash: 'hashed',
                role: 'nanny',
                is_verified: true,
            },
        });
        nannyId = nanny.id;

        const admin = await prisma.users.create({
            data: {
                email: 'admin-review-test@test.com',
                password_hash: 'hashed',
                role: 'admin',
                is_verified: true,
            },
        });
        adminId = admin.id;

        // Create a completed booking
        const booking = await prisma.bookings.create({
            data: {
                parent_id: parentId,
                nanny_id: nannyId,
                status: 'COMPLETED',
                start_time: new Date(),
                end_time: new Date(),
            },
        });
        bookingId = booking.id;

        // Get auth tokens (simplified - in real tests you'd call the auth endpoint)
        parentToken = 'mock-parent-token';
        nannyToken = 'mock-nanny-token';
        adminToken = 'mock-admin-token';
    });

    afterAll(async () => {
        // Cleanup
        await prisma.reviews.deleteMany({
            where: {
                OR: [
                    { reviewer_id: parentId },
                    { reviewer_id: nannyId },
                    { reviewee_id: parentId },
                    { reviewee_id: nannyId },
                ],
            },
        });
        await prisma.bookings.deleteMany({ where: { id: bookingId } });
        await prisma.users.deleteMany({
            where: {
                id: { in: [parentId, nannyId, adminId] },
            },
        });
        await app.close();
    });

    describe('POST /reviews', () => {
        it('should create a review with rating categories', () => {
            return request(app.getHttpServer())
                .post('/reviews')
                .set('Authorization', `Bearer ${parentToken}`)
                .send({
                    bookingId,
                    rating: 5,
                    comment: 'Excellent nanny!',
                    ratingPunctuality: 5,
                    ratingProfessionalism: 5,
                    ratingCareQuality: 5,
                    ratingCommunication: 5,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.rating).toBe(5);
                    expect(res.body.rating_punctuality).toBe(5);
                });
        });

        it('should fail without rating categories', () => {
            return request(app.getHttpServer())
                .post('/reviews')
                .set('Authorization', `Bearer ${nannyToken}`)
                .send({
                    bookingId,
                    rating: 4,
                    comment: 'Good parent',
                })
                .expect(400);
        });
    });

    describe('GET /reviews/nanny/:id', () => {
        it('should get all reviews for a nanny with averages', async () => {
            const response = await request(app.getHttpServer())
                .get(`/reviews/nanny/${nannyId}`)
                .expect(200);

            expect(response.body).toHaveProperty('reviews');
            expect(response.body).toHaveProperty('averages');
            expect(response.body).toHaveProperty('totalReviews');
            expect(response.body.averages).toHaveProperty('overall');
            expect(response.body.averages).toHaveProperty('punctuality');
            expect(response.body.averages).toHaveProperty('professionalism');
            expect(response.body.averages).toHaveProperty('careQuality');
            expect(response.body.averages).toHaveProperty('communication');
        });
    });

    describe('GET /reviews/parent/:id', () => {
        it('should get all reviews for a parent with averages', async () => {
            const response = await request(app.getHttpServer())
                .get(`/reviews/parent/${parentId}`)
                .expect(200);

            expect(response.body).toHaveProperty('reviews');
            expect(response.body).toHaveProperty('averages');
            expect(response.body).toHaveProperty('totalReviews');
        });
    });

    describe('PUT /reviews/:id', () => {
        let reviewId: string;

        beforeEach(async () => {
            // Create a review to update
            const review = await prisma.reviews.create({
                data: {
                    booking_id: bookingId,
                    reviewer_id: parentId,
                    reviewee_id: nannyId,
                    rating: 4,
                    comment: 'Good',
                    rating_punctuality: 4,
                    rating_professionalism: 4,
                    rating_care_quality: 4,
                    rating_communication: 4,
                },
            });
            reviewId = review.id;
        });

        it('should update review within 24 hours', () => {
            return request(app.getHttpServer())
                .put(`/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${parentToken}`)
                .send({
                    rating: 5,
                    comment: 'Updated to excellent!',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.rating).toBe(5);
                    expect(res.body.comment).toBe('Updated to excellent!');
                });
        });

        it('should fail to update if not the reviewer', () => {
            return request(app.getHttpServer())
                .put(`/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${nannyToken}`)
                .send({
                    rating: 5,
                })
                .expect(403);
        });
    });

    describe('DELETE /reviews/:id', () => {
        let reviewId: string;

        beforeEach(async () => {
            const review = await prisma.reviews.create({
                data: {
                    booking_id: bookingId,
                    reviewer_id: parentId,
                    reviewee_id: nannyId,
                    rating: 3,
                    comment: 'To be deleted',
                    rating_punctuality: 3,
                    rating_professionalism: 3,
                    rating_care_quality: 3,
                    rating_communication: 3,
                },
            });
            reviewId = review.id;
        });

        it('should delete review as admin', () => {
            return request(app.getHttpServer())
                .delete(`/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe('Review deleted successfully');
                });
        });

        it('should fail to delete review as non-admin', () => {
            return request(app.getHttpServer())
                .delete(`/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${parentToken}`)
                .expect(403);
        });
    });

    describe('GET /reviews/booking/:bookingId', () => {
        it('should get all reviews for a booking', async () => {
            const response = await request(app.getHttpServer())
                .get(`/reviews/booking/${bookingId}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
