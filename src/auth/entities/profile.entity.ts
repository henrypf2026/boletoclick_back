import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  supabaseUserId!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column({ type: 'date' })
  birthDate!: string;

  @Column()
  documentNumber!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ default: false })
  allowNewsletter!: boolean;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
