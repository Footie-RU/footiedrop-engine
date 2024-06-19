import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RequestResponse } from '../core/interfaces/index.interface';
import { EmailService } from '../core/services/mailer.service';
import {
  ChangeAddressDto,
  ChangeLanguageDto,
  UpdateCommunicationPreferencesDto,
  updateProfileDto,
} from 'src/core/dto/settings.dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: EmailService,
  ) {}

  // User profile settings
  /**
   * Change email address
   * @param {string} email
   * @param {string} newEmail
   * @returns {Promise<RequestResponse>}
   */
  async changeEmail(
    id: string,
    email: string,
    newEmail: string,
  ): Promise<RequestResponse | BadRequestException> {
    try {
      const user = await this.userRepository.findOne({ where: { id, email } });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.email === newEmail) {
        return new BadRequestException('Emails are the same');
      }

      const userWithEmailExists = await this.userRepository.findOne({
        where: { email: newEmail },
      });

      if (userWithEmailExists) {
        return new BadRequestException('User with email already exists');
      }

      await this.userRepository.update(user.id, {
        email: newEmail,
        settings: { verified: false },
      });

      // Send welcome email to user
      const message = `Hello ${user.firstName}, your email address was successfully changed.`;
      await this.mailerService.sendEmail(
        'team',
        user.email,
        'Your email address was changed',
        message,
      );

      return {
        result: 'success',
        message: 'Email updated successfully!',
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

  /**
   * Change phone number
   * @param {string} email
   * @param {string} newPhoneNumber
   * @returns {Promise<RequestResponse>}
   */
  async changePhoneNumber(
    userId: string,
    newPhoneNumber: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      await this.userRepository.update(user.id, {
        phone: newPhoneNumber,
      });

      // Send welcome email to user
      const message = `Hello ${user.firstName}, your phone number was successfully changed.`;
      await this.mailerService.sendEmail(
        'team',
        user.email,
        'Your phone number was changed',
        message,
      );

      return {
        result: 'success',
        message: 'Phone number updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update phone number',
        data: null,
      };
    }
  }

  /**
   * Change address
   * @param {string} email
   * @param {string} addressStreet
   * @param {string} addressCity
   * @param {string} addressState
   * @param {string} addressPostalCode
   * @param {string} addressCountry
   * @returns {Promise<RequestResponse>}
   */
  async changeAddress(
    userId: string,
    payload: ChangeAddressDto,
  ): Promise<RequestResponse | BadRequestException> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return new BadRequestException('User not found');
      }

      await this.userRepository.update(user.id, { ...payload });

      return {
        result: 'success',
        message: 'Address updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update address',
        data: null,
      };
    }
  }

  /**
   *
   * @param {string} id
   * @param {string} profilePicture
   * @returns {Promise<RequestResponse>}
   */
  async updateProfile(
    userId: string,
    profilePicture: Express.Multer.File,
    payload: updateProfileDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      await this.userRepository.update(user.id, {
        profilePicture: profilePicture.filename,
        firstName: payload.firstName,
        middleName: payload.middlename,
        lastName: payload.lastName,
      });

      return {
        result: 'success',
        message: 'Profile updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update profile',
        data: null,
      };
    }
  }

  /**
   * Update communication preferences for a user.
   * @param {string} userId - User ID to identify the user.
   * @param {boolean} notificationsEmail - Flag to enable/disable email notifications.
   * @param {boolean} notificationsSms - Flag to enable/disable SMS notifications.
   * @param {boolean} securityTwoFactorAuth - Flag to enable/disable two-factor authentication.
   * @returns {Promise<RequestResponse>} - Request response indicating success or error.
   */
  async updateCommunicationPreferences(
    dto: UpdateCommunicationPreferencesDto,
    userId: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      // Update user's communication preferences
      user.settings.notificationsEmail = dto.notificationsEmail;
      user.settings.notificationsSms = dto.notificationsSms;
      user.settings.securityTwoFactorAuth = dto.securityTwoFactorAuth;

      await this.userRepository.update(user.id, user);

      return {
        result: 'success',
        message: 'Communication preferences updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update communication preferences',
        data: null,
      };
    }
  }

  // Security settings

  /**
   * Change user password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<RequestResponse>}
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<RequestResponse | BadRequestException> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const isPasswordValid = await compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await hash(newPassword, 10);
      await this.userRepository.update(user.id, { password: hashedPassword });

      // Send welcome email to user
      const message = `Hello ${user.firstName}, your password was successfully changed.`;
      await this.mailerService.sendEmail(
        'team',
        user.email,
        'Your password was changed',
        message,
      );

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

  //Others

  async getSettings(userId: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        result: 'success',
        message: 'User settings fetched successfully',
        data: user.settings,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || "Failed to fetch user's settings",
        data: null,
      };
    }
  }

  async updateLanguage(
    userId: string,
    changeLanguageDto: ChangeLanguageDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.settings.language = changeLanguageDto.language;
      await this.userRepository.update(user.id, user);

      return {
        result: 'success',
        message: 'Language changed successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to change language',
        data: null,
      };
    }
  }
}
