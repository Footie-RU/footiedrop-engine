import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Order } from 'src/entities/order.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from 'src/entities/message.entity';

const Repositories = TypeOrmModule.forFeature([User, Order, Message]);

@Module({
  imports: [Repositories],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService, Repositories],
})
export class MessageModule {}
