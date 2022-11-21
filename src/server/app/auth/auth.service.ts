import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from '../tokens/interface/tokens.interface';
import { GetCurrentUserId } from '../../common/decorator/get-current-user-id.decorator';
import { GetCurrentUser } from 'src/server/common/decorator/get-current-user.decorator';

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

  public async signinLocal(authDto: AuthDto): Promise<Tokens> {
    const user = await this.userService.findUserByEmail(authDto.email);
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

    const tokens = await this.tokenService.getTokens(user.id, user.email);
    await this.tokenService.updateRefreshToken(user.id, tokens.jwtRefreshToken);

    return tokens;
  }

  public async logout(userId: number): Promise<boolean> {
    const user = this.userService.updateUser({
      id: userId,
      hashedRefreshToken: null,
    });
    return !!user;
  }
}
