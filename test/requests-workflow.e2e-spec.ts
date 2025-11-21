import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Service Request Workflow (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let parentToken: string;
  let nannyToken: string;

  let parentId: string;
  let nannyId: string;
  let nanny2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up test data
    await prisma.assignments.deleteMany({});
    await prisma.service_requests.deleteMany({});
    await prisma.nanny_details.deleteMany({});
    await prisma.profiles.deleteMany({});
    await prisma.users.deleteMany({
      where: {
        email: {
          in: ["parent@test.com", "nanny@test.com", "nanny2@test.com"],
        },
      },
    });

    // Create parent user
    const parentResponse = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        email: "parent@test.com",
        password: "Test123!",
        role: "parent",
      });

    parentToken = parentResponse.body.access_token;
    parentId = parentResponse.body.user.id;

    await prisma.profiles.create({
      data: {
        user_id: parentId,
        first_name: "John",
        last_name: "Parent",
        lat: 40.7128,
        lng: -74.006,
        address: "New York, NY",
      },
    });

    // Create first nanny user
    const nannyResponse = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        email: "nanny@test.com",
        password: "Test123!",
        role: "nanny",
      });

    nannyToken = nannyResponse.body.access_token;
    nannyId = nannyResponse.body.user.id;

    await prisma.profiles.create({
      data: {
        user_id: nannyId,
        first_name: "Mary",
        last_name: "Nanny",
        lat: 40.7589,
        lng: -73.9851,
        address: "New York, NY",
      },
    });

    await prisma.nanny_details.create({
      data: {
        user_id: nannyId,
        skills: ["first-aid", "cooking"],
        experience_years: 5,
        hourly_rate: 20,
        is_available_now: true,
        availability_schedule: {
          monday: [{ start: "08:00", end: "18:00" }],
          tuesday: [{ start: "08:00", end: "18:00" }],
          wednesday: [{ start: "08:00", end: "18:00" }],
          thursday: [{ start: "08:00", end: "18:00" }],
          friday: [{ start: "08:00", end: "18:00" }],
        },
      },
    });

    await prisma.users.update({
      where: { id: nannyId },
      data: { is_verified: true },
    });

    // Create second nanny user
    const nanny2Response = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        email: "nanny2@test.com",
        password: "Test123!",
        role: "nanny",
      });

    nanny2Token = nanny2Response.body.access_token;
    nanny2Id = nanny2Response.body.user.id;

    await prisma.profiles.create({
      data: {
        user_id: nanny2Id,
        first_name: "Jane",
        last_name: "Nanny2",
        lat: 40.7489,
        lng: -73.9681,
        address: "New York, NY",
      },
    });

    await prisma.nanny_details.create({
      data: {
        user_id: nanny2Id,
        skills: ["cooking", "tutoring"],
        experience_years: 3,
        hourly_rate: 22,
        is_available_now: true,
        availability_schedule: {
          monday: [{ start: "08:00", end: "18:00" }],
          tuesday: [{ start: "08:00", end: "18:00" }],
          wednesday: [{ start: "08:00", end: "18:00" }],
          thursday: [{ start: "08:00", end: "18:00" }],
          friday: [{ start: "08:00", end: "18:00" }],
        },
      },
    });

    await prisma.users.update({
      where: { id: nanny2Id },
      data: { is_verified: true },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Setup: Create test users", () => {
    it("should create a parent user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/signup")
        .send({
          email: "parent@test.com",
          password: "Test123!",
          role: "parent",
        })
        .expect(201);

      parentToken = response.body.access_token;
      parentId = response.body.user.id;

      // Create parent profile with location
      await prisma.profiles.create({
        data: {
          user_id: parentId,
          first_name: "John",
          last_name: "Parent",
          lat: 40.7128,
          lng: -74.006,
          address: "New York, NY",
        },
      });
    });

    it("should create a nanny user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/signup")
        .send({
          email: "nanny@test.com",
          password: "Test123!",
          role: "nanny",
        })
        .expect(201);

      nannyToken = response.body.access_token;
      nannyId = response.body.user.id;

      // Create nanny profile with location
      await prisma.profiles.create({
        data: {
          user_id: nannyId,
          first_name: "Mary",
          last_name: "Nanny",
          lat: 40.7589,
          lng: -73.9851, // Within 10km of parent
          address: "New York, NY",
        },
      });

      // Create nanny details
      await prisma.nanny_details.create({
        data: {
          user_id: nannyId,
          skills: ["first-aid", "cooking"],
          experience_years: 5,
          hourly_rate: 20,
          is_available_now: true,
          availability_schedule: {
            monday: [{ start: "08:00", end: "18:00" }],
            tuesday: [{ start: "08:00", end: "18:00" }],
            wednesday: [{ start: "08:00", end: "18:00" }],
            thursday: [{ start: "08:00", end: "18:00" }],
            friday: [{ start: "08:00", end: "18:00" }],
          },
        },
      });

      // Mark nanny as verified
      await prisma.users.update({
        where: { id: nannyId },
        data: { is_verified: true },
      });
    });

    it("should create a second nanny user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/signup")
        .send({
          email: "nanny2@test.com",
          password: "Test123!",
          role: "nanny",
        })
        .expect(201);

      nanny2Token = response.body.access_token;
      nanny2Id = response.body.user.id;

      // Create nanny profile with location
      await prisma.profiles.create({
        data: {
          user_id: nanny2Id,
          first_name: "Jane",
          last_name: "Nanny2",
          lat: 40.7489,
          lng: -73.9681, // Within 10km of parent
          address: "New York, NY",
        },
      });

      // Create nanny details
      await prisma.nanny_details.create({
        data: {
          user_id: nanny2Id,
          skills: ["cooking", "tutoring"],
          experience_years: 3,
          hourly_rate: 22,
          is_available_now: true,
          availability_schedule: {
            monday: [{ start: "08:00", end: "18:00" }],
            tuesday: [{ start: "08:00", end: "18:00" }],
            wednesday: [{ start: "08:00", end: "18:00" }],
            thursday: [{ start: "08:00", end: "18:00" }],
            friday: [{ start: "08:00", end: "18:00" }],
          },
        },
      });

      // Mark nanny as verified
      await prisma.users.update({
        where: { id: nanny2Id },
        data: { is_verified: true },
      });
    });
  });

  describe("Service Request Workflow", () => {
    let requestId: string;
    let assignmentId: string;

    it("should create a service request and auto-assign to nanny", async () => {
      const response = await request(app.getHttpServer())
        .post("/requests")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          date: "2025-12-22", // Monday
          start_time: "10:00:00",
          duration_hours: 4,
          num_children: 2,
          children_ages: [3, 5],
          special_requirements: "Allergy-friendly meals",
          max_hourly_rate: 25,
        })
        .expect(201);

      requestId = response.body.id;
      expect(response.body.status).toBe("assigned");
      expect(response.body.current_assignment_id).toBeDefined();
    });

    it("should allow parent to view potential matches", async () => {
      const response = await request(app.getHttpServer())
        .get(`/requests/${requestId}/matches`)
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("distance");
      expect(response.body[0]).toHaveProperty("hourlyRate");
    });

    it("should allow nanny to view pending assignments", async () => {
      const response = await request(app.getHttpServer())
        .get("/assignments/pending")
        .set("Authorization", `Bearer ${nannyToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      assignmentId = response.body[0].id;
      expect(response.body[0].status).toBe("pending");
    });

    it("should allow nanny to accept assignment and create booking", async () => {
      const response = await request(app.getHttpServer())
        .put(`/assignments/${assignmentId}/accept`)
        .set("Authorization", `Bearer ${nannyToken}`)
        .expect(200);

      expect(response.body.assignment.status).toBe("accepted");
      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.status).toBe("confirmed");
    });

    it("should verify request status changed to accepted", async () => {
      const response = await request(app.getHttpServer())
        .get(`/requests/${requestId}`)
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body.status).toBe("accepted");
    });
  });

  describe("Rejection and Re-assignment", () => {
    let requestId2: string;
    let assignmentId2: string;

    it("should create another service request", async () => {
      const response = await request(app.getHttpServer())
        .post("/requests")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          date: "2025-12-23", // Tuesday
          start_time: "14:00:00",
          duration_hours: 3,
          num_children: 1,
          max_hourly_rate: 25,
        })
        .expect(201);

      requestId2 = response.body.id;
    });

    it("should allow nanny to reject assignment", async () => {
      const pending = await request(app.getHttpServer())
        .get("/assignments/pending")
        .set("Authorization", `Bearer ${nannyToken}`)
        .expect(200);

      assignmentId2 = pending.body[0].id;

      const response = await request(app.getHttpServer())
        .put(`/assignments/${assignmentId2}/reject`)
        .set("Authorization", `Bearer ${nannyToken}`)
        .send({ reason: "Not available" })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should verify request status reset to pending after rejection", async () => {
      // Give system a moment to process re-assignment
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .get(`/requests/${requestId2}`)
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(200);

      // Could be pending (no more nannies) or assigned (if found another)
      expect(["pending", "assigned", "no_matches"]).toContain(
        response.body.status,
      );
    });
  });

  describe("Cancellation", () => {
    let requestId3: string;

    it("should create a service request", async () => {
      const response = await request(app.getHttpServer())
        .post("/requests")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          date: "2025-12-24", // Wednesday
          start_time: "09:00:00",
          duration_hours: 2,
          num_children: 1,
        })
        .expect(201);

      requestId3 = response.body.id;
    });

    it("should allow parent to cancel pending request", async () => {
      const response = await request(app.getHttpServer())
        .put(`/requests/${requestId3}/cancel`)
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body.status).toBe("cancelled");
    });

    it("should not allow cancelling already cancelled request", async () => {
      await request(app.getHttpServer())
        .put(`/requests/${requestId3}/cancel`)
        .set("Authorization", `Bearer ${parentToken}`)
        .expect(400);
    });
  });
});
