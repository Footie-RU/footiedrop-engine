import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RequestResponse } from '../core/interfaces/index.interface';
import { EmailService } from '../core/services/mailer.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: EmailService,
  ) {}

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
  ): Promise<RequestResponse> {
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
    addressStreet: string,
    addressCity: string,
    addressState: string,
    addressPostalCode: string,
    addressCountry: string,
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
        addressStreet,
        addressCity,
        addressState,
        addressPostalCode,
        addressCountry,
      });

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

  async changeProfilePicture(
    id: string,
    profilePicture: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      await this.userRepository.update(user.id, { profilePicture });

      return {
        result: 'success',
        message: 'Profile picture updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update profile picture',
        data: null,
      };
    }
  }
}
