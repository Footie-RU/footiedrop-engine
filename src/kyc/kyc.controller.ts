import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { KYCService } from './kyc.service';
import { SkipAuth } from 'src/core/decorators/meta.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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

  @Post('uploadDocument/:userId/:file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Use memoryStorage to get file buffer
    }),
  )
  async uploadKYCDocuments(
    @Param('userId') userId: string,
    @Param('file') fileType: 'internationalPassport' | 'schoolID' | 'selfie',
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.kycService.uploadDocument(userId, file, fileType);
  }

  // verify kyc documents
  @Patch('verifyDocuments/:userId')
  async verifyKYCDocuments(@Param('userId') userId: string) {
    return this.kycService.verifyKYCDocuments(userId);
  }

  // Return list of all KYC records
  @Get('list')
  async getKYCList(@Param('page') page: number, @Param('limit') limit: number) {
    return this.kycService.getAllKYCRecords(page, limit);
  }
}
