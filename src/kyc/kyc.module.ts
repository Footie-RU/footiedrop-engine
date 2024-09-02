import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KYCService } from './kyc.service';
import { User } from 'src/entities/user.entity';
import { UserKYC } from 'src/entities/kyc.entity';
import { KYCController } from './kyc.controller';

const Repositories = TypeOrmModule.forFeature([User, UserKYC]);

@Module({
  imports: [Repositories],
  controllers: [KYCController],
  providers: [KYCService],
  exports: [KYCService, Repositories],
})
export class KYCModule {}
