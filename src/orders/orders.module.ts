import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/core/services/mailer.service';
import { User } from 'src/entities/user.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from 'src/entities/order.entity';
import { MessageService } from 'src/messages/message.service';
import { Message } from 'src/entities/message.entity';
import { CloudinaryService } from 'src/core/services/cloudinary.service';

const Repositories = TypeOrmModule.forFeature([User, Order, Message]);

@Module({
  imports: [Repositories],
  controllers: [OrdersController],
  providers: [OrdersService, EmailService, MessageService, CloudinaryService],
  exports: [OrdersService, Repositories],
})
export class OrdersModule {}
