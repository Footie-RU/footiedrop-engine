import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
  CreateUserDto,
  LoginUserWithEmailDto,
  LoginUserWithPhoneDto,
  ResendVerificationOtpDto,
  VerifyOtpDto,
} from 'src/core/dto/user.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { UserService } from 'src/core/services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<RequestResponse> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RequestResponse> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<RequestResponse> {
    return this.userService.create(createUserDto);
  }

  @Post('resendOtp')
  resendOtp(
    @Body() payload: ResendVerificationOtpDto,
  ): Promise<RequestResponse> {
    return this.userService.generateOtp(payload.email, true);
  }

  @Post('verify')
  verifyOtp(@Body() payload: VerifyOtpDto): Promise<RequestResponse> {
    return this.userService.verifyOtp(payload.email, payload.otp);
  }

  @Post('loginWithEmail')
  loginWithEmail(
    @Body() payload: LoginUserWithEmailDto,
  ): Promise<RequestResponse> {
    return this.userService.validateUserViaEmail(payload);
  }

  @Post('loginWithPhone')
  loginWithPhone(
    @Body() payload: LoginUserWithPhoneDto,
  ): Promise<RequestResponse> {
    return this.userService.validateUserViaPhone(payload);
  }
}
