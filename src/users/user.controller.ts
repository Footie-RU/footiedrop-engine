import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { SkipAuth } from 'src/core/decorators/meta.decorator';
import {
  ChangeEmailDto,
  CreateUserDto,
  ResendVerificationOtpDto,
  SendPasswordResetEmailDto,
  UpdatePasswordDto,
  VerifyOtpDto,
} from 'src/core/dto/user.dto';
import { UserOwnershipGuard } from 'src/core/guards/roles.guard';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { UserService } from 'src/users/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('id/:id')
  @UseGuards(UserOwnershipGuard)
  findOneById(@Param('id') id: string): Promise<RequestResponse> {
    return this.userService.findOneById(id);
  }

  @Get('email/:email')
  @UseGuards(UserOwnershipGuard)
  findOneByEmail(@Param('email') email: string): Promise<RequestResponse> {
    return this.userService.findOneByEmail(email);
  }

  @SkipAuth()
  @Post('create')
  create(@Body() createUserDto: CreateUserDto): Promise<RequestResponse> {
    return this.userService.create(createUserDto);
  }

  @SkipAuth()
  @Post('resendOtp')
  resendOtp(
    @Body() payload: ResendVerificationOtpDto,
  ): Promise<RequestResponse> {
    return this.userService.generateOtp(payload.email, true);
  }

  @SkipAuth()
  @Post('verify')
  verifyOtp(@Body() payload: VerifyOtpDto): Promise<RequestResponse> {
    return this.userService.verifyOtp(payload.email, payload.otp);
  }

  @SkipAuth()
  @Get('verify/email/:email')
  getEmailForVerification(
    @Param('email') email: string,
  ): Promise<RequestResponse> {
    return this.userService.findOneByEmail(email);
  }

  @SkipAuth()
  @Get('kyc/user/:email')
  kycUserByEmail(@Param('email') email: string): Promise<RequestResponse> {
    return this.userService.findOneByEmail(email);
  }

  @SkipAuth()
  @Get('kyc/user/id/:id')
  kycUserByID(@Param('id') id: string): Promise<RequestResponse> {
    return this.userService.findOneById(id);
  }

  @SkipAuth()
  @Post('resetPassword')
  resetPassword(
    @Body() payload: SendPasswordResetEmailDto,
  ): Promise<RequestResponse> {
    return this.userService.resetPassword(payload);
  }

  @SkipAuth()
  @Get('verifyPasswordResetToken/:token')
  verifyPasswordResetToken(
    @Param('token') token: string,
  ): Promise<RequestResponse> {
    return this.userService.verifyResetToken(token);
  }

  @SkipAuth()
  @Post('updatePassword')
  updatePassword(@Body() payload: UpdatePasswordDto): Promise<RequestResponse> {
    return this.userService.updatePassword(payload.token, payload.password);
  }

  @SkipAuth()
  @Post('changeEmail')
  changeEmail(@Body() payload: ChangeEmailDto): Promise<RequestResponse> {
    return this.userService.changeEmail(payload.email, payload.newEmail);
  }

  @Patch('toggle-status/:id')
  toggleUserStatus(@Param('id') id: string): Promise<RequestResponse> {
    return this.userService.toggleUserStatus(id);
  }

  @Get('status/:id')
  getUserStatus(@Param('id') id: string): Promise<RequestResponse> {
    return this.userService.getUserStatus(id);
  }
}
