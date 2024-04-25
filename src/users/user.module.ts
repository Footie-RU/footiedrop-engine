import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/users/user.controller';
import { EmailService } from 'src/core/services/mailer.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/entities/user.entity';
import { VerificationOtp } from 'src/entities/verify.entity';

const Repositories = TypeOrmModule.forFeature([User, VerificationOtp]);

@Module({
  imports: [Repositories],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService, Repositories],
})
export class UserModule {}
