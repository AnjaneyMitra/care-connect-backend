import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

import { GoogleOauthGuard } from "./guards/google-oauth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post("signup")
  async signup(@Body() userDto: any) {
    return this.authService.register(userDto);
  }

  @Post("login")
  async login(@Body() req) {
    return this.authService
      .validateUser(req.email, req.password)
      .then((user) => {
        if (!user) {
          throw new UnauthorizedException("Invalid credentials");
        }
        return this.authService.login(user);
      });
  }

  @Post("refresh")
  async refresh(@Body("refresh_token") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post("reset-password")
  async resetPassword(
    @Body("token") token: string,
    @Body("password") password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Get("verify")
  async verifyEmail(@Req() req) {
    const token = req.query.token;
    return this.authService.verifyEmail(token);
  }

  @Get("google")
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() req) { }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with token
    // Frontend URL should be configurable, defaulting to localhost:3000
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Redirect to a dedicated callback page on frontend
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`,
    );
  }
}
