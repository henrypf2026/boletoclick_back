import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
  })
  name!: string;

  @Column({
    type: 'varchar',
  })
  address!: string;
  @Column({ type: 'varchar' })
  city!: string;
  @Column({ type: 'integer' })
  capacity!: number;
  @Column({ type: 'text', nullable: true })
  imgUrl!: string | null;
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  latitude!: number;
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  longitude!: number;
  @Column({ type: 'timestamptz' })
  createdAt!: string;
  @Column({ type: 'timestamptz' })
  updatedAt!: string;
}
