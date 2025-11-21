import { Controller, Get, Put, Param, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "./admin.guard";

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard) // Require authentication AND admin role
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("bookings")
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Get("stats")
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Put("users/:id/verify")
  async verifyUser(@Param("id") userId: string) {
    return this.adminService.verifyUser(userId);
  }

  @Put("users/:id/ban")
  async banUser(@Param("id") userId: string) {
    return this.adminService.banUser(userId);
  }
}
