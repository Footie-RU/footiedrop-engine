import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column()
  amount: number;

  @Column()
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

  @Column()
  orderId: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;
}
