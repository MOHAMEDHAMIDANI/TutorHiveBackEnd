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
  Patch,
  NotFoundException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
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
import { QueryJobDto } from './dto/query-job.dto';
import { Job, JobStatusEnum } from './domain/job';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { JobsService } from './jobs.service';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller({
  path: 'jobs',
  version: '1',
})
@ApiTags('Jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: Job,
    description: 'The job has been successfully created.',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJobDto: CreateJobDto, @Request() request): Promise<Job> {
    return this.jobsService.create(createJobDto, request.user);
  }

  @Get('my-jobs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student) 
  @ApiBearerAuth()
  @ApiOkResponse({
    type: InfinityPaginationResponseDto<Job>,
    description: 'Get list of jobs posted by authenticated user',
  })
  @HttpCode(HttpStatus.OK)
  async getMyJobs(
    @Query() query: QueryJobDto,
    @Request() request,
  ): Promise<InfinityPaginationResponseDto<Job>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions = { ...query?.filters, postedBy: request.user };
    const jobs = await this.jobsService.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPagination(jobs, { page, limit });
  }

  @Get('new')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: InfinityPaginationResponseDto<Job>,
    description: 'Get list of jobs with new status',
  })
  @HttpCode(HttpStatus.OK)
  async getNewJobs(
    @Query() query: QueryJobDto,
  ): Promise<InfinityPaginationResponseDto<Job>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions = { ...query?.filters, status: JobStatusEnum.new };
    const jobs = await this.jobsService.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPagination(jobs, { page, limit });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student) 
  @ApiBearerAuth()
  @ApiOkResponse({
    type: Job,
    description: 'Update job',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() request,
  ): Promise<Job> {
    return this.jobsService.update(Number(id), updateJobDto, request.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Delete job',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Request() request,
  ): Promise<void> {
    return this.jobsService.remove(Number(id));
  }

  @Get(':id')
  @ApiOkResponse({
    type: Job,
    description: 'Get job by ID',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.getOne(Number(id));
  }

}
