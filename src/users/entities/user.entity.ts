import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { Order } from '../../orders/entities/order.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'The unique UUID from Supabase Auth' })
  @PrimaryColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Unique email address' })
  @Column({ type: 'varchar', unique: true, length: 255 })
  email!: string;

  @ApiProperty({ description: 'Full name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Birth date (YYYY-MM-DD)' })
  @Column({ type: 'date' })
  birthDate!: string;

  @ApiPropertyOptional({ description: 'Identification document or NIT' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  documentNumber!: string | null;

  @ApiProperty({ enum: Role, default: Role.USER })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @Column({ type: 'text', nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', default: false })
  allowNewsletter!: boolean;

  @ApiPropertyOptional({
    description: 'Registered business name for producers',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName!: string | null;

  // =========================================================================
  // CONTROL DE ESTADO / PENALIZACIONES (Agregado para Panel de Admin)
  // =========================================================================

  @ApiProperty({ default: 'ACTIVO', description: 'Estado de la cuenta' })
  @Column({ type: 'varchar', default: 'ACTIVO' })
  estado!: string; // 'ACTIVO' | 'SUSPENDIDO'

  @ApiPropertyOptional({ description: 'Causa de la suspensión de la cuenta' })
  @Column({ type: 'varchar', nullable: true })
  motivoSuspension!: string | null;

  @ApiPropertyOptional({ description: 'Modalidad de la sanción' })
  @Column({ type: 'varchar', nullable: true })
  tipoSuspension!: string | null; // 'TEMPORAL' | 'PERMANENTE'

  @ApiPropertyOptional({
    description: 'Fecha límite de la suspensión temporal',
  })
  @Column({ type: 'timestamp', nullable: true })
  suspendidoHasta!: Date | null;

  // =========================================================================

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  // =========================================================================
  // RELACIONES (Uno a Muchos) - El superpoder de tu diseño
  // =========================================================================

  // 1. Relación con tus propios Eventos (Si el usuario es un 'Producer')
  @OneToMany('Event', 'producer')
  events!: any[]; // Cambiar 'any' por 'Event' cuando importes la entidad oficialmente

  @OneToMany('Order', 'user')
  orders!: Order[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  // 3. Relación con los bloqueos temporales de tiques en el carrito
  //   @OneToMany('TicketLock', 'user')
  //   ticketLocks!: any[];

  // 4. Relación con los chats en los que participa (Soporte/Comunidades)
  //   @OneToMany('ChatParticipant', 'user')
  //   chatParticipants!: any[];

  // 5. Relación con los mensajes individuales que ha enviado
  //   @OneToMany('ChatMessage', 'sender')
  //   chatMessages!: any[];
}
