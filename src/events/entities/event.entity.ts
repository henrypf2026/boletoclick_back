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
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';

export enum EventStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLDOUT = 'SOLDOUT',
  CANCELLED = 'CANCELLED',
  INACTIVE = 'INACTIVE',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  producerId!: string;

  @Column({ type: 'uuid' })
  venueId!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamptz' })
  eventDate!: string; // Viaja como ISO String desde el Front

  @Column({ type: 'text', nullable: true })
  posterUrl!: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status!: EventStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: string;

  // =========================================================================
  // RELACIONES (Muchos a Uno) - Tus Llaves Foráneas
  // =========================================================================

  @ManyToOne('User', 'events', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producerId' })
  producer!: User;

  @ManyToOne('Venue', 'events', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venueId' })
  venue!: Venue; // Cambiar 'any' por 'Venue' cuando importes la entidad

  @ManyToOne('Category', 'events', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  // =========================================================================
  // RELACIONES (Uno a Muchos) - Los hijos de Eventos
  // =========================================================================

  @OneToMany('TicketType', 'event')
  ticketTypes!: TicketType[]; // Cambiar 'any[]' por 'TicketType[]' cuando corresponda

  //   // Nota: Más adelante mapearás aquí coupons, payments y favorites siguiendo este mismo patrón.
}
