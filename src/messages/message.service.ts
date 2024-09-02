import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtUser } from 'src/core/decorators/extract-user.decorator';
import { CreateMessageDto } from 'src/core/dto/orders.dto';
import { Message } from 'src/entities/message.entity';
import { Order } from 'src/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createMessage(
    user: JwtUser,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { content, orderId } = createMessageDto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['messages'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const message = this.messageRepository.create({
      content,
      sender: user,
      order,
    });

    return await this.messageRepository.save(message);
  }

  async getMessages(orderId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { order: { id: orderId } },
      relations: ['sender'],
      order: { timestamp: 'ASC' },
    });
  }
}
