import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../modules/users/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || 'password',
        database: config.get<string>('DB_NAME') || 'postgres',
        // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        // autoLoadEntities: true,
        // synchronize: true,
        // ssl: { rejectUnauthorized: false },
        connectTimeoutMS: 15000,
        entities: [UserEntity],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
