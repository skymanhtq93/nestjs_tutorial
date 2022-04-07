import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  userId: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  refresh_time: string;
}
