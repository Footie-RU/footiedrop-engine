import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import {
  ChangeEmailDto,
  ChangePhoneNumberDto,
  ChangeAddressDto,
  ChangeProfilePictureDto,
} from 'src/core/dto/settings.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { SettingsService } from 'src/settings/settings.service';
import { diskStorage } from 'multer';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';

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
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  @UseFilters(new MulterExceptionFilter())
  async changeProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ChangeProfilePictureDto,
  ): Promise<RequestResponse> {
    return this.settingsService.changeProfilePicture(
      dto.userId,
      dto.profilePicture,
    );
  }
}
