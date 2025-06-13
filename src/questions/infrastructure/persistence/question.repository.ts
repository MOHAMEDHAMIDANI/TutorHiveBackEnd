import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Question } from '../../domain/question';

import { FilterQuestionDto, SortQuestionDto } from '../../dto/query-question.dto';

export abstract class QuestionRepository {
  abstract create(
    data: Omit<Question, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Question>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterQuestionDto | null;
    sortOptions?: SortQuestionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Question[]>;

  abstract findById(id: Question['id']): Promise<NullableType<Question>>;
  // abstract findByEmail(email: Question['email']): Promise<NullableType<Question>>;
  
  abstract update(
    id: Question['id'],
    payload: DeepPartial<Question>,
  ): Promise<Question | null>;

  abstract remove(id: Question['id']): Promise<void>;
}
