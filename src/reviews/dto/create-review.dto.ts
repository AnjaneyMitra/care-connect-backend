import { IsString, IsInt, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingPunctuality: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingProfessionalism: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingCareQuality: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingCommunication: number;
}
