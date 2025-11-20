import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { users } from "@prisma/client";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // Auth-related methods
  async create(data: Prisma.usersCreateInput): Promise<users> {
    return this.prisma.users.create({
      data,
    });
  }

  async findOneByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findByOAuth(
    provider: string,
    providerId: string,
  ): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: {
        oauth_provider_oauth_provider_id: {
          oauth_provider: provider,
          oauth_provider_id: providerId,
        },
      },
    });
  }

  async findByVerificationToken(token: string): Promise<users | null> {
    return this.prisma.users.findFirst({
      where: { verification_token: token },
    });
  }

  async findByResetToken(token: string): Promise<users | null> {
    return this.prisma.users.findFirst({
      where: { reset_password_token: token },
    });
  }

  // Profile management methods
  async findAllNannies() {
    const nannies = await this.prisma.users.findMany({
      where: { role: 'nanny' },
      include: {
        profiles: true,
        nanny_details: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Exclude sensitive fields
    return nannies.map(({ password_hash, oauth_access_token, oauth_refresh_token, verification_token, reset_password_token, verification_token_expires, reset_password_token_expires, ...nanny }) => nanny);
  }

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

  async update(id: string, updateUserDto: UpdateUserDto | Prisma.usersUpdateInput) {
    // Handle both UpdateUserDto and Prisma.usersUpdateInput
    if ('firstName' in updateUserDto || 'lastName' in updateUserDto) {
      // Handle UpdateUserDto
      const dto = updateUserDto as UpdateUserDto;
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
      } = dto;

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
    } else {
      // Handle Prisma.usersUpdateInput (for auth updates)
      return this.prisma.users.update({
        where: { id },
        data: updateUserDto as Prisma.usersUpdateInput,
      });
    }
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
