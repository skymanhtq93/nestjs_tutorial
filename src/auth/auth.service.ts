import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenDto } from './dto/create-token.dto';
import { compare } from 'bcrypt';
import { RefreshToken } from './entities/token.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private tokenRepository: Repository<RefreshToken>,
  ) {}

  private plusDays = 7 * 24 * 60 * 60 * 1000;

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const token = await this.createJwtToken(payload);
    await this.createRefreshToken(user, token);
    return {
      access_token: token,
    };
  }

  async updateToken(
    id: number,
    createTokenDto: CreateTokenDto,
  ): Promise<UpdateResult> {
    return this.tokenRepository.update(id, createTokenDto);
  }

  async removeToken(id: number): Promise<DeleteResult> {
    return await this.tokenRepository.delete(id);
  }

  async findTokenByToken(token: string): Promise<RefreshToken | undefined> {
    return this.tokenRepository.findOne({ token: token });
  }

  async createRefreshToken(user: any, token: string) {
    const refresh_token = new CreateTokenDto();
    const refresh_time = new Date(Date.now() + this.plusDays)
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '');
    refresh_token.token = token;
    refresh_token.userId = user.id;
    refresh_token.username = user.username;
    refresh_token.refresh_time = refresh_time;
    await this.tokenRepository.save(refresh_token);
  }

  async createJwtToken(payload: object) {
    return this.jwtService.sign(payload);
  }
}
