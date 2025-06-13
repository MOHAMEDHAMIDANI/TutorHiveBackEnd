import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthConfirmPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  paymentHash: string;
}
