import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/core/services/mailer.service';
import { User } from 'src/entities/user.entity';
import { VerificationOtp } from 'src/entities/verify.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

const Repositories = TypeOrmModule.forFeature([User, VerificationOtp]);

@Module({
  imports: [Repositories],
  controllers: [AdminController],
  providers: [AdminService, EmailService],
  exports: [AdminService, Repositories],
})
export class AdminModule {}
