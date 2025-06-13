import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Question } from '../domain/question';

export class FilterQuestionDto {
  
}

export class SortQuestionDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Question;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryQuestionDto {
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
    value ? plainToInstance(FilterQuestionDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterQuestionDto)
  filters?: FilterQuestionDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortQuestionDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortQuestionDto)
  sort?: SortQuestionDto[] | null;
}
