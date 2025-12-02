import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { LocationModule } from "./location/location.module";
import { ChatModule } from "./chat/chat.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AdminModule } from "./admin/admin.module";
import { RequestsModule } from "./requests/requests.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { AiModule } from "./ai/ai.module";
import { RecurringBookingsModule } from "./recurring-bookings/recurring-bookings.module";
import { AvailabilityModule } from "./availability/availability.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "prisma.env",
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    LocationModule,
    ChatModule,
    BookingsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    RequestsModule,
    AssignmentsModule,
    FavoritesModule,
    AiModule,
    RecurringBookingsModule,
    AvailabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
