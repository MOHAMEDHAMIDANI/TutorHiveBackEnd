import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository } from 'typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterQuestionDto, SortQuestionDto } from '../../../../dto/query-question.dto';
import { Question } from '../../../../domain/question';

import { QuestionMapper } from '../mappers/question.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { QuestionRepository } from '../../question.repository';

@Injectable()
export class QuestionsRelationalRepository implements QuestionRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepository: Repository<QuestionEntity>,
  ) {}

  async create(data: Question): Promise<Question> {
    const persistenceModel = QuestionMapper.toPersistence(data);
    const newEntity = await this.questionsRepository.save(
      this.questionsRepository.create(persistenceModel),
    );
    return QuestionMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterQuestionDto | null;
    sortOptions?: SortQuestionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Question[]> {
    const where: FindOptionsWhere<QuestionEntity> = {};

    const entities = await this.questionsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((question) => QuestionMapper.toDomain(question));
  }

  async findById(id: Question['id']): Promise<NullableType<Question>> {
    const entity = await this.questionsRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? QuestionMapper.toDomain(entity) : null;
  }

  async findByType(answerType: Question['answerType']): Promise<NullableType<Question>> {
    if (!answerType) return null;

    const entity = await this.questionsRepository.findOne({
      where: { answerType },
    });

    return entity ? QuestionMapper.toDomain(entity) : null;
  }


  async update(id: Question['id'], payload: Partial<Question>): Promise<Question> {
    const entity = await this.questionsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Question not found');
    }

    const updatedEntity = await this.questionsRepository.save(
      this.questionsRepository.create(
        QuestionMapper.toPersistence({
          ...QuestionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return QuestionMapper.toDomain(updatedEntity);
  }

  async remove(id: Question['id']): Promise<void> {
    await this.questionsRepository.softDelete(id);
  }
}
