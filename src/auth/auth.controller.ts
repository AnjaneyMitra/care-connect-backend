import { Controller, Get, Post, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() userDto: any) {
        return this.authService.register(userDto);
    }

    @Post('login')
    async login(@Body() req) {
        return this.authService.validateUser(req.email, req.password).then((user) => {
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }
            return this.authService.login(user);
        });
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.googleLogin(req.user);
        // Redirect to frontend with token
        const frontendCallbackUrl = `http://localhost:3000/auth/callback?token=${result.access_token}`;
        res.redirect(frontendCallbackUrl);
    }
}
