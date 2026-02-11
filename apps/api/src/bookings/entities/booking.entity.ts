import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  contact_type: string;

  @Column({ type: 'timestamp' })
  appointment_time: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  source_slug: string;

  @CreateDateColumn()
  created_at: Date;
}
