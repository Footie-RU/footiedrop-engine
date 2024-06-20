import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import {
  ChangeEmailDto,
  ChangePhoneNumberDto,
  ChangeAddressDto,
  UpdateCommunicationPreferencesDto,
  ChangePasswordDto,
  ChangeLanguageDto,
  updateProfileDto,
} from 'src/core/dto/settings.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { SettingsService } from 'src/settings/settings.service';
import { diskStorage } from 'multer';
import {
  ExtractUser,
  JwtUser,
} from 'src/core/decorators/extract-user.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('updateEmail')
  changeEmail(
    @ExtractUser() user: JwtUser,
    @Body() payload: ChangeEmailDto,
  ): Promise<RequestResponse | BadRequestException> {
    return this.settingsService.changeEmail(
      user.id,
      payload.email,
      payload.newEmail,
    );
  }

  @Post('updatePhoneNumber')
  changePhoneNumber(
    @ExtractUser() user: JwtUser,
    @Body() payload: ChangePhoneNumberDto,
  ): Promise<RequestResponse> {
    return this.settingsService.changePhoneNumber(
      user.id,
      payload.newPhoneNumber,
    );
  }

  @Post('updateAddress')
  changeAddress(
    @ExtractUser() user: JwtUser,
    @Body() payload: ChangeAddressDto,
  ): Promise<RequestResponse | BadRequestException> {
    return this.settingsService.changeAddress(user.id, payload);
  }

  @Post('updateProfile/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const userId = req.params.userId;
          cb(null, `${userId}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file && !file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @ExtractUser() user: JwtUser,
    @Body() payload: updateProfileDto,
  ): Promise<RequestResponse> {
    return this.settingsService.updateProfile(user.id, file, payload);
  }

  @Post('updateCommunicationPreferences')
  async updateCommunicationPreferences(
    @ExtractUser() user: JwtUser,
    @Body()
    dto: UpdateCommunicationPreferencesDto,
  ): Promise<RequestResponse> {
    return this.settingsService.updateCommunicationPreferences(dto, user.id);
  }

  @Post('changePassword')
  changePassword(
    @ExtractUser() user: JwtUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<RequestResponse | BadRequestException> {
    return this.settingsService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get(':userId')
  async getSettings(@ExtractUser() user: JwtUser) {
    try {
      return await this.settingsService.getSettings(user.id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('changeLanguage')
  async changeLanguage(
    @ExtractUser() user: JwtUser,
    @Body() changeLanguageDto: ChangeLanguageDto,
  ) {
    try {
      return await this.settingsService.updateLanguage(
        user.id,
        changeLanguageDto,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
