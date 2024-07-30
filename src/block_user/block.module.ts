import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockUserController } from './block.controller';
import { BlockedUserSchema } from './block.entity';
import { BlockUserService } from './block.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockedUserSchema]),
    CacheModule.register({
      ttl: 1000 * 60 * 60,
      max: 10,
    }),
  ],
  controllers: [BlockUserController],
  providers: [BlockUserService],
  exports: [BlockUserService],
})
export class BlockUserModule {}
