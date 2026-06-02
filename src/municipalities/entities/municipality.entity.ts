import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from '../../province/entities/province.entity';

@Entity('municipality')
export class Municipality {
  /**
   * Numero incremental
   * @example '1'
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  /**
   * @example 'Eduard'
   */
  @Column({ type: 'varchar' })
  name!: string;
  /**
   * @example '10'
   */
  @Column({ type: 'integer' })
  municipalityCode!: number;
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
  @Column({ type: 'timestamptz', nullable: true })
  updatedAt!: string;

  @ManyToOne(() => Province, (province) => province.municipality)
  province!: Province;
}
