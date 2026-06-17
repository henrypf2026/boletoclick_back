import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../../tickets/entities/ticket.entity';

export class ColumnNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data ? parseFloat(data) : null;
  }
}

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  eventId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price!: number;

  @Column({ type: 'integer' })
  stock!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  zone!: string | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: string;

  @ManyToOne('Event', 'ticketTypes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @ApiProperty({
    type: () => [Ticket],
    description: 'Lista de tiquetes emitidos para este tipo de localidad',
  })
  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets!: Ticket[];
}
