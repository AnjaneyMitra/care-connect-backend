import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChatService } from "../chat/chat.service";

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) { }

  async createBooking(
    jobId: string | undefined,
    parentId: string,
    nannyId: string,
    date?: string,
    startTime?: string,
    endTime?: string,
  ) {
    let finalStartTime: Date | undefined;
    let finalEndTime: Date | undefined;

    // 1. If explicit date and times are provided, use them
    if (date && startTime && endTime) {
      // Combine date and time strings (e.g., "2025-11-24" + "T" + "15:30" + ":00")
      // Ensure time format is HH:MM or HH:MM:SS
      const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

      finalStartTime = new Date(`${date}T${formatTime(startTime)}`);
      finalEndTime = new Date(`${date}T${formatTime(endTime)}`);

      if (isNaN(finalStartTime.getTime()) || isNaN(finalEndTime.getTime())) {
        throw new BadRequestException("Invalid date or time format");
      }
    }

    // 2. If no explicit time, try to get from Job
    if (!finalStartTime && jobId) {
      const job = await this.prisma.jobs.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundException("Job not found");
      }
      finalStartTime = job.date;
      // Job doesn't have end time in schema currently, so we leave it null or calculate if duration existed
    }

    // 3. Validate that we have a start time
    if (!finalStartTime) {
      throw new BadRequestException(
        "Date and Start time are required for direct bookings (or provide a valid Job ID)",
      );
    }

    // Create booking with initial status CONFIRMED
    const booking = await this.prisma.bookings.create({
      data: {
        job_id: jobId,
        parent_id: parentId,
        nanny_id: nannyId,
        status: "CONFIRMED",
        start_time: finalStartTime,
        end_time: finalEndTime,
      },
    });

    // Create a chat for this booking
    await this.chatService.createChat(booking.id);

    return booking;
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        jobs: true,
        users_bookings_parent_idTousers: {
          select: {
            id: true,
            profiles: true,
          },
        },
        users_bookings_nanny_idTousers: {
          select: {
            id: true,
            profiles: true,
            nanny_details: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async getBookingsByParent(parentId: string) {
    return this.prisma.bookings.findMany({
      where: { parent_id: parentId },
      include: {
        users_bookings_nanny_idTousers: {
          select: {
            id: true,
            profiles: true,
          },
        },
        jobs: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getBookingsByNanny(nannyId: string) {
    return this.prisma.bookings.findMany({
      where: { nanny_id: nannyId },
      include: {
        users_bookings_parent_idTousers: {
          select: {
            id: true,
            profiles: true,
          },
        },
        jobs: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async startBooking(id: string) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("Booking must be CONFIRMED to start");
    }

    return this.prisma.bookings.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        start_time: new Date(), // Update actual start time
      },
    });
  }

  async completeBooking(id: string) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== "IN_PROGRESS") {
      throw new BadRequestException("Booking must be IN_PROGRESS to complete");
    }

    return this.prisma.bookings.update({
      where: { id },
      data: {
        status: "COMPLETED",
        end_time: new Date(), // Capture actual end time
      },
    });
  }

  async cancelBooking(id: string, reason?: string) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new BadRequestException(
        "Cannot cancel a completed or already cancelled booking",
      );
    }

    // Ideally store the cancellation reason in a separate table or a new column
    // For now, just updating status
    return this.prisma.bookings.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  }

  async getActiveBookings(userId: string, role: "parent" | "nanny") {
    const whereClause =
      role === "parent" ? { parent_id: userId } : { nanny_id: userId };
    return this.prisma.bookings.findMany({
      where: {
        ...whereClause,
        status: {
          in: ["CONFIRMED", "IN_PROGRESS"],
        },
      },
      include: {
        jobs: true,
        users_bookings_nanny_idTousers:
          role === "parent" ? { select: { profiles: true } } : undefined,
        users_bookings_parent_idTousers:
          role === "nanny" ? { select: { profiles: true } } : undefined,
      },
    });
  }
}
