import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column()
  status: string;

  @Column('json')
  details: {
    /* Details of the order */
  };

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}
