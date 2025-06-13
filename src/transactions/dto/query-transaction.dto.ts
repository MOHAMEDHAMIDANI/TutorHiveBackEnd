import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
  IsArray,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Transaction } from '../domain/transaction';
import { User } from '../../users/domain/user';
import { Status } from '../../statuses/domain/status';
import { InfinityPaginationResponseDto } from 'src/utils/dto/infinity-pagination-response.dto';

export class FilterTransactionDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Title/description of the transaction',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Amount of points credited/debited',
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    type: () => User,
    description: 'The user whose points are being modified',
  })
  @IsOptional()
  @Type(() => User)
  user?: User;

  @ApiPropertyOptional({
    type: () => Status,
    description: 'The status of the transaction',
  })
  @IsOptional()
  @Type(() => Status)
  status?: Status;

  @ApiPropertyOptional({
    type: Date,
    description: 'When the transaction occurred',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class SortTransactionDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Transaction;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryTransactionDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterTransactionDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterTransactionDto)
  filters?: FilterTransactionDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortTransactionDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortTransactionDto)
  sort?: SortTransactionDto[] | null;
}


export class TransactionsReponse {
  @ApiProperty()
  @IsArray()
  @Type(() => InfinityPaginationResponseDto)
  transactions: InfinityPaginationResponseDto<Transaction>;

  @ApiProperty()
  @IsNumber()
  total: number;

}
