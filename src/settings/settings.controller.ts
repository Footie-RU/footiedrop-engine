import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SkipAuth } from 'src/core/decorators/meta.decorator';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { SettingsService } from 'src/settings/settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

}
