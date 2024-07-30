import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';
import { decode, sign } from 'jsonwebtoken';
import * as moment from 'moment';
import { BlockedUserSchema } from '../block_user/block.entity';
import { BlockUserService } from '../block_user/block.service';
import { getUserUpdatePayload } from '../helper/index';
import { User, UserQueryParams } from './interface';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private userBlockService: BlockUserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('user/:id')
  async getUser(@Param() params: { id: string }, @Res() res: Response) {
    try {
      const { id } = params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        return res.status(400).json({
          error: true,
          user: null,
          message: 'User not found.',
        });
      }

      const tokenPayload = { id: id };
      const token = sign(tokenPayload, 'token_secret');
      res.status(200).json({
        error: false,
        user,
        message: 'User fecthed succssfully.',
        token,
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Get('user/insert/mock')
  async insertUserMock(@Res() res: Response) {
    try {
      const { data } = await axios.get('https://dummyjson.com/users?limit=0');
      let usersList: User[] = [];
      if (data && data?.users) {
        usersList = data?.users.map((user: any) => {
          return {
            first_name: user?.firstName,
            surname: user?.maidenName,
            last_name: user?.lastName,
            username: user?.username,
            birthday: moment(
              new Date(user?.birthDate || '1996-5-30'),
            ).toISOString(),
          };
        });
      }

      const users = await this.userService.insertManyUser(usersList);

      res.status(200).json({
        error: false,
        users,
        message: 'Users created succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Post('user/insert')
  async insertUser(@Res() res: Response, @Req() req: Request) {
    try {
      const { first_name, surname, last_name, username, birthday } = req.body;

      const user = await this.userService.insertUser({
        birthday,
        first_name,
        last_name,
        surname,
        username,
      });
      this.cacheManager.reset();
      res.status(200).json({
        error: false,
        user,
        message: 'User created succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Delete('user/:id')
  async deleteUser(@Param() params: { id: string }, @Res() res: Response) {
    try {
      const { id } = params;
      const user = await this.userService.deleteUserById(id);

      if (!user || user?.affected <= 0) {
        return res.status(400).json({
          error: true,
          message: 'User not found.',
        });
      }

      res.status(200).json({
        error: false,
        message: 'User deleted succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Patch('user/update')
  async updateUser(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.body;
      const user = await this.userService.updateUserById(
        id,
        getUserUpdatePayload(req.body),
      );

      if (!user || user?.affected <= 0) {
        return res.status(400).json({
          error: true,
          message: 'User not found.',
        });
      }

      res.status(200).json({
        error: false,
        message: 'User updated succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Get('users/list')
  async getUsersList(@Res() res: Response) {
    try {
      const cachedUsers = await this.cacheManager.get('usersList');

      if (cachedUsers) {
        return res.status(200).json({
          error: false,
          users: cachedUsers,
          message: 'Users fetched succssfully.',
        });
      }

      const users = await this.userService.getUsersList();

      if (users && users?.length > 0) {
        this.cacheManager.set('usersList', users, 1000 * 60 * 60);
      }
      res.status(200).json({
        error: false,
        users,
        message: 'Users fetched succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Get('users/search')
  async searchUsers(
    @Query() queryParams: UserQueryParams,
    @Res() res: Response,
    @Req() req: Request,
    @Headers() headers,
  ) {
    try {
      const { authorization = '' } = headers;
      const { max_age, min_age, username } = queryParams;

      if (!max_age && !min_age && !username) {
        return res
          .status(400)
          .json({ error: true, message: 'Invalid request params.' });
      }

      const cachedSearchResult = await this.cacheManager.get(req.url);

      if (cachedSearchResult) {
        return res.status(200).json({
          error: false,
          users: cachedSearchResult,
          message: 'Users fetched succssfully.',
        });
      }

      const tokenPayload: any = decode(authorization);

      let users = await this.userService.searchUser({
        max_age,
        min_age,
        username,
      });
      let blockedUsers: BlockedUserSchema[] = [];
      if (tokenPayload?.id) {
        blockedUsers = await this.userBlockService.getBlockedUser(
          tokenPayload?.id,
        );
      }

      if (blockedUsers && blockedUsers?.length > 0) {
        users = users.filter((user) => {
          const isBlocked = blockedUsers.find(
            (bu) => bu.blocked_user_id === user.id,
          );
          return !isBlocked;
        });
      }

      // Setting up Cache for 5 minutes
      this.cacheManager.set(req.url, users, 1000 * 60 * 5);

      res.status(200).json({
        error: false,
        users: users,
        message: 'Users fetched succssfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }
}
