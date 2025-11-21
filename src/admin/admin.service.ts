import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers() {
        return this.prisma.users.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                email: true,
                role: true,
                is_verified: true,
                created_at: true,
                profiles: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
    }

    async getAllBookings() {
        return this.prisma.bookings.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                jobs: true,
                users_bookings_parent_idTousers: {
                    select: { email: true },
                },
                users_bookings_nanny_idTousers: {
                    select: { email: true },
                },
            },
        });
    }

    async verifyUser(userId: string) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { is_verified: true },
        });
    }

    async banUser(userId: string) {
        // In a real app, you might have a 'status' field (active, banned, suspended).
        // For now, we'll just revoke verification or add a comment. 
        // Let's assume we toggle is_verified to false for now as a simple "ban".
        return this.prisma.users.update({
            where: { id: userId },
            data: { is_verified: false }
        });
    }

    async getSystemStats() {
        const totalUsers = await this.prisma.users.count();
        const totalBookings = await this.prisma.bookings.count();
        const activeBookings = await this.prisma.bookings.count({
            where: { status: 'IN_PROGRESS' }
        });

        return {
            totalUsers,
            totalBookings,
            activeBookings
        };
    }
}
