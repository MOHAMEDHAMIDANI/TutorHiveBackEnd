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
  Put,
  NotFoundException,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
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
import { QueryBidDto } from './dto/query-bid.dto';
import { Bid, BidStatusEnum } from './domain/bid';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { BidsService } from './bids.service';

@Controller({
  path: 'bids',
  version: '1',
})
@ApiTags('Bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: Bid,
    description: 'Create a new bid'
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBidDto: CreateBidDto, @Request() request): Promise<Bid> {
    return this.bidsService.create(createBidDto, request.user);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Bid),
    description: 'Get all bids with pagination'
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryBidDto,
  ): Promise<InfinityPaginationResponseDto<Bid>> {
    // Debugging: Log the incoming query
    console.debug('Received query:', query);

    // Check for required filters
    if (!query?.filters?.jobId && !query?.filters?.tutor) {
      console.error('Error: Must provide either jobId or tutor filter');
      throw new Error('Must provide either jobId or tutor filter');
    }

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    // Debugging: Log pagination details
    console.debug('Pagination - Page:', page, 'Limit:', limit);

    try {

      console.log('query?.filters', query?.filters);
      console.log('query?.sort', query?.sort);

      const result = await this.bidsService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      });

      // Debugging: Log the result before returning
      console.debug('Pagination result:', result);

      return infinityPagination(result, { page, limit });
    } catch (error) {
      console.error('Error fetching bids:', error);
      throw new Error('Failed to fetch bids');
    }
  }

  @Get(':id')
  @ApiOkResponse({
    type: Bid,
    description: 'Get bid by ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Bid ID'
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: Bid['id']): Promise<NullableType<Bid>> {
    const bid = await this.bidsService.findById(id)
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  @Put(':id/accept')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.student)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: Bid,
    description: 'Accept a bid'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Bid ID'
  })
  @HttpCode(HttpStatus.OK)
  async accept(@Param('id') id: Bid['id'], @Request() request): Promise<Bid> {
    const bid = await this.bidsService.findById(id)
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return this.bidsService.acceptBid(bid, request.user);
  }

  @Put(':id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.student)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: Bid,
    description: 'Reject a bid'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Bid ID'
  })
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: Bid['id']): Promise<Bid> {
    const bid = await this.bidsService.findById(id)
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return this.bidsService.rejectBid(bid);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Bid ID'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: Bid['id']): Promise<void> {
    return this.bidsService.remove(id);
  }

}
