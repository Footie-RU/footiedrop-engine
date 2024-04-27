import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RequestResponse } from '../core/interfaces/index.interface';
import { CreateUserDto, SendPasswordResetEmailDto } from '../core/dto/user.dto';
import { EmailService } from '../core/services/mailer.service';
import { VerificationOtp } from 'src/entities/verify.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: EmailService,
    @InjectRepository(VerificationOtp)
    private otpRepository: Repository<VerificationOtp>,
    private jwtService: JwtService,
  ) {}

  /**
   *  Find all users
   * @returns {Promise<RequestResponse>}
   */
  async findAll(): Promise<RequestResponse> {
    try {
      const users = await this.userRepository.find();
      return {
        result: 'success',
        message: 'Users fetched successfully',
        data: users,
      };
    } catch (error) {
      throw new Error('Failed to fetch users.');
    }
  }

  /**
   * Find a user by id
   * @param id
   * @returns
   */
  async findOneById(id: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }
      return {
        result: 'success',
        message: 'User fetched successfully',
        data: { ...user, password: undefined },
      };
    } catch (error) {
      throw new Error('Failed to fetch user.');
    }
  }

  /**
   * Find a user by email
   * @param email
   * @returns
   */
  async findOneByEmail(email: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }
      return {
        result: 'success',
        message: 'User fetched successfully',
        data: { ...user, password: undefined },
      };
    } catch (error) {
      throw new Error('Failed to fetch user.');
    }
  }

  /**
   * Create a new user
   * @param createUserDto
   * @returns {Promise<RequestResponse>}
   */
  async create(createUserDto: CreateUserDto): Promise<RequestResponse> {
    try {
      // check if user with email already exists
      const userWithEmailExists = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (userWithEmailExists) {
        return {
          result: 'error',
          message: 'User with email already exists',
          data: null,
        };
      }

      // check if user with phone number already exists
      const userWithPhoneExists = await this.userRepository.findOne({
        where: { phone: createUserDto.phone },
      });

      if (userWithPhoneExists) {
        return {
          result: 'error',
          message: 'User with phone number already exists',
          data: null,
        };
      }

      const { confirmPassword, ...rest } = createUserDto;

      if (createUserDto.password !== confirmPassword) {
        return {
          result: 'error',
          message: 'Passwords do not match',
          data: null,
        };
      }

      await this.userRepository.save(rest);

      // Send welcome email to user
      const message = `Welcome to our platform, ${createUserDto.firstName}!`;
      await this.mailerService.sendEmail(
        'team',
        createUserDto.email,
        'Welcome to Footiedrop!',
        message,
      );

      // Generate OTP for user verification and send it to the user
      const otpResponse = await this.generateOtp(createUserDto.email);

      if (otpResponse.result === 'error') {
        // Handle error generating OTP
        return otpResponse;
      }

      return {
        result: 'success',
        message: 'User created successfully',
        data: {},
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to create user',
        data: null,
      };
    }
  }

  /**
   * Generate 4 pin otp for user verification, save it to the database, and send it to the user
   * @param {string} email
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async generateOtp(email: string, resend?: boolean): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const oldOtp = await this.otpRepository.findOne({
        where: { userId: user.id },
      });
      if (oldOtp && resend) {
        await this.otpRepository.delete(oldOtp.id);
      }
      const newOtp = await this.otpRepository.save({ userId: user.id, otp });

      const message = `Your verification code is ${otp} /n This code expires in 5 minutes.`;
      await this.mailerService.sendEmail(
        'team',
        user.email,
        'Verification Code',
        message,
      );

      return {
        result: 'success',
        message: 'OTP generated successfully',
        data: {
          userId: user.id,
          expires_at: newOtp.expires_at,
        },
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to generate OTP',
        data: null,
      };
    }
  }

  /**
   * Verify user OTP
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async verifyOtp(email: string, otp: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.settings && user.settings.verified) {
        return {
          result: 'error',
          message: 'User is already verified',
          data: null,
        };
      }

      const otpRecord = await this.otpRepository.findOne({
        where: { userId: user.id, otp },
      });

      if (!otpRecord) {
        return {
          result: 'error',
          message: 'Invalid OTP',
          data: null,
        };
      }

      const currentTime = new Date();
      if (otpRecord.expires_at.getTime() < currentTime.getTime()) {
        return {
          result: 'error',
          message: 'OTP has expired',
          data: null,
        };
      }

      // Update user verification status
      await this.userRepository.update(user.id, {
        settings: { verified: true },
      });

      // Delete the OTP record
      await this.otpRepository.delete(otpRecord.id);

      return {
        result: 'success',
        message: 'OTP verified successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to verify OTP',
        data: null,
      };
    }
  }

  // reset password by sending a reset email
  /**
   * Reset user password
   * @param {SendPasswordResetEmailDto} payload
   */
  async resetPassword(
    payload: SendPasswordResetEmailDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const otpResponse = await this.generateResetToken(payload);

      if (otpResponse.result === 'error') {
        return otpResponse;
      }

      return {
        result: 'success',
        message: 'Password reset email sent successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to reset password',
        data: null,
      };
    }
  }

  /**
   * Generate token for reset password
   * @param {SendPasswordResetEmailDto} payload
   * @param {boolean}
   * @returns {Promise<RequestResponse>}
   */
  async generateResetToken(
    payload: SendPasswordResetEmailDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      // generate token with jwt and set expiry time, and save it to the user
      const token = await this.jwtService.signAsync(payload, {
        secret: 'asaskhawew',
        expiresIn: '10m',
      });

      // save the token to the user
      await this.userRepository.update(user.id, { resetPasswordToken: token });

      // send reset password link back to the user
      // set the link based on the environment variable
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      // send email to user
      const message = `Click the link below to reset your password: ${resetLink}`;

      await this.mailerService.sendEmail(
        'team',
        user.email,
        'Password Reset',
        message,
      );

      return {
        result: 'success',
        message: 'Password reset email sent successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        result: 'error',
        message: error.message || 'Failed to generate reset token',
        data: null,
      };
    }
  }

  /**
   * Verify Reset password token
   * @param {string} token
   * @return {Promise<RequestResponse>}
   * @description Checks if the token is valid and not expired by checking the token validity using jwt and checking the database
   */
  async verifyResetToken(token: string): Promise<RequestResponse> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: 'asaskhawew',
      });

      if (!decoded) {
        return {
          result: 'error',
          message: 'Token expired',
          data: null,
        };
      }

      const user = await this.userRepository.findOne({
        where: { email: decoded.email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.resetPasswordToken !== token) {
        return {
          result: 'error',
          message: 'Invalid token',
          data: { valid: false },
        };
      }

      return {
        result: 'success',
        message: 'Token verified successfully',
        data: { valid: true },
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to verify token',
        data: null,
      };
    }
  }

  /**
   * Update user password
   * @param {string} token
   * @param {string} password
   * @returns {Promise<RequestResponse>}
   */
  async updatePassword(
    token: string,
    password: string,
  ): Promise<RequestResponse> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: 'asaskhawew',
      });

      if (!decoded) {
        return {
          result: 'error',
          message: 'Token expired',
          data: null,
        };
      }

      const user = await this.userRepository.findOne({
        where: { email: decoded.email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.resetPasswordToken !== token) {
        return {
          result: 'error',
          message: 'Invalid token',
          data: null,
        };
      }

      await this.userRepository.update(user.id, { password });

      return {
        result: 'success',
        message: 'Password updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update password',
        data: null,
      };
    }
  }

  /**
   * Change email address
   * @param {string} email
   * @param {string} newEmail
   * @returns {Promise<RequestResponse>}
   * @todo Implement this method
   */
  async changeEmail(email: string, newEmail: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.email === newEmail) {
        return {
          result: 'error',
          message: 'Emails are the same',
          data: null,
        };
      }

      const userWithEmailExists = await this.userRepository.findOne({
        where: { email: newEmail },
      });

      if (userWithEmailExists) {
        return {
          result: 'error',
          message: 'User with email already exists',
          data: null,
        };
      }

      await this.userRepository.update(user.id, { email: newEmail });

      return {
        result: 'success',
        message: 'Email updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update email',
        data: null,
      };
    }
  }
}
