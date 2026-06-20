import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { User } from '../../users/entities/user.entity';
import { TicketLockStatus } from '../../common/enums/ticket-lock-status.enum';

@Entity({ name: 'ticket_locks' })
export class TicketLock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación con el Tipo de Ticket (Localidad)
  @ManyToOne(() => TicketType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ticketTypeId' })
  ticketType!: TicketType;

  @Column({ type: 'uuid' })
  ticketTypeId!: string;

  @Column({ type: 'varchar', nullable: true })
  stripeSessionId!: string | null;

  // Relación con el Usuario Comprador
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  // Estado del bloqueo para la auditoría transaccional
  @Column({
    type: 'enum',
    enum: TicketLockStatus,
    default: TicketLockStatus.LOCKED,
  })
  status!: TicketLockStatus;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
