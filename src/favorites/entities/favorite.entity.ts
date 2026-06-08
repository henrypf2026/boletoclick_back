import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Ajusta la ruta a tu entidad de User
import { Event } from '../../events/entities/event.entity'; // Ajusta la ruta a tu entidad de Event

// 🔒 ÍNDICE ÚNICO COMPUESTO: Evita que un mismo usuario agregue el mismo evento más de una vez
@Index(['userId', 'eventId'], { unique: true })
@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  eventId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // ==========================================
  // RELACIONES (Muchos favoritos pertenecen a un Usuario/Evento)
  // ==========================================

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Event, (event) => event.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;
}
