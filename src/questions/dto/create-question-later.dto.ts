import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '../../statuses/dto/status.dto';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDtoLater {
  

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
  @ApiProperty({ example: 'what is your question', type: String })
  question: string;

  @ApiProperty()
  answerType: string;

  @ApiProperty()
  answers: string;


  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status: StatusDto;


}
