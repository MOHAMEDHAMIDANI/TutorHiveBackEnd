import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

import { Transform, Type } from 'class-transformer';
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { StatusDto } from '../../statuses/dto/status.dto';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  
  @ApiPropertyOptional()
  title?: string;
  @ApiPropertyOptional()
  question?: string;

  @ApiPropertyOptional()
  answerType?: string;

  @ApiPropertyOptional()
  answers?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
  })
  rangeFrom: number;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
  })
  rangeTo: number;


  @ApiPropertyOptional({
    type: String,
    example: 'description',
  })
  description: string;

  @ApiPropertyOptional({
    type: String,
    example: 'single|multiple',
  })
  selectionType: string;


  @ApiPropertyOptional({
    type: String,
    example: 'Years old',
  })
  unit: string;

}
