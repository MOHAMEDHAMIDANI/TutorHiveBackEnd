import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/reviews/infrastructure/persistence/relational/entities/review.entity';

@Entity({
  name: 'service',
})
export class ServiceEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'Professional Web Development',
  })
  @Index()
  @Column({ type: String, nullable: false })
  title: string;

  @ApiProperty({
    type: String,
    example: 'path/to/image.jpg',
  })
  @Column({ type: String, nullable: false })
  image: string;

  @ApiProperty({
    type: String,
    example: 'Full stack web development services using modern technologies',
  })
  @Column({ type: String, nullable: false })
  description: string;

  @ApiProperty({
    type: Number,
    example: 99.99,
  })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  user: UserEntity;

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

  @ApiProperty({
    type: () => [ReviewEntity],
  })
  @OneToMany(() => ReviewEntity, (review) => review.service)
  reviews?: ReviewEntity[];

  @ApiProperty({
    description: 'Academic subjects covered by this service',
    example: ['Mathematics', 'Physics', 'Computer Science'],
    isArray: true,
    type: String
  })
  @Column('simple-array')
  subjects: string[];

  @ApiProperty({
    description: 'Grade levels this service is appropriate for',
    example: ['High School', 'University', 'Graduate'],
    isArray: true,
    type: String
  })
  @Column('simple-array')
  gradeLevels: string[];


  @ApiProperty({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  @Column({ type: String, nullable: false })
  locationType: 'online' | 'offline' | 'both';
}
