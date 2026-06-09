import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Carrega .env e valida variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexão com PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get<string>('DB_HOST', 'localhost'),
        port:     cfg.get<number>('DB_PORT', 5432),
        username: cfg.get<string>('DB_USER', 'healthai'),
        password: cfg.get<string>('DB_PASS', 'healthai_pass'),
        database: cfg.get<string>('DB_NAME', 'healthai_db'),
        entities: [__dirname + '/modules/**/*.entity.{ts,js}'],
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        migrationsTableName: 'migrations_history',
        migrationsRun: true,   // roda migrations automático ao subir
        synchronize: false,    // NUNCA true em produção
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),

    // Módulos do domínio — serão adicionados semana a semana
    // TenantModule,
    // AuthModule,
    // UserModule,
    // PatientModule,
    // TriageModule,
  ],
})
export class AppModule {}
