import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getMe(@Request() req) {
        // Assuming req.user is populated by an AuthGuard (to be implemented later)
        // For now, we might need to pass a userId in query or body for testing if Auth isn't ready
        // But following the spec:
        return this.usersService.findOne(req.user?.id);
    }

    @Get(':id')
    getUser(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Post('upload-image')
    uploadImage(@Body() body: { userId: string; imageUrl: string }) {
        // In a real app, this would handle file upload (multipart/form-data)
        // For now, we accept a URL string as per the immediate requirement or simplified flow
        return this.usersService.uploadImage(body.userId, body.imageUrl);
    }
}
