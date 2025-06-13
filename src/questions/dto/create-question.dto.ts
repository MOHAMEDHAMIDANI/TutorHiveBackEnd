import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '../../statuses/dto/status.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CreateQuestionDto {
  

  @ApiProperty()
  title: string;

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


  @ApiProperty()
  question: string;

  @ApiProperty()
  answerType: string;

  @ApiProperty()
  answers: string;




  @ApiProperty({ type: StatusDto })
  @Type(() => StatusDto)
  status: StatusDto;


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


}
