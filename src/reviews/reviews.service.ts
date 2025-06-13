import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterReviewDto, SortReviewDto } from './dto/query-review.dto';
import { ReviewRepository } from './infrastructure/persistence/review.repository';
import { Review } from './domain/review';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { ServiceEntity } from 'src/services/infrastructure/persistence/relational/entities/service.entity';
import { ReviewEntity } from './infrastructure/persistence/relational/entities/review.entity';
import { User } from 'src/users/domain/user';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewRepository,
    private readonly usersService: UsersService
  ) {}

  async create(createProfileDto: CreateReviewDto, user: JwtPayloadType): Promise<Review> {
    const clonedPayload = {
      ...createProfileDto
    };

    

    const userObject = await this.usersService.findById(user.id);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'reviewerNotFound',
        },
      });
    }
    const forUser = new UserEntity();
    forUser.id = Number(clonedPayload.tutorId);

    const byUser = new UserEntity();
    byUser.id = Number(user.id);

    console.log("debu 1")

    // Check if user already reviewed this service/tutor
    const existingReview = await this.reviewsRepository.findManyWithPagination({
      filterOptions: {
        reviewedBy: byUser,
        // service: { id: clonedPayload.service.id },
        user: forUser
      },
      paginationOptions: {
        page: 1,
        limit: 1
      }
    });
    console.log("debu 2")

    // if (existingReview.length > 0) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       review: 'reviewAlreadyExists',
    //     },
    //   });
    // }
    console.log("debu 3")

    const forService = new ServiceEntity();
    forService.id = Number(clonedPayload.serviceId);
    console.log("debu 4")

    // Check if user already reviewed this service/tutor
    const existingReview2 = await this.reviewsRepository.findManyWithPagination({
      filterOptions: {
        reviewedBy: byUser,
        service: forService,
        // user: forUser
      },
      paginationOptions: {
        page: 1,
        limit: 1
      }
    });
    console.log("debu 5")

    // if (existingReview2.length > 0) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       review: 'reviewAlreadyExists',
    //     },
    //   });
    // }
    console.log("debu 6")

    console.log("cloned payload", clonedPayload);

    const review = new ReviewEntity();
    review.summary = clonedPayload.summary;
    review.reviewedBy = byUser;
    review.user = forUser;
    if (clonedPayload.serviceId) {
      const service = new ServiceEntity();
      service.id = Number(clonedPayload.serviceId);
      review.service = service;
    }

    review.knowledgeAndExpertise = clonedPayload.knowledgeAndExpertise;
    review.communicationSkills = clonedPayload.communicationSkills;
    review.preparednessAndOrganization = clonedPayload.preparednessAndOrganization;
    review.reliabilityAndPunctuality = clonedPayload.reliabilityAndPunctuality;
    review.professionalism = clonedPayload.professionalism;
    console.log("debu 7")
    console.log("review", review)
    return this.reviewsRepository.create(review);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterReviewDto | null;
    sortOptions?: SortReviewDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Review[]> {
    return this.reviewsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Review['id']): Promise<NullableType<Review>> {
    return this.reviewsRepository.findById(id);
  }

  async update(
    id: Review['id'],
    payload: DeepPartial<Review>,
    user: JwtPayloadType,
  ): Promise<Review | null> {
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

    const reviewerObject = await this.usersService.findById(user.id);

    if (!reviewerObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'reviewerNotFound',
        },
      });
    }

    const updatePayload: DeepPartial<Review> = {
      // knowledgeAndExpertise: clonedPayload.knowledgeAndExpertise,
      // communicationSkills: clonedPayload.communicationSkills,
      // preparednessAndOrganization: clonedPayload.preparednessAndOrganization,
      // reliabilityAndPunctuality: clonedPayload.reliabilityAndPunctuality,
      // professionalism: clonedPayload.professionalism,
      summary: clonedPayload.summary,
      status: clonedPayload.status
    } as DeepPartial<Review>;

    return null

    // return this.reviewsRepository.update(id, updatePayload);
  }

  async remove(id: Review['id']): Promise<void> {
    await this.reviewsRepository.remove(id);
  }

  async findByUserId(userId: User['id']): Promise<Review[]> {
    return this.reviewsRepository.findByUserId(userId);
  }

  async findByUserIds(userIds: User['id'][]): Promise<Review[]> {
    return this.reviewsRepository.findByUserIds(userIds);
  }

  
}
