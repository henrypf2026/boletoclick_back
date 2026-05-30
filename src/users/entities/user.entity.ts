import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany, // 💡 Importamos el decorador para relaciones 1:N
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

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

  // 2. Relación con las Órdenes de compra (Historial del comprador)
  //   @OneToMany('Order', 'user')
  //   orders!: any[];

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
