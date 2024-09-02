import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KYCStep, UserKYC } from 'src/entities/kyc.entity';
import { User } from 'src/entities/user.entity';
import { RequestResponse } from 'src/core/interfaces/index.interface';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(UserKYC)
    private kycRepository: Repository<UserKYC>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new KYC record
   * @param userId
   * @param kycData
   * @returns RequestResponse
   */
  async createKYC(userId: string): Promise<RequestResponse> {
    try {
      // Check if the user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
          statusCode: 404,
          error: 'User does not exist',
        };
      }

      // Check if the user already has a KYC record
      const existingKYC = await this.kycRepository.findOne({
        where: {
          user: { id: userId },
        },
      });

      if (existingKYC) {
        return {
          result: 'success',
          message: 'User already has a KYC record',
          data: existingKYC,
        };
      }

      // Create the KYC record for the user
      const kyc = this.kycRepository.create({ user });
      const savedKyc = await this.kycRepository.save(kyc);

      // Optionally update user entity with KYC
      user.kyc = savedKyc;
      await this.userRepository.save(user);

      return {
        result: 'success',
        message: 'KYC record created successfully',
        data: savedKyc,
        statusCode: 201,
      };
    } catch (error) {
      console.error('Error creating KYC record:', error);
      return {
        result: 'error',
        message: 'An error occurred while creating the KYC record',
        data: null,
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async updateKYCStatus(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ): Promise<UserKYC> {
    const kyc = await this.kycRepository.findOneByOrFail({ id });
    kyc.status = status;
    if (status === 'rejected') {
      kyc.rejectionReason = rejectionReason;
    }
    return this.kycRepository.save(kyc);
  }

  async findKYCByUserId(userId: string): Promise<UserKYC> {
    return this.kycRepository.findOneByOrFail({ user: { id: userId } });
  }

  async updateKYCStep(user: User, step: KYCStep): Promise<UserKYC> {
    const userKYC = await this.kycRepository.findOne({ where: { user } });
    if (!userKYC) {
      throw new Error('KYC record not found');
    }

    userKYC.step = step;
    return this.kycRepository.save(userKYC);
  }
}
