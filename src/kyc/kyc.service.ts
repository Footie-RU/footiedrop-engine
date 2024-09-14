import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KYCStep, UserKYC } from 'src/entities/kyc.entity';
import { User } from 'src/entities/user.entity';
import { RequestResponse } from 'src/core/interfaces/index.interface';
import * as zlib from 'zlib';
import { EmailService } from 'src/core/services/mailer.service';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(UserKYC)
    private kycRepository: Repository<UserKYC>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
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
        // check kyc documents, if all are uploaded, check if the step is not updated to in review if the status is pending
        if (
          existingKYC.internationalPassport &&
          existingKYC.schoolID &&
          existingKYC.selfie &&
          existingKYC.status === 'pending' &&
          existingKYC.step !== KYCStep.REVIEW
        ) {
          await this.kycRepository.update(existingKYC.id, {
            step: KYCStep.REVIEW,
          });
        }

        // Get the updated KYC record
        const updatedKYC = await this.kycRepository.findOne({
          where: { user: { id: userId } },
        });

        return {
          result: 'success',
          message: 'KYC record already exists',
          data: updatedKYC,
          statusCode: 200,
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
    try {
      const kyc = await this.kycRepository.findOneByOrFail({ id });

      if (!kyc) {
        throw new NotFoundException('KYC record not found');
      }

      kyc.status = status;

      if (status === 'rejected') {
        kyc.rejectionReason = rejectionReason;
        kyc.step = KYCStep.START;
      }

      if (status === 'approved') {
        kyc.step = KYCStep.COMPLETE;
      }

      return await this.kycRepository.save(kyc);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating the KYC status',
      );
    }
  }

  // upload kyc document
  // save doc as base64 string
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    fileField: 'internationalPassport' | 'schoolID' | 'selfie',
  ): Promise<RequestResponse> {
    try {
      const userKYC = await this.kycRepository.findOneByOrFail({
        user: { id: userId },
      });

      if (!userKYC) {
        throw new NotFoundException('KYC record not found');
      }

      // skip if the document is already uploaded
      if (userKYC[fileField]) {
        // return success message
        return {
          result: 'success',
          message: 'Document already uploaded',
          data: userKYC,
          statusCode: 200,
        };
      }

      // Check if file.buffer is available
      if (!file.buffer) {
        throw new BadRequestException('File buffer is not available');
      }

      const compressedBuffer = zlib.deflateSync(file.buffer);

      // Save the document as a base64 string
      userKYC[fileField] = compressedBuffer.toString('base64');

      const updatedKYC = await this.kycRepository.save(userKYC);

      // Update KYC step based on the uploaded document if the kyc is saved successfully
      if (updatedKYC) {
        if (fileField === 'internationalPassport') {
          await this.kycRepository.update(updatedKYC.id, {
            step: KYCStep.SUBMIT_SCHOOL_ID,
          });
        } else if (fileField === 'schoolID') {
          await this.kycRepository.update(updatedKYC.id, {
            step: KYCStep.SUBMIT_SELFIE,
          });
        } else if (fileField === 'selfie') {
          await this.kycRepository.update(updatedKYC.id, {
            step: KYCStep.REVIEW,
          });
        }
      } else {
        throw new InternalServerErrorException(
          'An error occurred while saving the KYC document',
        );
      }

      return {
        result: 'success',
        message: 'Document uploaded successfully',
        data: userKYC,
        statusCode: 201, // HttpStatus.CREATED
      };
    } catch (error) {
      console.error('Error uploading document:', error);

      if (error instanceof NotFoundException) {
        // Specific exception for not found
        throw error;
      }

      // Handle other specific errors if needed
      // For example, if the file is missing or invalid, you might use BadRequestException
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Bad request: ' + error.message);
      }

      // For unexpected errors
      throw new InternalServerErrorException(
        'An error occurred while uploading the document',
      );
    }
  }

  // verify kyc documents
  async verifyKYCDocuments(userId: string): Promise<RequestResponse> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id: userId });
      const userKYC = await this.kycRepository.findOneByOrFail({
        user: { id: userId },
      });

      if (!userKYC) {
        throw new NotFoundException('KYC record not found');
      }

      // Check if all documents are uploaded
      if (userKYC.internationalPassport && userKYC.schoolID && userKYC.selfie) {
        await this.kycRepository.update(userKYC.id, {
          step: KYCStep.REVIEW,
        });

        if (
          userKYC.step === KYCStep.REVIEW &&
          userKYC.status === 'pending' &&
          !userKYC.documentsInReviewEmailSent
        ) {
          // Send an email notification to the user
          const emailData = {
            to: user.email,
            subject: 'KYC Verification',
            text: `Your KYC documents have been uploaded successfully, and are now under review. You will be notified once the verification is complete.`,
          };

          const emailResponse = await this.emailService.sendEmail(
            'team',
            emailData.to,
            emailData.subject,
            emailData.text,
          );

          if (emailResponse.rejected) {
            console.error('Failed to send email notification to user');
          }

          if (emailResponse.accepted) {
            await this.kycRepository.update(userKYC.id, {
              documentsInReviewEmailSent: true,
            });
          }
        }

        return {
          result: 'success',
          message:
            'KYC documents have been uploaded successfully, and are now under review. You will be notified once the verification is complete.',
          data: userKYC,
          statusCode: 200,
        };
      }

      return {
        result: 'error',
        message: 'All documents are required',
        data: userKYC,
        statusCode: 400,
      };
    } catch (error) {
      console.error('Error verifying KYC documents:', error);

      if (error instanceof NotFoundException) {
        // Specific exception for not found
        throw error;
      }

      // Handle other specific errors if needed
      // For example, if the file is missing or invalid, you might use BadRequestException
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Bad request: ' + error.message);
      }

      // For unexpected errors
      throw new InternalServerErrorException(
        'An error occurred while verifying the KYC documents',
      );
    }
  }
}
