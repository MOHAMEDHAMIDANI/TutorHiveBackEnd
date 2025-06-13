import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'question',
})
export class QuestionEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'q',
  })
  @Index()
  @Column({ type: String, nullable: false })
  title: string;

  @ApiProperty({
    type: String,
    example: 'description',
  })
  @Column({ type: String, nullable: true })
  description: string;

  @ApiProperty({
    type: String,
    example: 'single|multiple',
  })
  @Column({ type: String, nullable: true })
  selectionType: string;


  @ApiProperty({
    type: String,
    example: 'Years old',
  })
  @Index()
  @Column({ type: String, nullable: true })
  unit: string;




  @ApiProperty({
    type: String,
    example: 'how old are you?',
  })
  @Index()
  @Column({ type: String, nullable: false })
  question: string;


  
  @ApiProperty({
    type: String,
    example: 'number | multiple | string',
  })
  @Index()
  @Column({ type: String, nullable: false })
  answerType: string;

  @ApiProperty({
    type: Number,
    example: '0',
  })
  @Index()
  @Column({ type: Number, nullable: true })
  rangeFrom: number;

  @ApiProperty({
    type: Number,
    example: '0',
  })
  @Index()
  @Column({ type: Number, nullable: true })
  rangeTo: number;



  @ApiProperty({
    type: String,
    example: 'q',
  })
  @Index()
  @Column({ type: String, nullable: true })
  answers: string;


  

  

  @ApiProperty({
    type: () => StatusEntity,
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
