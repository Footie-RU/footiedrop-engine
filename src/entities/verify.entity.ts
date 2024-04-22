import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class VerificationOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  otp: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp', default: () => 'current_timestamp()' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: '(current_timestamp() + interval 10 minute)',
  })
  expires_at: Date;
}
