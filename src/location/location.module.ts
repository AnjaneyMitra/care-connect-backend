import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LocationService } from "./location.service";
import { LocationController } from "./location.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService], // Export for use in other modules
})
export class LocationModule {}
