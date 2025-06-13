import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { StatusDto } from '../../statuses/dto/status.dto';
import { User } from '../../users/domain/user';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiPropertyOptional({
    type: String,
    example: 'Professional Web Development'
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'path/to/image.jpg'
  })
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Full stack web development transactions using modern technologies'
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 99.99
  })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    type: () => User
  })
  @IsOptional()
  @Type(() => User)
  user?: User;

  @ApiPropertyOptional({
    type: () => StatusDto
  })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;
}
