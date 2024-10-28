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
import { EmailService } from 'src/core/services/mailer.service';
import { CloudinaryService } from 'src/core/services/cloudinary.service';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(UserKYC)
    private kycRepository: Repository<UserKYC>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
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

  async updateKYC(id: string, data: any): Promise<RequestResponse> {
    try {
      const kyc = await this.kycRepository.findOneByOrFail({ user: { id } });

      if (!kyc) {
        throw new NotFoundException('KYC record not found');
      }

      // Update the KYC record with the new data
      const updatedKYC = await this.kycRepository.save({ ...kyc, ...data });

      return {
        result: 'success',
        message: 'KYC record updated successfully',
        data: {
          ...updatedKYC,
          user: kyc.user,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error updating KYC record:', error);
      return {
        result: 'error',
        message: 'An error occurred while updating the KYC record',
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
  ): Promise<RequestResponse> {
    try {
      // Fetch the KYC record based on user ID
      const kyc = await this.kycRepository.findOneByOrFail({ user: { id } });
      const user = await this.userRepository.findOne({ where: { id } });

      // Update status and rejection reason if rejected
      kyc.status = status;

      if (status === 'rejected') {
        kyc.rejectionReason = rejectionReason;
        kyc.step = KYCStep.REJECTED;

        // Send rejection email notification
        const rejectionEmailData = {
          to: user.email,
          subject: 'Your KYC Verification Failed',
          text: `Your KYC verification has been rejected. Reason: ${rejectionReason}`,
        };

        const emailResponse = await this.emailService.sendEmail(
          'team',
          rejectionEmailData.to,
          rejectionEmailData.subject,
          rejectionEmailData.text,
        );

        if (emailResponse.rejected && emailResponse.rejected.length > 0) {
          kyc.documentsRejectedEmailSent = false;
          console.error('Failed to send rejection email notification to user');
        } else {
          kyc.documentsRejectedEmailSent = true;
        }
      }

      if (status === 'approved') {
        kyc.step = KYCStep.COMPLETE;

        // Send approval email notification
        const approvalEmailData = {
          to: user.email,
          subject: 'Your KYC Verification Passed',
          text: 'Your KYC verification has been approved. You can now proceed to use the platform.',
        };

        const emailResponse = await this.emailService.sendEmail(
          'team',
          approvalEmailData.to,
          approvalEmailData.subject,
          approvalEmailData.text,
        );

        if (emailResponse.rejected && emailResponse.rejected.length > 0) {
          kyc.documentsVerifiedEmailSent = false;
          console.error('Failed to send approval email notification to user');
        } else {
          kyc.documentsVerifiedEmailSent = true;
        }
      }

      // Save the KYC record with updated status and step
      const savedKyc = await this.kycRepository.save(kyc);

      return {
        result: 'success',
        message: `KYC status updated to ${status}`,
        data: {
          ...savedKyc,
          user,
        },
        statusCode: 200,
      };
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

      // Skip if document is already uploaded
      if (userKYC[fileField]) {
        return {
          result: 'success',
          message: `${fileField} already uploaded`,
          data: userKYC,
          statusCode: 200,
        };
      }

      if (!file.buffer) {
        throw new BadRequestException('File buffer is not available');
      }

      // Change file name base on fileField
      file.filename = fileField;

      // Upload document to Cloudinary and get the secure URL
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        userId,
      );

      if (!uploadResult.secure_url) {
        throw new InternalServerErrorException('Cloudinary upload failed');
      }

      // Save the Cloudinary URL in the KYC record
      userKYC[fileField] = uploadResult.secure_url;

      const updatedKYC = await this.kycRepository.save(userKYC);

      if (!updatedKYC) {
        throw new InternalServerErrorException('Error saving KYC document');
      }

      // Mapping KYC steps to file fields for cleaner progression logic
      const stepMap = {
        internationalPassport: KYCStep.SUBMIT_SCHOOL_ID,
        schoolID: KYCStep.SUBMIT_SELFIE,
        selfie: KYCStep.REVIEW,
      };

      await this.kycRepository.update(updatedKYC.id, {
        step: stepMap[fileField],
      });

      return {
        result: 'success',
        message: `${fileField} uploaded successfully`,
        data: userKYC,
        statusCode: 201, // HttpStatus.CREATED
      };
    } catch (error) {
      console.error('Error uploading document');

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException('Error uploading the document');
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

  /**
   * Get all KYC records
   * @returns RequestResponse
   * @todo Implement this method
   * @todo Add the correct return type
   */
  private kycCache: any = null;

  async getAllKYCRecords(
    page: number = 1,
    limit: number = 10,
  ): Promise<RequestResponse> {
    try {
      if (this.kycCache) {
        return this.kycCache;
      }

      const [kycRecords, total] = await this.kycRepository.findAndCount({
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
      });

      const formattedRecords = kycRecords.map((kyc) => {
        if (kyc.user && kyc.user.kyc) {
          delete kyc.user.kyc;
        }

        return kyc;
      });

      this.kycCache = {
        result: 'success',
        message: 'List of KYC records',
        data: {
          records: formattedRecords,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
        statusCode: 200,
      };

      // Set cache to expire after a certain time
      setTimeout(() => {
        this.kycCache = null;
      }, 60000); // Cache expires after 60 seconds

      return this.kycCache;
    } catch (error) {
      console.error('Error fetching KYC records:', error);
      return {
        result: 'error',
        message: 'An error occurred while fetching KYC records',
        data: null,
        statusCode: 500,
        error: error.message,
      };
    }
  }
}
