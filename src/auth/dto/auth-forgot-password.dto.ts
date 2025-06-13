import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthForgotPasswordDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty({example:true})
  @IsNotEmpty()
  sendVerification: boolean;

  @ApiProperty({example:"link|otp"})
  @IsNotEmpty()
  verificationType: string;

  

}

export class SuccessDTO{
  done:boolean;
}