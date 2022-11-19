import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { Tokens } from '../tokens/interface/tokens.interface';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokensService,
  ) {}

  public async signupLocal(authDto: AuthDto): Promise<Tokens> {
    const hashedPassword = await argon2.hash(authDto.password);

    const user = await this.userService.createUser({
      email: authDto.email,
      hashedPassword,
    });

    const tokens = await this.tokenService.getTokens(user.id, user.email);
    await this.tokenService.updateRefreshToken(user.id, tokens.jwtRefreshToken);

    return tokens;
  }
}
