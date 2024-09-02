import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { KYCService } from './kyc.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SkipAuth } from 'src/core/decorators/meta.decorator';

@Controller('kyc')
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @SkipAuth()
  @Get('initiate/:userId')
  async initiateKYC(@Param('userId') userId: string) {
    return this.kycService.createKYC(userId);
  }

  @Patch(':id/status')
  async updateKYCStatus(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.kycService.updateKYCStatus(id, status, rejectionReason);
  }

  @Post('uploadSelfie/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './kycs/selfies',
        filename: (req, file, cb) => {
          const userId = req.params.userId;
          const fileExt = extname(file.originalname);
          const fileName = `${userId}_selfie${fileExt}`;
          cb(null, fileName);
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
  async uploadSelfie(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Handle saving of KYC details (selfie) and store in the database
    return {
      message: 'Selfie uploaded successfully',
      fileName: file.filename,
    };
  }
}
