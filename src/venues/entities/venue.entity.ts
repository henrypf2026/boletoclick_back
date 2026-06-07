import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Municipality } from '../../municipalities/entities/municipality.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('venues')
export class Venue {
  /**
   * UUID v4
   * @example '6d731bf2-5807-4d69-be3a-06c7353f78bc'
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  /**
   * @example 'BAR EL PEPINO'
   */
  @Column({ type: 'varchar' })
  name!: string;
  /**
   * @example 'calle 4 sur # 71d 85'
   */
  @Column({ type: 'varchar' })
  address!: string;

  /**
   * Number of people that can be
   * @example '1000'
   */
  @Column({ type: 'integer' })
  capacity!: number;
  /**
   * Url with picture of bulding
   * @example 'http://img.jpg'
   */
  @Column({ type: 'text', nullable: true })
  imgUrl!: string | null;
  /**
   * latitude of the place
   * @example '48.8584'
   */
  @Column({ type: 'decimal', precision: 9, scale: 6 })
  latitude!: number;
  /**
   * Longitude of the place
   * @example '2.2945'
   */
  @Column({ type: 'decimal', precision: 9, scale: 6 })
  longitude!: number;
  /**
   * Date on which the place was registered
   * @example '2026-05-22T11:30:00.000Z'
   */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
  /**
   * Date on which the record was updated
   * @example '2026-05-25T15:00:00.000Z'
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
  /**
   * Date on which places are deactivated
   * @example '2026-05-29T15:30:00.000Z'
   */
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date;

  @ManyToOne(() => Municipality, (municipality) => municipality.venues)
  municipality!: Municipality;

  @OneToMany(() => Event, (event) => event.venue)
  events!: Event[];
}
