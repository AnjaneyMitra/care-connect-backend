import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Post()
    create(@Request() req, @Body() createRequestDto: CreateRequestDto) {
        return this.requestsService.create(req.user.id, createRequestDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requestsService.findOne(id);
    }

    @Get('parent/me')
    findAllMyRequests(@Request() req) {
        return this.requestsService.findAllByParent(req.user.id);
    }
}
