import { IsString, IsOptional, IsNumber, IsArray, IsObject } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
    @IsNumber()
    lng?: number;

    @IsOptional()
    @IsString()
    profileImageUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @IsOptional()
    @IsNumber()
    experienceYears?: number;

    @IsOptional()
    @IsNumber()
    hourlyRate?: number;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsObject()
    availabilitySchedule?: any;
}
