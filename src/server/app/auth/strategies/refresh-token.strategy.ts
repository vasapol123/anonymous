import { Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import {
  JwtPayload,
  JwtPayloadWithRefreshToken,
} from '../../../common/interface/jwt-payload.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  public validate(
    req: Request,
    payload: JwtPayload,
  ): JwtPayloadWithRefreshToken {
    const refreshToken = req
      ?.get('Authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token malformed');
    }

    return { ...payload, refreshToken };
  }
}
