import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import {
  ExtractUser,
  JwtUser,
} from 'src/core/decorators/extract-user.decorator';
import { CreateMessageDto } from 'src/core/dto/orders.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @ExtractUser() user: JwtUser,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(user, createMessageDto);
  }

  @Get(':orderId')
  async getMessages(@Param('orderId') orderId: string) {
    return this.messageService.getMessages(orderId);
  }
}
