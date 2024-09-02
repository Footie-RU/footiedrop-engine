import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity'; // Assuming there's a User entity already

export enum KYCStep {
  START = 'start',
  SUBMIT_SELFIE = 'submit_selfie',
  SUBMIT_INTERNATIONAL_PASSPORT = 'submit_international_passport',
  SUBMIT_RUSSIAN_PASSPORT = 'submit_russian_passport',
  REVIEW = 'review',
  COMPLETE = 'complete',
}

@Entity('user_kyc')
export class UserKYC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.kyc)
  user: User;

  @Column({ type: 'text', default: null, nullable: true })
  internationalPassport: string; // Store the URL or file path of the image

  @Column({ type: 'text', default: null, nullable: true })
  russianPassport: string;

  @Column({ type: 'text', default: null, nullable: true })
  schoolID: string;

  @Column({ type: 'text', default: null, nullable: true })
  selfie: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({
    type: 'enum',
    enum: KYCStep,
    default: KYCStep.START,
  })
  step: KYCStep;
}
