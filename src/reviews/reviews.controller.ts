import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Request,
  Param,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { QueryReviewDto } from './dto/query-review.dto';
import { Review } from './domain/review';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { ReviewsService } from './reviews.service';

@Controller({
  path: 'reviews',
  version: '1',
})
@ApiTags('Reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: Review,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReviewDto: CreateReviewDto, @Request() request): Promise<Review> {
    return this.reviewsService.create(createReviewDto, request.user);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Review),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryReviewDto,
  ): Promise<InfinityPaginationResponseDto<Review>> {
    if (!query?.filters?.user && !query?.filters?.service) {
      throw new Error('Must provide either user or service filter');
    }

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 50;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.reviewsService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: Review['id']): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
