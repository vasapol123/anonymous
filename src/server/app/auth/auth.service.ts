import { Injectable, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from '../tokens/interface/tokens.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  public async signupLocal(authDto: AuthDto): Promise<Tokens> {
    const hashedPassword = await argon2.hash(authDto.password);

    const user = await this.usersService.createUser({
      email: authDto.email,
      hashedPassword,
    });

    const tokens = await this.tokensService.getTokens(user.id, user.email);
    await this.tokensService.updateRefreshToken(
      user.id,
      tokens.jwtRefreshToken,
    );

    return tokens;
  }

  public async signinLocal(authDto: AuthDto): Promise<Tokens> {
    const user = await this.usersService.findUserByEmail(authDto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const passwordMatches = await argon2.verify(
      user.hashedPassword,
      authDto.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Password invalid');
    }

    const tokens = await this.tokensService.getTokens(user.id, user.email);
    await this.tokensService.updateRefreshToken(
      user.id,
      tokens.jwtRefreshToken,
    );

    return tokens;
  }

  public async logout(userId: number): Promise<boolean> {
    const user = await this.usersService.updateUser({
      id: userId,
      hashedRefreshToken: null,
    });
    return !!user;
  }

  public async rotateRefreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<Tokens> {
    return this.tokensService.rotateRefreshTokens(userId, refreshToken);
  }
}
