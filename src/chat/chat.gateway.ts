import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*', // Configure this properly in production
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                client.disconnect();
                return;
            }

            // Verify token (simple check, you might want to use a proper guard or strategy)
            // Assuming Bearer token if in headers
            const cleanToken = token.replace('Bearer ', '');
            const payload = this.jwtService.verify(cleanToken);

            // Store user info in socket
            client.data.user = payload;
            console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
        } catch (error) {
            console.log('Connection unauthorized:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.join(chatId);
        console.log(`Client ${client.id} joined room ${chatId}`);
        return { event: 'joinedRoom', data: chatId };
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.leave(chatId);
        console.log(`Client ${client.id} left room ${chatId}`);
        return { event: 'leftRoom', data: chatId };
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() payload: { chatId: string; content: string; attachmentUrl?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client.data.user.sub; // Assuming 'sub' is the user ID in JWT payload
        const message = await this.chatService.sendMessage(
            payload.chatId,
            userId,
            payload.content,
            payload.attachmentUrl,
        );

        // Emit to all in the room
        this.server.to(payload.chatId).emit('newMessage', message);
        return message;
    }

    @SubscribeMessage('typing')
    handleTyping(@MessageBody() payload: { chatId: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
        client.to(payload.chatId).emit('typing', { userId: client.data.user.sub, isTyping: payload.isTyping });
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(@MessageBody() messageId: string, @ConnectedSocket() client: Socket) {
        const message = await this.chatService.markMessageAsRead(messageId);
        if (message && message.chat_id) {
            this.server.to(message.chat_id).emit('messageRead', message);
        }
    }
}
