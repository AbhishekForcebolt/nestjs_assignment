import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import {
  And,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { User, UserQueryParams } from './interface';
import { UserSchema } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSchema)
    private usersRepository: Repository<UserSchema>,
  ) {}

  getUserById(id: string): Promise<UserSchema | undefined> {
    return this.usersRepository.findOne({
      where: { id: id },
    });
  }
  insertUser(user: User): Promise<UserSchema> {
    return this.usersRepository.save(user);
  }

  async insertManyUser(user: User[]): Promise<UserSchema[]> {
    const userEntitys = this.usersRepository.create(user);
    await this.usersRepository.insert(userEntitys);
    return userEntitys;
  }

  deleteUserById(id: string) {
    return this.usersRepository.delete({
      id: id,
    });
  }

  updateUserById(id: string, user: User) {
    return this.usersRepository.update(
      {
        id: id,
      },
      {
        ...user,
        updated_at: new Date(),
      },
    );
  }

  async getUsersList() {
    return this.usersRepository.find();
  }

  async searchUser({ max_age, min_age, username }: UserQueryParams) {
    const now = moment();
    const whereCondition: FindOptionsWhere<UserSchema> = {};
    const minYear = new Date(
      `${now.year() - min_age || 0}-${now.month()}-${now.date()}`,
    );
    const maxYear = new Date(
      `${now.year() - max_age || 1000}-${now.month()}-${now.date()}`,
    );

    if (max_age !== undefined && min_age !== undefined) {
      whereCondition.birthday = And(
        LessThanOrEqual(minYear),
        MoreThanOrEqual(maxYear),
      );
    } else if (max_age !== undefined) {
      whereCondition.birthday = MoreThanOrEqual(maxYear);
    } else if (min_age !== undefined) {
      whereCondition.birthday = LessThanOrEqual(minYear);
    }

    if (username) {
      whereCondition.username = ILike(`%${username}%`);
    }

    return this.usersRepository.find({
      where: whereCondition,
    });
  }
}
