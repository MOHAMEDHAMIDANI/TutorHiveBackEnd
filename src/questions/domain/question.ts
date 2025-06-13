import { IsOptional } from 'class-validator';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';

const idType = Number;

export class Question {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'Question',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'description',
  })
  description: string;

  @ApiProperty({
    type: String,
    example: 'single|multiple',
  })
  selectionType: string;


  @ApiProperty({
    type: String,
    example: 'Years old',
  })
  unit: string;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsOptional()
  rangeFrom: number;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsOptional()
  rangeTo: number;





  @ApiProperty({
    type: String,
    example: 'Question itelf',
  })
  question: string;

  @ApiProperty({
    type: String,
    example: 'text, multiple-choice, etc',
  })
  answerType: string;

  @ApiProperty({
    type: String,
    example: 'Answers',
  })
  answers?: string;


  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
