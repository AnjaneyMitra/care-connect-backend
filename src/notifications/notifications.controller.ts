import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("send")
  @UseGuards(AuthGuard("jwt")) // Only authenticated users (or admin) should trigger this manually
  async sendNotification(
    @Body()
    body: {
      type: "email" | "push" | "sms";
      to: string;
      subject?: string;
      content: string;
    },
  ) {
    switch (body.type) {
      case "email":
        return this.notificationsService.sendEmail(
          body.to,
          body.subject || "Notification",
          body.content,
        );
      case "push":
        return this.notificationsService.sendPushNotification(
          body.to,
          body.subject || "Notification",
          body.content,
        );
      case "sms":
        return this.notificationsService.sendSms(body.to, body.content);
      default:
        return { success: false, message: "Invalid notification type" };
    }
  }
}
