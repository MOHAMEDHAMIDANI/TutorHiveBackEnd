import { Module } from '@nestjs/common';

import { ReviewsController } from './reviews.controller';

import { ReviewsService } from './reviews.service';
import { RelationalReviewPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from 'src/users/users.module';

const infrastructurePersistenceModule = RelationalReviewPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService, infrastructurePersistenceModule],
})
export class ReviewsModule {}
