import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserModule } from './modules/user.module';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { Settings } from './entities/settings.entity';
import { VerificationOtp } from './entities/verify.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Order, Payment, Settings, VerificationOtp], // Specify your entities here
      synchronize: true, // Automatically creates database schema
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
