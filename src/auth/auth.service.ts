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
            role: userDto.role || 'parent', // Use provided role or default to parent
            profiles: {
                create: {
                    first_name: userDto.firstName,
                    last_name: userDto.lastName,
                }
            }
        });

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
                // Create new user with profile
                user = await this.usersService.create({
                    email: googleUser.email,
                    role: 'parent', // Default role
                    is_verified: true,
                    oauth_provider: 'google',
                    oauth_provider_id: googleUser.oauth_provider_id,
                    oauth_access_token: googleUser.oauth_access_token,
                    oauth_refresh_token: googleUser.oauth_refresh_token,
                    profiles: {
                        create: {
                            first_name: googleUser.firstName,
                            last_name: googleUser.lastName,
                            profile_image_url: googleUser.picture,
                        }
                    }
                });
            }
        }

        return this.login(user);
    }
}
