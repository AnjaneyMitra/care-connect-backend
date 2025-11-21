import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
} from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("requests")
@UseGuards(AuthGuard("jwt"))
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, createRequestDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.requestsService.findOne(id);
  }

  @Get("parent/me")
  findAllMyRequests(@Request() req) {
    return this.requestsService.findAllByParent(req.user.id);
  }

  @Put(":id/cancel")
  cancel(@Param("id") id: string, @Request() req) {
    return this.requestsService.cancel(id, req.user.id);
  }

  @Get(":id/matches")
  viewMatches(@Param("id") id: string, @Request() req) {
    return this.requestsService.viewMatches(id, req.user.id);
  }
}
