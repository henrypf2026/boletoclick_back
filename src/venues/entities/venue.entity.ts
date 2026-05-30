import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('venues')
export class Venue {
  /**
   * UUID v4
   * @example '6d731bf2-5807-4d69-be3a-06c7353f78bc'
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  /**
   * @example 'Eduard'
   */
  @Column({ type: 'varchar' })
  name!: string;
  /**
   * @example 'calle 4 sur # 71d 85'
   */
  @Column({ type: 'varchar' })
  address!: string;
  /**
   * Tambien puede ser un pueblo
   * @example 'calle 4 sur # 71d 85'
   */
  @Column({ type: 'varchar' })
  city!: string;
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
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  latitude!: number;
  /**
   * Longitude of the place
   * @example '2.2945'
   */
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  longitude!: number;
  /**
   * Date on which places are deactivated
   * @example '2026-05-29T15:30:00.000Z'
   */
  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: string;
  /**
   * Date on which the place was registered
   * @example '2026-05-22T11:30:00.000Z'
   */
  @Column({ type: 'timestamptz' })
  createdAt!: string;
  /**
   * Date on which the record was updated
   * @example '2026-05-25T15:00:00.000Z'
   */
  @Column({ type: 'timestamptz' })
  updatedAt!: string;
}
