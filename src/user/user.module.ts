import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockUserModule } from '../block_user/block.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    BlockUserModule,
    CacheModule.register({
      ttl: 1000 * 60 * 60,
      max: 10,
      isGlobal: true,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
