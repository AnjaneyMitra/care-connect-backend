import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('signup')
    signup() {
        return 'Signup endpoint';
    }

    @Post('login')
    login() {
        return 'Login endpoint';
    }

    @Post('forgot-password')
    forgotPassword() {
        return 'Forgot password endpoint';
    }

    @Post('reset-password')
    resetPassword() {
        return 'Reset password endpoint';
    }
}
