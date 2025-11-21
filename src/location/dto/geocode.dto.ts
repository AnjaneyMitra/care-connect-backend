import { IsNotEmpty, IsString } from "class-validator";

export class GeocodeAddressDto {
  @IsNotEmpty()
  @IsString()
  address: string;
}
