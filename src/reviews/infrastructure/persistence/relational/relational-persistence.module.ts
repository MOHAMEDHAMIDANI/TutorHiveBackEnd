import { Module } from '@nestjs/common';
import { ReviewRepository } from '../review.repository';
import { ReviewsRelationalRepository } from './repositories/review.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity])],
  providers: [
    {
      provide: ReviewRepository,
      useClass: ReviewsRelationalRepository,
    },
  ],
  exports: [ReviewRepository],
})
export class RelationalReviewPersistenceModule {}
