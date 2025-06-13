import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthConfirmEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  verificationCode4: Number;

  @ApiProperty()
  @IsNotEmpty()
  userId: Number;
}


export class AuthConfirmNewEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  verificationCode4: Number;

  @ApiProperty()
  @IsNotEmpty()
  userId: Number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
