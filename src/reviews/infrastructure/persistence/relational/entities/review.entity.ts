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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ServiceEntity } from '../../../../../services/infrastructure/persistence/relational/entities/service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Min, Max } from 'class-validator';

@Entity({
  name: 'review',
})
export class ReviewEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for knowledge and expertise (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 2, scale: 1 })
  knowledgeAndExpertise: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for communication skills (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 2, scale: 1 })
  communicationSkills: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for preparedness and organization (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 2, scale: 1 })
  preparednessAndOrganization: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for reliability and punctuality (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 2, scale: 1 })
  reliabilityAndPunctuality: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    description: 'Rating for professionalism (1-5 stars)',
  })
  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 2, scale: 1 })
  professionalism: number;

  @ApiProperty({
    type: String,
    description: 'Summary review text',
    example: 'Great service, very professional and knowledgeable.',
  })
  @Column({ type: String, nullable: false })
  summary: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The user who received the review'
  })
  @ManyToOne(() => UserEntity, (user) => user.reviews_for_me)
  user: UserEntity;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The user who posted the review',
  })
  @ManyToOne(() => UserEntity, (user) => user.reviews_by_me)
  reviewedBy: UserEntity;

  @ApiProperty({
    type: () => ServiceEntity,
    required: false
  })
  @ManyToOne(() => ServiceEntity, {
    eager: true,
    nullable: true
  })
  service?: ServiceEntity;

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
