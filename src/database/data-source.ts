import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// DataSource separado — usado pela CLI do TypeORM para rodar migrations
// fora do contexto do NestJS (npm run migration:run)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'healthai',
  password: process.env.DB_PASS ?? 'healthai_pass',
  database: process.env.DB_NAME ?? 'healthai_db',
  entities: [__dirname + '/../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations_history',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
