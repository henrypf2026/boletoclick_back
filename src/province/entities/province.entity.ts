import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Municipality } from '../../municipalities/entities/municipality.entity';

@Entity('province')
export class Province {
  /**
   * Numero incremental
   * @example '1'
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  /**
   * @example 'Eduard'
   */
  @Column({ type: 'varchar', unique: true })
  name!: string;
  /**
   * @example '10'
   */
  @Column({ type: 'integer', unique: true })
  provinceCode!: number;
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

  @OneToMany(() => Municipality, (municipality) => municipality.province)
  municipality!: Municipality[];
}
