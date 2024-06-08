import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from 'src/settings/settings.controller';
import { EmailService } from 'src/core/services/mailer.service';
import { SettingsService } from 'src/settings/settings.service';
import { User } from 'src/entities/user.entity';

const Repositories = TypeOrmModule.forFeature([User]);

@Module({
  imports: [Repositories],
  controllers: [SettingsController],
  providers: [SettingsService, EmailService],
  exports: [SettingsService, Repositories],
})
export class SettingsModule {}
