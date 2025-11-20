import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySearchDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(-90)
    @Max(90)
    lat: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(-180)
    @Max(180)
    lng: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    radius?: number = 10; // Default 10km
}
