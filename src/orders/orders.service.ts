import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../core/services/mailer.service';
import { Order } from 'src/entities/order.entity';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/core/dto/orders.dto';
import { JwtUser } from 'src/core/decorators/extract-user.decorator';
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

      const newOrder = await this.orderRepository.save({
        ...newOrderDTO,
        user: user.id as any,
      });

      return {
        result: 'success',
        message: 'Order created successfully',
        data: newOrder,
      };
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }

  async findAll(): Promise<RequestResponse> {
    try {
      const orders = await this.orderRepository.find(); //{ relations: ['user'] });
      return {
        result: 'success',
        message: 'Orders fetched successfully',
        data: orders,
      };
    } catch (error) {
      throw new Error('Failed to fetch orders: ' + error);
    }
  }

  async findOne(id: string): Promise<RequestResponse> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        // relations: ['user'],
      });

      if (!order) {
        return {
          result: 'error',
          message: 'Order not found!',
          data: null,
        };
      }

      return {
        result: 'success',
        message: 'Order fetched successfully',
        data: order,
      };
    } catch (error) {
      throw new Error('Failed to fetch order: ' + error);
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderStatusDto,
  ): Promise<RequestResponse> {
    try {
      const result = await this.orderRepository.update(id, updateOrderDto);
      if (result.affected === 0) {
        return {
          result: 'error',
          message: 'Order not found!',
          data: null,
        };
      }

      const updatedOrder = await this.findOne(id);
      return {
        result: 'success',
        message: 'Order updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      throw new Error('Failed to update order: ' + error);
    }
  }

  async remove(id: string): Promise<RequestResponse> {
    try {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        return {
          result: 'error',
          message: 'Order not found!',
          data: null,
        };
      }

      return {
        result: 'success',
        message: 'Order deleted successfully',
        data: null,
      };
    } catch (error) {
      throw new Error('Failed to delete order: ' + error);
    }
  }
}
