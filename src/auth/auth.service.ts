import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LoginAdminWithEmailDto,
  LoginUserWithEmailDto,
  LoginUserWithPhoneDto,
} from 'src/core/dto/user.dto';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
    userDto: LoginUserWithEmailDto | LoginAdminWithEmailDto,
  ): Promise<RequestResponse> {
    try {
      // Step 1: Fetch User
      const user = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (!user) {
        // Throw NestJS NotFoundException if the user is not found
        throw new NotFoundException('Invalid email address');
      }

      // Step 2: Password Validation
      const isPasswordValid = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        // Throw NestJS UnauthorizedException if the password is invalid
        throw new UnauthorizedException('Invalid password');
      }

      // Step 3: Role Authorization
      if (user.role !== userDto.role) {
        // Throw NestJS ForbiddenException if the user has an unauthorized role
        throw new ForbiddenException({
          result: 'error',
          message: 'User is not authorized to login as a ' + userDto.role,
          data: null,
        });
      }

      // Step 4: Check for existing token and validity
      if (user.token) {
        const decoded = await this.jwtService.verifyAsync(user.token);

        if (decoded.id === user.id) {
          return {
            result: 'success',
            message: 'User logged in successfully',
            data: {
              token: user.token,
              userId: user.id,
              email: user.email,
              role: user.role,
            },
          };
        }
      }

      // Step 5: Generate JWT token
      const jwtPayload = { email: user.email, id: user.id, role: user.role };
      const token = await this.jwtService.signAsync(jwtPayload);

      // Step 6: Update last login date and token
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        token: token,
      });

      // Step 7: Successful Login
      return {
        result: 'success',
        message: 'User logged in successfully',
        data: {
          token,
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
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
        throw new NotFoundException({
          result: 'error',
          message: 'Invalid phone number',
          data: null,
        });
      }

      const isPasswordValid = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException({
          result: 'error',
          message: 'Invalid password',
          data: null,
        });
      }

      if (user.role !== userDto.role) {
        throw new ForbiddenException({
          result: 'error',
          message: 'User is not authorized to login as a ' + userDto.role,
          data: null,
        });
      }

      if (user.token) {
        const decoded = await this.jwtService.verifyAsync(user.token);

        if (decoded.id === user.id) {
          return {
            result: 'success',
            message: 'User logged in successfully',
            data: {
              token: user.token,
              userId: user.id,
              email: user.email,
              role: user.role,
            },
          };
        }
      }

      const jwtPayload = { email: user.email, id: user.id, role: user.role };
      const token = await this.jwtService.signAsync(jwtPayload);

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
      throw error;
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

      return {
        result: 'success',
        message: 'User token is valid',
        data: rest,
      };
    } catch (error) {
      throw new UnauthorizedException({
        result: 'error',
        message: 'Invalid token',
        data: null,
      });
    }
  }

  /**
   * Logout user
   * @param {string} token
   * @returns {Promise<RequestResponse>}
   */
  async logoutUser(token: string): Promise<RequestResponse> {
    try {
      // Validate token format
      const parts = token.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new Error('Invalid token format');
      }

      // Verify token and extract user ID
      let decoded: any;
      try {
        decoded = await this.jwtService.verifyAsync(parts[1]);
      } catch (error) {
        return {
          result: 'error',
          message: 'Session expired. User is already logged out.',
          data: null,
        };
      }

      const { id } = decoded;

      // Find the user by ID
      const user = await this.userRepository.findOne({ where: { id } });
      if (user) {
        // Update user to clear the token
        await this.userRepository.update(user.id, { token: null });
      }

      return {
        result: 'success',
        message: 'Logged out successfully',
        data: null,
      };
    } catch (error) {
      // Log error for debugging purposes
      console.error('Logout error:', error.message);

      // Throw a formatted error
      return {
        result: 'error',
        message: 'Logout failed. Please try again.',
        error: error.message,
        data: null,
      };
    }
  }
}
