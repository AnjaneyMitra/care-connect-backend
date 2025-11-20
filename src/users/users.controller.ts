import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  @Get("nannies")
  getAllNannies() {
    return this.usersService.findAllNannies();
  }

  @Get(":id")
  getUser(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post("upload-image")
  uploadImage(@Body() body: { userId: string; imageUrl: string }) {
    return this.usersService.uploadImage(body.userId, body.imageUrl);
  }
}
