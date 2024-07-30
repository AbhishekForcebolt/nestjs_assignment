import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedUserSchema } from './block.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlockUserService {
  constructor(
    @InjectRepository(BlockedUserSchema)
    private blockedsersRepository: Repository<BlockedUserSchema>,
  ) {}

  async isBlocked(user_id: string, blocked_user_id: string) {
    return this.blockedsersRepository.findOne({
      where: { blocked_user_id, user_id },
    });
  }

  async getBlockedUser(user_id: string) {
    return this.blockedsersRepository.find({
      where: { user_id },
    });
  }

  async blockUser(user_id: string, blocked_user_id: string) {
    return this.blockedsersRepository.save({ blocked_user_id, user_id });
  }

  async unBlockUser(user_id: string, blocked_user_id: string) {
    return this.blockedsersRepository.delete({ blocked_user_id, user_id });
  }
}
