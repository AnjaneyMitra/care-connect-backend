# Google OAuth Implementation Guide

## Overview
This guide explains how to implement Google OAuth alongside your existing email/password authentication in NestJS.

## Database Changes ✅ (Already Applied)
- `password_hash` is now nullable
- Added `oauth_provider` field (e.g., 'google', 'facebook')
- Added `oauth_provider_id` field (unique ID from OAuth provider)
- Added `oauth_access_token` and `oauth_refresh_token` fields (optional)
- Added unique constraint on (oauth_provider, oauth_provider_id)

## Implementation Steps

### 1. Install Required Packages
```bash
npm install @nestjs/passport passport passport-google-oauth20
npm install --save-dev @types/passport-google-oauth20
```

### 2. Set Up Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Set authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 3. Update Environment Variables
Add to your `.env` file:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT (if not already set)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d
```

### 4. Create Google OAuth Strategy
Create `src/auth/strategies/google.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      oauth_provider: 'google',
      oauth_provider_id: id,
      email: emails[0].value,
      first_name: name.givenName,
      last_name: name.familyName,
      profile_image_url: photos[0].value,
      oauth_access_token: accessToken,
      oauth_refresh_token: refreshToken,
    };
    
    done(null, user);
  }
}
```

### 5. Update Auth Service
Add OAuth methods to `src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Existing email/password login
  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.generateJwtToken(user);
  }

  // Google OAuth login/signup
  async googleLogin(googleUser: any) {
    // Try to find existing user by OAuth provider
    let user = await this.usersRepository.findOne({
      where: {
        oauth_provider: 'google',
        oauth_provider_id: googleUser.oauth_provider_id,
      },
    });

    // If not found, try to find by email (user might have signed up with email/password)
    if (!user) {
      user = await this.usersRepository.findOne({
        where: { email: googleUser.email },
      });

      // If found by email, link Google account
      if (user) {
        user.oauth_provider = 'google';
        user.oauth_provider_id = googleUser.oauth_provider_id;
        user.oauth_access_token = googleUser.oauth_access_token;
        user.oauth_refresh_token = googleUser.oauth_refresh_token;
        user.is_verified = true; // Email verified by Google
        await this.usersRepository.save(user);
      }
    }

    // If still not found, create new user
    if (!user) {
      user = this.usersRepository.create({
        email: googleUser.email,
        oauth_provider: 'google',
        oauth_provider_id: googleUser.oauth_provider_id,
        oauth_access_token: googleUser.oauth_access_token,
        oauth_refresh_token: googleUser.oauth_refresh_token,
        role: 'parent', // Set default role
        is_verified: true, // Email verified by Google
      });
      await this.usersRepository.save(user);

      // Create profile
      // You'll need to create the profile record here too
    }

    return this.generateJwtToken(user);
  }

  private generateJwtToken(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

### 6. Create Auth Controller Endpoints
Add to `src/auth/auth.controller.ts`:

```typescript
import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Existing email/password login
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // Google OAuth - Step 1: Redirect to Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth flow
  }

  // Google OAuth - Step 2: Handle callback from Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);
    
    // Redirect to frontend with JWT token
    // Option 1: Redirect with token in URL (less secure)
    res.redirect(`http://localhost:3001/auth/success?token=${result.access_token}`);
    
    // Option 2: Set HTTP-only cookie (more secure)
    // res.cookie('access_token', result.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    // });
    // res.redirect('http://localhost:3001/dashboard');
  }
}
```

### 7. Update Auth Module
Update `src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## Frontend Integration

### React/Next.js Example
```typescript
// Simple button to initiate Google OAuth
<button onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
  Sign in with Google
</button>

// Handle the callback
// src/pages/auth/success.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthSuccess() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      // Store token
      localStorage.setItem('access_token', token as string);
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [token, router]);

  return <div>Logging you in...</div>;
}
```

## Testing

### Manual Testing
1. Start your backend: `npm run start:dev`
2. Visit: `http://localhost:3000/auth/google`
3. Complete Google sign-in
4. Check if user is created in database
5. Verify JWT token is returned

### Database Verification
```sql
-- Check OAuth users
SELECT id, email, oauth_provider, oauth_provider_id, is_verified 
FROM users 
WHERE oauth_provider = 'google';
```

## Security Considerations

1. **Never expose OAuth tokens** in frontend or logs
2. **Use HTTPS in production** for OAuth callbacks
3. **Validate redirect URIs** to prevent redirect attacks
4. **Store tokens securely** - consider encrypting them in DB
5. **Implement rate limiting** on auth endpoints
6. **Add CORS configuration** to allow only your frontend domain

## Common Issues & Solutions

### Issue: "Redirect URI mismatch"
- Ensure the callback URL in Google Console matches exactly with your code
- Check for trailing slashes

### Issue: "User already exists with different auth method"
- Handle account linking as shown in the `googleLogin` method above

### Issue: "Cannot read property 'user' of undefined"
- Ensure GoogleStrategy is properly registered in AuthModule
- Check passport session configuration

## Next Steps

1. ✅ Database schema updated
2. ⏳ Install npm packages
3. ⏳ Configure Google Cloud Console
4. ⏳ Add environment variables
5. ⏳ Implement strategies and services
6. ⏳ Test OAuth flow
7. ⏳ Integrate with frontend

## Additional OAuth Providers

To add Facebook, GitHub, or other providers:
1. Add similar columns with provider name
2. Install respective passport strategy
3. Create strategy file
4. Add controller endpoints
5. Update auth service

The database schema is already flexible to support multiple OAuth providers!
