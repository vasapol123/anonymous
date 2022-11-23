import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from '../tokens/interface/tokens.interface';
import { GetCurrentUserId } from '../../common/decorator/get-current-user-id.decorator';
import { GetCurrentUser } from '../../common/decorator/get-current-user.decorator';
import { TokensService } from '../tokens/tokens.service';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { Public } from '../../common/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
  ) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  public signupLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(authDto);
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  public signinLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(authDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async rotateRefreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.rotateRefreshTokens(userId, refreshToken);
  }
}
