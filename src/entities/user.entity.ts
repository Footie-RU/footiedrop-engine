import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  AfterLoad,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { Settings } from './settings.entity';
import { UserKYC } from './kyc.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ type: 'text', default: null, nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profilePicture: string;

  get profilePictureUrl(): string | null {
    if (this.profilePicture) {
      return `${process.env.BACKEND_URL ? process.env.BACKEND_URL : 'https://footiedrop.adaptable.app'}/uploads/${this.profilePicture}`;
    }
    return null;
  }

  @AfterLoad()
  updateProfilePicture(): void {
    if (this.profilePicture) {
      this.profilePicture = this.profilePictureUrl;
    }
  }

  @Column({ type: 'text', default: null, nullable: true })
  addressStreet: string;

  @Column({ type: 'text', default: null, nullable: true })
  addressCity: string;

  @Column({ type: 'text', default: null, nullable: true })
  addressState: string;

  @Column({ type: 'text', default: null, nullable: true })
  floor: string;

  @Column({ type: 'text', default: null, nullable: true })
  zip_code: string;

  @Column({ type: 'text', default: null, nullable: true })
  apartment_number: string;

  @Column({ type: 'text', default: null, nullable: true })
  addressPostalCode: string;

  @Column({ type: 'text', default: null, nullable: true })
  addressCountry: string;

  @Column({ default: 'customer' }) // Assuming 'customer' is the default role
  role: 'customer' | 'courier' | 'admin';

  @Column({ default: 'offline' })
  status: 'online' | 'offline';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: null, nullable: true })
  lastLogin: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Column(() => Settings)
  settings: Settings;

  // column for bearer token
  @Column({ type: 'text', default: null, nullable: true })
  token: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  // KYC relationship
  @OneToOne(() => UserKYC, (kyc) => kyc.user, {
    cascade: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  kyc: UserKYC;
}
