import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RequestResponse } from '../core/interfaces/index.interface';
import { EmailService } from '../core/services/mailer.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: EmailService,
  ) {}


}
