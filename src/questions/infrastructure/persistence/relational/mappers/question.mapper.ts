import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { Question } from '../../../../domain/question';
import { QuestionEntity } from '../entities/question.entity';

export class QuestionMapper {
  static toDomain(raw: QuestionEntity): Question {
    const domainEntity = new Question();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.question = raw.question;
    domainEntity.answerType = raw.answerType;
    if(raw.answers)
      domainEntity.answers = JSON.parse(raw.answers);
    domainEntity.description = raw.description;
    domainEntity.selectionType = raw.selectionType;
    domainEntity.unit = raw.unit;
    domainEntity.rangeFrom = raw.rangeFrom;
    domainEntity.rangeTo = raw.rangeTo;

    
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Question): QuestionEntity {

    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    const persistenceEntity = new QuestionEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answerType = domainEntity.answerType;
    if(domainEntity.answers)
      persistenceEntity.answers = JSON.stringify(domainEntity.answers);
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.selectionType = domainEntity.selectionType;
    persistenceEntity.unit = domainEntity.unit;

    if(domainEntity.rangeFrom)
      persistenceEntity.rangeFrom = domainEntity.rangeFrom;
    if(domainEntity.rangeTo)
      persistenceEntity.rangeTo = domainEntity.rangeTo;

    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    return persistenceEntity;
  }
}
