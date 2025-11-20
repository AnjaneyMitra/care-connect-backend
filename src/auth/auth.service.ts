import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    async register(userDto: any) {
        const hashedPassword = await bcrypt.hash(userDto.password, 10);
        const user = await this.usersService.create({
            email: userDto.email,
            password_hash: hashedPassword,
            role: 'parent', // Default role, can be changed
            first_name: userDto.firstName, // Assuming these fields exist in DTO
            last_name: userDto.lastName,
        } as any); // Casting to any because DTO might not match exact Prisma input if we have extra fields or need transformation

        // We might need to create a profile here too, but for now just user

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }

    async googleLogin(googleUser: any) {
        let user = await this.usersService.findByOAuth('google', googleUser.oauth_provider_id);

        if (!user) {
            // Check if user exists by email
            user = await this.usersService.findOneByEmail(googleUser.email);

            if (user) {
                // Link account
                user = await this.usersService.update(user.id, {
                    oauth_provider: 'google',
                    oauth_provider_id: googleUser.oauth_provider_id,
                    oauth_access_token: googleUser.oauth_access_token,
                    oauth_refresh_token: googleUser.oauth_refresh_token,
                    is_verified: true,
                });
            } else {
                // Create new user
                user = await this.usersService.create({
                    email: googleUser.email,
                    role: 'parent', // Default role
                    is_verified: true,
                    oauth_provider: 'google',
                    oauth_provider_id: googleUser.oauth_provider_id,
                    oauth_access_token: googleUser.oauth_access_token,
                    oauth_refresh_token: googleUser.oauth_refresh_token,
                });
            }
        }

        return this.login(user);
    }
}
