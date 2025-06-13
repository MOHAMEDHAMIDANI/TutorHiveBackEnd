import { Module } from '@nestjs/common';
import { QuestionRepository } from '../question.repository';
import { QuestionsRelationalRepository } from './repositories/question.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity])],
  providers: [
    {
      provide: QuestionRepository,
      useClass: QuestionsRelationalRepository,
    },
  ],
  exports: [QuestionRepository],
})
export class RelationalQuestionPersistenceModule {}
