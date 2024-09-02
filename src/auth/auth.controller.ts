import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import {
  LoginAdminWithEmailDto,
  LoginUserWithEmailDto,
  LoginUserWithPhoneDto,
} from 'src/core/dto/user.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { AuthService } from './auth.service';
import { SkipAuth } from 'src/core/decorators/meta.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('admin/loginWithEmail')
  loginAdminWithEmail(
    @Body() payload: LoginAdminWithEmailDto,
  ): Promise<RequestResponse> {
    return this.authService.validateUserViaEmail(payload);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('loginWithEmail')
  loginWithEmail(
    @Body() payload: LoginUserWithEmailDto,
  ): Promise<RequestResponse> {
    return this.authService.validateUserViaEmail(payload);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('loginWithPhone')
  loginWithPhone(
    @Body() payload: LoginUserWithPhoneDto,
  ): Promise<RequestResponse> {
    return this.authService.validateUserViaPhone(payload);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Get('validateToken')
  validateToken(@Request() req): Promise<RequestResponse> {
    return this.authService.validateUserToken(req.headers.authorization);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Get('logout')
  logout(@Request() req): Promise<RequestResponse> {
    return this.authService.logoutUser(req.headers.authorization);
  }
}
