import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    async createChat(@Body('bookingId') bookingId: string) {
        return this.chatService.createChat(bookingId);
    }

    @Get('booking/:bookingId')
    async getChatByBooking(@Param('bookingId') bookingId: string) {
        return this.chatService.getChatByBookingId(bookingId);
    }

    @Get(':chatId/messages')
    async getMessages(
        @Param('chatId') chatId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
    ) {
        return this.chatService.getMessages(chatId, Number(page), Number(limit));
    }

    @Post(':chatId/message')
    async sendMessage(
        @Param('chatId') chatId: string,
        @Body() body: { content: string; attachmentUrl?: string },
        @Request() req,
    ) {
        // req.user is populated by JwtStrategy
        const userId = req.user.id;
        return this.chatService.sendMessage(chatId, userId, body.content, body.attachmentUrl);
    }
}
