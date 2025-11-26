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
        console.log('Google callback hit');
        const result = await this.authService.googleLogin(req.user);
        console.log('Login result:', { ...result, access_token: 'HIDDEN' });

        // Get frontend URL from environment or use default
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Determine redirect path based on user role
        const redirectPath = result.user.role === 'parent' ? '/browse' : '/dashboard';

        // Redirect to frontend with token and user data
        const redirectUrl = `${frontendUrl}${redirectPath}?token=${result.access_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    }
}
