import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controllers/user.controller';
import { EmailService } from 'src/core/services/mailer.service';
import { UserService } from 'src/core/services/user.service';
import { User } from 'src/entities/user.entity';
import { VerificationOtp } from 'src/entities/verify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, VerificationOtp])],
  controllers: [UserController],
  providers: [UserService, EmailService],
})
export class UserModule {}
