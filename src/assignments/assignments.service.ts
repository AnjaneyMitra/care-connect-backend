import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestsService } from '../requests/requests.service';

@Injectable()
export class AssignmentsService {
    constructor(
        private prisma: PrismaService,
        private requestsService: RequestsService,
    ) { }

    async findAllByNanny(nannyId: string) {
        return this.prisma.assignments.findMany({
            where: { nanny_id: nannyId },
            orderBy: { created_at: 'desc' },
            include: {
                service_requests: {
                    include: { users: { include: { profiles: true } } }
                }
            }
        });
    }

    async findPendingByNanny(nannyId: string) {
        return this.prisma.assignments.findMany({
            where: {
                nanny_id: nannyId,
                status: 'pending'
            },
            orderBy: { created_at: 'desc' },
            include: {
                service_requests: {
                    include: { users: { include: { profiles: true } } }
                }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.assignments.findUnique({
            where: { id },
            include: {
                service_requests: {
                    include: { users: { include: { profiles: true } } }
                }
            }
        });
    }

    async accept(id: string, nannyId: string) {
        const assignment = await this.prisma.assignments.findUnique({
            where: { id },
            include: { service_requests: true }
        });

        if (!assignment) throw new NotFoundException('Assignment not found');
        if (assignment.nanny_id !== nannyId) throw new ForbiddenException('Not authorized');
        if (assignment.status !== 'pending') throw new BadRequestException('Assignment is not pending');

        // 1. Update assignment status
        await this.prisma.assignments.update({
            where: { id },
            data: {
                status: 'accepted',
                responded_at: new Date()
            }
        });

        // 2. Update request status
        await this.prisma.service_requests.update({
            where: { id: assignment.request_id },
            data: { status: 'accepted' }
        });

        // 3. Create Booking
        const booking = await this.prisma.bookings.create({
            data: {
                job_id: null, // Not using jobs table anymore for this flow
                parent_id: assignment.service_requests.parent_id,
                nanny_id: nannyId,
                status: 'confirmed',
                start_time: new Date(assignment.service_requests.date.toISOString().split('T')[0] + 'T' + assignment.service_requests.start_time.toISOString().split('T')[1]),
                // Calculate end time based on duration
                end_time: new Date(new Date(assignment.service_requests.date.toISOString().split('T')[0] + 'T' + assignment.service_requests.start_time.toISOString().split('T')[1]).getTime() + Number(assignment.service_requests.duration_hours) * 60 * 60 * 1000),
            }
        });

        return { assignment, booking };
    }

    async reject(id: string, nannyId: string, reason?: string) {
        const assignment = await this.prisma.assignments.findUnique({
            where: { id },
        });

        if (!assignment) throw new NotFoundException('Assignment not found');
        if (assignment.nanny_id !== nannyId) throw new ForbiddenException('Not authorized');
        if (assignment.status !== 'pending') throw new BadRequestException('Assignment is not pending');

        // 1. Update assignment status
        await this.prisma.assignments.update({
            where: { id },
            data: {
                status: 'rejected',
                rejection_reason: reason,
                responded_at: new Date()
            }
        });

        // 2. Trigger re-matching
        // We need to implement a way to exclude this nanny from the next search
        // For now, the simple matching in RequestsService just picks the top one.
        // We need to enhance RequestsService to exclude rejected nannies.

        // For MVP, let's just log it. Real implementation needs exclusion logic.
        console.log(`Assignment ${id} rejected. Triggering re-match...`);

        // Ideally: await this.requestsService.triggerMatching(assignment.request_id, [excludeNannyId]);
        // But triggerMatching signature needs update.

        return { success: true };
    }
}
