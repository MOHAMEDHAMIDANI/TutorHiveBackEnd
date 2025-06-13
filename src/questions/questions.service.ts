import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterQuestionDto, SortQuestionDto } from './dto/query-question.dto';
import { QuestionRepository } from './infrastructure/persistence/question.repository';
import { Question } from './domain/question';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionsRepository: QuestionRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createProfileDto: CreateQuestionDto): Promise<Question> {
    console.log(" I did survice until here", createProfileDto)
    const clonedPayload = {
      ...createProfileDto,
    };

    if (clonedPayload.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }

    return this.questionsRepository.create(clonedPayload);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterQuestionDto | null;
    sortOptions?: SortQuestionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Question[]> {
    return this.questionsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Question['id']): Promise<NullableType<Question>> {
    return this.questionsRepository.findById(id);
  }

  // findByEmail(email: Question['email']): Promise<NullableType<Question>> {
  //   return this.questionsRepository.findByEmail(email);
  // }

  async update(
    id: Question['id'],
    payload: DeepPartial<Question>,
  ): Promise<Question | null> {
    const clonedPayload = { ...payload };

    if (clonedPayload.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }

    return this.questionsRepository.update(id, clonedPayload);
  }

  async remove(id: Question['id']): Promise<void> {
    await this.questionsRepository.remove(id);
  }
}
