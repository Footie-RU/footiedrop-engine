import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SkipAuth } from 'src/core/decorators/meta.decorator';
import { CreateAdminDto } from 'src/core/dto/admin.dto';
import {
  ChangeEmailDto,
  ResendVerificationOtpDto,
  SendPasswordResetEmailDto,
  UpdatePasswordDto,
  VerifyOtpDto,
} from 'src/core/dto/user.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { AdminService } from 'src/admin/admin.service';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll(): Promise<RequestResponse> {
    return this.adminService.findAll();
  }

  @Get('users/id/:id')
  findOneById(@Param('id') id: string): Promise<RequestResponse> {
    return this.adminService.findOneById(id);
  }

  @Get('users/email/:email')
  findOneByEmail(@Param('email') email: string): Promise<RequestResponse> {
    return this.adminService.findOneByEmail(email);
  }

  @SkipAuth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAdminDto: CreateAdminDto): Promise<RequestResponse> {
    return this.adminService.create(createAdminDto);
  }

  @SkipAuth()
  @Post('resendOtp')
  resendOtp(
    @Body() payload: ResendVerificationOtpDto,
  ): Promise<RequestResponse> {
    return this.adminService.generateOtp(payload.email, true);
  }

  @SkipAuth()
  @Post('verify')
  verifyOtp(@Body() payload: VerifyOtpDto): Promise<RequestResponse> {
    return this.adminService.verifyOtp(payload.email, payload.otp);
  }

  @SkipAuth()
  @Get('verify/email/:email')
  getEmailForVerification(
    @Param('email') email: string,
  ): Promise<RequestResponse> {
    return this.adminService.findOneByEmail(email);
  }

  @SkipAuth()
  @Post('resetPassword')
  resetPassword(
    @Body() payload: SendPasswordResetEmailDto,
  ): Promise<RequestResponse> {
    return this.adminService.resetPassword(payload);
  }

  @SkipAuth()
  @Get('verifyPasswordResetToken/:token')
  verifyPasswordResetToken(
    @Param('token') token: string,
  ): Promise<RequestResponse> {
    return this.adminService.verifyResetToken(token);
  }

  @SkipAuth()
  @Post('updatePassword')
  updatePassword(@Body() payload: UpdatePasswordDto): Promise<RequestResponse> {
    return this.adminService.updatePassword(payload.token, payload.password);
  }

  @SkipAuth()
  @Post('changeEmail')
  changeEmail(@Body() payload: ChangeEmailDto): Promise<RequestResponse> {
    return this.adminService.changeEmail(payload.email, payload.newEmail);
  }
}
