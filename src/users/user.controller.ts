import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SkipAuth } from 'src/core/decorators/meta.decorator';
import {
  CreateUserDto,
  ResendVerificationOtpDto,
  VerifyOtpDto,
} from 'src/core/dto/user.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { UserService } from 'src/users/user.service';

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

  @SkipAuth()
  @Post()
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
}
