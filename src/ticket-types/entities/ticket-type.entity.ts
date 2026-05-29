import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Truco de producción: Postgres retorna los tipos DECIMAL como strings en JavaScript
 * para evitar pérdidas de precisión. Este transformer lo convierte a un 'number' real de TS automáticamente.
 */
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  // =========================================================================
  // RELACIONES (Muchos a Uno) - Conexión con Evento
  // =========================================================================

  @ManyToOne('Event', 'ticketTypes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: any; // Cambiar 'any' por 'Event' cuando importes la entidad en el futuro
}
