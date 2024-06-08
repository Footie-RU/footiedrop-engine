import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import {
  ChangeEmailDto,
  ChangePhoneNumberDto,
  ChangeAddressDto,
  ChangeProfilePictureDto,
  UpdateCommunicationPreferencesDto,
} from 'src/core/dto/settings.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { SettingsService } from 'src/settings/settings.service';
import { diskStorage } from 'multer';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('updateEmail')
  changeEmail(@Body() payload: ChangeEmailDto): Promise<RequestResponse> {
    return this.settingsService.changeEmail(
      payload.userId,
      payload.email,
      payload.newEmail,
    );
  }

  @Post('updatePhoneNumber')
  changePhoneNumber(
    @Body() payload: ChangePhoneNumberDto,
  ): Promise<RequestResponse> {
    return this.settingsService.changePhoneNumber(
      payload.userId,
      payload.newPhoneNumber,
    );
  }

  @Post('updateAddress')
  changeAddress(@Body() payload: ChangeAddressDto): Promise<RequestResponse> {
    return this.settingsService.changeAddress(
      payload.userId,
      payload.addressStreet,
      payload.addressCity,
      payload.addressState,
      payload.addressPostalCode,
      payload.addressCountry,
    );
  }

  @Post('updateProfilePicture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${req.body.userId}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async changeProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Body() payload: ChangeProfilePictureDto,
  ): Promise<RequestResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.settingsService.changeProfilePicture(payload.userId, file);
  }

  @Post('updateCommunicationPreferences')
  async updateCommunicationPreferences(
    @Body()
    dto: UpdateCommunicationPreferencesDto,
  ): Promise<RequestResponse> {
    return this.settingsService.updateCommunicationPreferences(dto);
  }
}
