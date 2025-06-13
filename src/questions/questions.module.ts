import { Module } from '@nestjs/common';

import { QuestionsController } from './questions.controller';

import { QuestionsService } from './questions.service';
import { RelationalQuestionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';

const infrastructurePersistenceModule = RelationalQuestionPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService, infrastructurePersistenceModule],
})
export class QuestionsModule {}
