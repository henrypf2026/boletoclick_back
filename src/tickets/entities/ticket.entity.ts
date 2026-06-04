import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity'; // 💡 Ajusta la ruta según tu estructura
import { Order } from '../../orders/entities/order.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @ApiProperty({
    description: 'Identificador único del boleto digital (UUID v4)',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description:
      'El hash o token único encriptado que se transformará en código QR',
    example: '6aef892c10b394d8e5f71234abcd',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', unique: true })
  qrCode!: string;

  @ApiProperty({
    description:
      'Control de acceso: true permite la entrada, pasa a false tras el escaneo',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  allowEntrance!: boolean;

  @ApiProperty({
    description:
      'Fecha y hora exacta en que se validó en la entrada (null si no se ha usado)',
    example: '2026-06-04T17:09:00.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', nullable: true })
  usedAt!: Date | null; // 💡 Nota: Aunque en TS se manipula como objeto Date, viaja como string en el JSON

  @ApiProperty({
    description: 'Fecha de generación automática del boleto',
    example: '2026-06-04T17:09:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Registro del último cambio en el estado del tiquete',
    example: '2026-06-04T17:09:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Order, (order) => order.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' }) // Enlaza físicamente con la columna orderId en Postgres
  order!: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticketTypeId' })
  ticketType!: TicketType;
}
