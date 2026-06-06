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
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity'; // 💡 Ajusta las rutas según tu estructura
import { Ticket } from '../../tickets/entities/ticket.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';

// Transformer para convertir strings de DECIMAL de Postgres a numbers de TS automáticamente
const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => (value ? parseFloat(value) : 0),
};

@Entity({ name: 'orders' })
export class Order {
  @ApiProperty({
    description: 'Identificador único de la compra (UUID v4)',
    example: 'b9a8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description:
      'El valor total final cobrado al usuario (subtotal + comisión)',
    example: 105000.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  total!: number;

  @ApiProperty({
    description: 'El valor neto acumulado que le corresponde al productor',
    example: 95000.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  producerSubtotal!: number;

  @ApiProperty({
    description: 'La comisión exacta (tarifa de servicio) de la tiquetera',
    example: 10000.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  platformFee!: number;

  @ApiProperty({
    description:
      'Estado de la transacción para control de accesos y devoluciones',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    default: OrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @ApiProperty({
    description:
      'Código de rastreo único que devuelve la pasarela de pagos (Stripe/Mercado Pago)',
    example: 'ch_3MvW2mLkdJUbaRfa0Y8zX8zW',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  transactionId!: string | null;

  @ApiProperty({
    description:
      'Fecha y hora exacta en la que el usuario inició el proceso de pago',
    example: '2026-06-04T17:30:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha y hora del último cambio de estado de la orden',
    example: '2026-06-04T17:32:15.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' }) // Coincide con tu FK de la tabla
  user!: User;

  //   @ManyToOne(() => Coupon, (coupon) => coupon.orders, { nullable: true })
  //   @JoinColumn({ name: 'couponId' }) // Coincide con tu FK de la tabla
  //   coupon!: Coupon;

  @ApiProperty({
    type: () => [Ticket],
    description:
      'Lista de tiquetes digitales generados por esta orden de compra',
  })
  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets!: Ticket[];
}
