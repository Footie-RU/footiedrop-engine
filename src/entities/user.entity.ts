import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { Settings } from './settings.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
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
      return `${process.env.BACKEND_URL}/uploads/${this.profilePicture}`;
    }
    return null;
  }

  @AfterLoad()
  updateProfilePicture(): void {
    if (this.profilePicture) {
      this.profilePicture = this.profilePictureUrl;
    }
  }

  @Column()
  addressStreet: string;

  @Column()
  addressCity: string;

  @Column()
  addressState: string;

  @Column()
  floor: string;

  @Column()
  zip_code: string;

  @Column()
  apartment_number: string;

  @Column()
  addressPostalCode: string;

  @Column()
  addressCountry: string;

  @Column({ default: 'customer' }) // Assuming 'customer' is the default role
  role: 'customer' | 'courier';

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
  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  resetPasswordToken: string;
}
