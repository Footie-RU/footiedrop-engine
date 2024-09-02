import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../core/services/mailer.service';
import { Order } from 'src/entities/order.entity';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/core/dto/orders.dto';
import { JwtUser } from 'src/core/decorators/extract-user.decorator';
import { OrderStatus } from 'src/core/interfaces/orders.interface';
import { MessageService } from 'src/messages/message.service';
// import { NewOrder } from 'src/core/interfaces/orders.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: EmailService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private messageService: MessageService,
  ) {}

  async create(
    newOrderDTO: CreateOrderDto,
    jwtUser: JwtUser,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: jwtUser.id,
          email: jwtUser.email,
        },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found!',
          data: null,
        };
      }

      const neworder = await this.orderRepository.save({
        ...newOrderDTO,
        user: user.id as any,
      });

      return {
        result: 'success',
        message: 'Order created successfully',
        data: neworder,
      };
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }

  async findAll(): Promise<RequestResponse> {
    try {
      const orders = await this.orderRepository.find({ relations: ['user'] });
      return {
        result: 'success',
        message: 'Orders fetched successfully',
        data: orders,
      };
    } catch (error) {
      throw new Error('Failed to fetch orders:' + error);
    }
  }

  findOne(id: string) {
    return this.orderRepository.findOne({ where: { id }, relations: ['user'] });
  }

  update(id: string, updateOrderDto: any) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new Error('Courier not found or invalid role');
    } else if (user.role === 'courier') {
      order.courier = user;
    } else if (user.role === 'customer') {
    }

    if (
      order.status !== OrderStatus.Accepted &&
      dto.status === OrderStatus.Accepted
    ) {
      const initialMessageContent = order.details.package.message;
      await this.messageService.createMessage(order.user, {
        content: initialMessageContent,
        orderId: order.id,
      });
    }

    order.status = dto.status;

    await this.orderRepository.save(order);

    return order;
  }
}
