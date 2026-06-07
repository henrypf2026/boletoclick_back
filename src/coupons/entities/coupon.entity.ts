import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Order } from '../../orders/entities/order.entity';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  eventId!: string | null;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({
    type: 'varchar',
    default: DiscountType.PERCENTAGE,
  })
  discountType!: DiscountType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discountValue!: number;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  @ManyToOne(() => Event, (event) => event.coupons, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'eventId' })
  event!: Event | null;

  @OneToMany(() => Order, (order) => order.coupon)
  orders!: Order[];
}
