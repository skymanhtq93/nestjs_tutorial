import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { isEmpty } from 'class-validator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('refresh')
  async refreshToken(@Request() req) {
    if (isEmpty(req.body.token)) {
      throw new HttpException('Missing token', HttpStatus.BAD_REQUEST);
    }
    const token = req.body.token;
    const now = new Date().getTime() / 1000;
    const refresh_token = await this.authService.findTokenByToken(token);
    const refresh_time = new Date(refresh_token.refresh_time).getTime() / 1000;
    if (!refresh_token) {
      throw new HttpException('Log out', HttpStatus.UNAUTHORIZED);
    } else if (refresh_time - now < 0) {
      await this.authService.removeToken(refresh_token.id);
      throw new HttpException('Log out', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: refresh_token.username, sub: refresh_token.id };
    const newToken = await this.authService.createJwtToken(payload);
    refresh_token.token = newToken;
    await this.authService.updateToken(refresh_token.id, refresh_token);

    return {
      access_token: newToken,
    };
  }
}
