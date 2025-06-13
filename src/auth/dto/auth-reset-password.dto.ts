import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  hash: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  verificationCode4: Number;

  @ApiPropertyOptional()
  @IsNotEmpty()
  email: string;

  @ApiProperty({example:"link|otp"})
  @IsNotEmpty()
  verificationType: string;
}
