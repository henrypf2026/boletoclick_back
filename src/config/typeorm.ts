import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
<<<<<<< HEAD
import * as dotenv from 'dotenv';

dotenv.config();
=======
import { environment } from './environment';
>>>>>>> 06bcd1d0b13de4a42250ed60f64940bef71bf8f9

const config = {
  type: 'postgres',
  database: environment.DB_NAME,
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  logging: false,
  synchronize: true,
  dropSchema: true,
};

export const typeOrmConfig = registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
