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
import { CreateBookingDto } from './dto/create-booking.dto';
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
import { QueryBookingByMeDto, QueryBookingDto } from './dto/query-booking.dto';
import { Booking, BookingStatus, BookingType, PaymentStatus } from './domain/booking';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { BookingsService } from './bookings.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';

@Controller({
  path: 'bookings',
  version: '1',
})
@ApiTags('Bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: Booking,
    description: 'Creates a new booking',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookingDto: CreateBookingDto, @Request() request): Promise<Booking> {
    return this.bookingsService.create(createBookingDto, request.user);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Booking),
    description: 'Returns paginated list of bookings',
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.student, RoleEnum.tutor)
  @ApiBearerAuth()
  @Get('/booked-by-others')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryBookingDto,
    @Request() request
  ): Promise<InfinityPaginationResponseDto<Booking>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const meE:UserEntity = new UserEntity()
    meE.id = request.user.id

    console.log("Looking for bookings where user", request.user.id, "is tutor or service provider");

    // Get bookings where user is either tutor or service provider
    return infinityPagination(
      await this.bookingsService.findManyWithPagination({
        filterOptions: {
          $or: [
            { tutor: meE },
            { serviceUserId: meE.id }
          ],
          ...query?.filters
        },
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Booking),
    description: 'Returns paginated list of bookings',
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.student, RoleEnum.tutor)
  @ApiBearerAuth()
  @Get('/booked-by-me')
  @HttpCode(HttpStatus.OK)
  async bookedByMe(
    @Query() query: QueryBookingByMeDto,
    @Request() request
  ): Promise<InfinityPaginationResponseDto<Booking>> {
    
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filt = {
      bookedBy: request.user.id,
      ...query?.filters
    }

    console.log("filt", filt)

    return infinityPagination(
      await this.bookingsService.findManyWithPagination({
        filterOptions: filt,
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
    type: Number,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: Booking['id']): Promise<void> {
    return this.bookingsService.remove(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id', 
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Booking,
    description: 'Get booking by id',
  })
  findById(@Param('id') id: Booking['id']): Promise<NullableType<Booking>> {
    return this.bookingsService.findById(id);
  }

  @Get('/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.student)
  @ApiBearerAuth()
  cancelBooking(@Param('id') id: Booking['id'], @Request() request): Promise<void> {
    return this.bookingsService.cancelBooking(id, request.user);
  }

  @Get('/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor)
  @ApiBearerAuth()
  confirmBooking(@Param('id') id: Booking['id'], @Request() request): Promise<void> {
    return this.bookingsService.confirmBooking(id, request.user);
  }

  @Get('/:id/complete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  completeBooking(@Param('id') id: Booking['id'], @Request() request): Promise<void> {
    return this.bookingsService.completeBooking(id, request.user);
  }


}
