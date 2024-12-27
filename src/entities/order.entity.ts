import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import {
  Details,
  Location,
  OrderStatus,
  Payment,
} from 'src/core/interfaces/orders.interface';
import { Message } from './message.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    default: 'Pending',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column('json')
  location: Location;

  @Column('json')
  details: Details;

  @Column('json')
  payment: Payment;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  courier: User;

  // @ManyToOne(() => User, (user) => user.id)
  // user: User;

  @OneToMany(() => Message, (message) => message.order)
  messages: Message[];
}
