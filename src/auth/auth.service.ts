import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LoginUserWithEmailDto,
  LoginUserWithPhoneDto,
} from 'src/core/dto/user.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async validateUserViaEmail(
    userDto: LoginUserWithEmailDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'Invalid email address',
          data: null,
        };
      }

      if (user.password !== userDto.password) {
        return {
          result: 'error',
          message: 'Invalid password',
          data: null,
        };
      }

      if (user.role !== userDto.role) {
        return {
          result: 'error',
          message: 'User is not authorized to login as a ' + userDto.role,
          data: null,
        };
      }

      // get token
      const token = await this.jwtService.signAsync(userDto);

      // Update last login date
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        token: token,
      });

      console.log('User logged in successfully', user);
      return {
        result: 'success',
        message: 'User logged in successfully',
        data: {
          token: token,
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to login user',
        data: null,
      };
    }
  }

  /**
   * Login user with phone and password
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async validateUserViaPhone(
    userDto: LoginUserWithPhoneDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { phone: userDto.phone },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'Invalid phone number',
          data: null,
        };
      }

      if (user.password !== userDto.password) {
        return {
          result: 'error',
          message: 'Invalid password',
          data: null,
        };
      }

      if (user.role !== userDto.role) {
        return {
          result: 'error',
          message: 'User is not authorized to login as a ' + userDto.role,
          data: null,
        };
      }

      // get token
      const token = await this.jwtService.signAsync(userDto);

      // Update last login date
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        token: token,
      });

      return {
        result: 'success',
        message: 'User logged in successfully',
        data: {
          token: token,
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to login user',
        data: null,
      };
    }
  }

  /**
   * Validate user token
   * @param {string} token
   * @returns {Promise<RequestResponse>}
   */
  async validateUserToken(token: string): Promise<RequestResponse> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = await this.jwtService.verifyAsync(
        token.split(' ')[1],
      );

      console.log('User token is valid');
      return {
        result: 'success',
        message: 'User token is valid',
        data: rest,
      };
    } catch (error) {
      return {
        result: 'error',
        message: 'Invalid token',
        data: null,
      };
    }
  }

  /**
   * Logout user
   * @param {string} token
   * @returns {Promise<RequestResponse>}
   */
  async logoutUser(token: string): Promise<RequestResponse> {
    try {
      const { email, phone, role } = await this.jwtService.verifyAsync(
        token.split(' ')[1],
      );

      // get user
      const user = await this.userRepository.findOne({
        where: { email, phone, role },
      });
      if (!user) {
        return {
          result: 'error',
          message: 'User with the email address does not exist',
          data: null,
        };
      }

      // delete token
      await this.userRepository.update(user.id, {
        token: null,
      });

      console.log('User logged out successfully');
      return {
        result: 'success',
        message: 'User logged out successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: 'Failed to logout user',
        data: null,
      };
    }
  }
}
