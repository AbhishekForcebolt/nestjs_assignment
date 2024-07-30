import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserSchema } from './user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { BlockUserModule } from './block_user/block.module';
import { BlockedUserSchema } from './block_user/block.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [UserSchema, BlockedUserSchema],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    BlockUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
