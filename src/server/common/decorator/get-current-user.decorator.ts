import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadWithRefreshToken } from '../interface/jwt-payload.interface';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefreshToken,
    context: ExecutionContext,
  ): number => {
    const request = context.switchToHttp().getRequest();

    if (!data) {
      return request.user;
    }

    return request.user[data];
  },
);
