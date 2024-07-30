import { Controller, Get, Param, Res, Headers, Inject } from '@nestjs/common';
import { BlockUserService } from './block.service';
import { Response } from 'express';
import { decode } from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class BlockUserController {
  constructor(
    private readonly blockUserService: BlockUserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('/block/user/:id')
  async blockUser(
    @Res() res: Response,
    @Param() params: { id: string },
    @Headers() headers,
  ) {
    try {
      const { authorization = '' } = headers;
      const { id } = params;

      if (!authorization) {
        return res.status(400).json({ error: true, message: 'Invalid token.' });
      }
      const tokenPayload: any = decode(authorization);

      if (!id || !tokenPayload?.id || id === tokenPayload?.id) {
        return res
          .status(400)
          .json({ error: true, message: 'Invalid user id' });
      }

      const isAlreadyBlocked = await this.blockUserService.isBlocked(
        tokenPayload?.id,
        id,
      );

      if (isAlreadyBlocked) {
        return res
          .status(400)
          .json({ error: true, message: 'User already blocked.' });
      }

      const result = await this.blockUserService.blockUser(
        tokenPayload?.id,
        id,
      );

      if (!result) {
        return res
          .status(400)
          .json({ error: true, message: 'Unable to block user' });
      }

      // Invalidate User Search Caches
      this.cacheManager.reset();

      return res.json({ error: false, message: 'User blocked successfully.' });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }

  @Get('/un_block/user/:id')
  async unBlockUser(
    @Res() res: Response,
    @Param() params: { id: string },
    @Headers() headers,
  ) {
    try {
      const { authorization = '' } = headers;
      const { id } = params;

      if (!authorization) {
        return res.status(400).json({ error: true, message: 'Invalid token.' });
      }
      const tokenPayload: any = decode(authorization);

      if (!id || !tokenPayload?.id || id === tokenPayload?.id) {
        return res
          .status(400)
          .json({ error: true, message: 'Invalid user id' });
      }

      const isBlocked = await this.blockUserService.isBlocked(
        tokenPayload?.id,
        id,
      );

      if (!isBlocked) {
        return res
          .status(400)
          .json({ error: true, message: 'User not blocked.' });
      }

      const result = await this.blockUserService.unBlockUser(
        tokenPayload?.id,
        id,
      );

      if (!result) {
        return res
          .status(400)
          .json({ error: true, message: 'Unable to Unblock user' });
      }

      // Invalidate User Search Caches
      this.cacheManager.reset();
      return res.json({
        error: false,
        message: 'User Unblocked successfully.',
      });
    } catch (error) {
      console.log('ERROR-> ', error);
      res.status(400).json({ error: true, message: 'Something went wrong.' });
    }
  }
}
