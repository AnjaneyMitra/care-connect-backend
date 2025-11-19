import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: {
                profiles: true,
                nanny_details: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const {
            firstName,
            lastName,
            phone,
            address,
            lat,
            lng,
            profileImageUrl,
            skills,
            experienceYears,
            hourlyRate,
            bio,
            availabilitySchedule,
        } = updateUserDto;

        // Update basic profile info
        if (firstName || lastName || phone || address || lat || lng || profileImageUrl) {
            await this.prisma.profiles.upsert({
                where: { user_id: id },
                update: {
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    address,
                    lat,
                    lng,
                    profile_image_url: profileImageUrl,
                    updated_at: new Date(),
                },
                create: {
                    user_id: id,
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    address,
                    lat,
                    lng,
                    profile_image_url: profileImageUrl,
                },
            });
        }

        // Update nanny details if provided
        if (skills || experienceYears || hourlyRate || bio || availabilitySchedule) {
            await this.prisma.nanny_details.upsert({
                where: { user_id: id },
                update: {
                    skills: skills,
                    experience_years: experienceYears,
                    hourly_rate: hourlyRate,
                    bio,
                    availability_schedule: availabilitySchedule,
                    updated_at: new Date(),
                },
                create: {
                    user_id: id,
                    skills: skills || [],
                    experience_years: experienceYears,
                    hourly_rate: hourlyRate,
                    bio,
                    availability_schedule: availabilitySchedule,
                },
            });
        }

        return this.findOne(id);
    }

    async uploadImage(id: string, fileUrl: string) {
        return this.prisma.profiles.upsert({
            where: { user_id: id },
            update: {
                profile_image_url: fileUrl,
                updated_at: new Date(),
            },
            create: {
                user_id: id,
                profile_image_url: fileUrl,
            },
        });
    }
}
