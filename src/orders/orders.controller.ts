import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/core/dto/orders.dto';
import {
  ExtractUser,
  JwtUser,
} from 'src/core/decorators/extract-user.decorator';
// import { User } from 'src/entities/user.entity';
// import { RequestResponse } from 'src/core/interfaces/index.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(): Promise<RequestResponse> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createUserDto: CreateOrderDto,
    @ExtractUser() user: JwtUser,
  ): Promise<RequestResponse> {
    return this.ordersService.create(createUserDto, user);
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }
}
