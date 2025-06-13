import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { UsersService } from "src/users/users.service";
import { QueryUserDto } from "src/users/dto/query-user.dto";
import { User } from "src/users/domain/user";
import { InfinityPaginationResponseDto } from "src/utils/dto/infinity-pagination-response.dto";
import { infinityPagination } from "src/utils/infinity-pagination";
import { NullableType } from "src/utils/types/nullable.type";
import { errorResponseDto } from "./apiResponse/dto/ErrorResponse.dto";
import { BookingsService } from "src/bookings/bookings.service";
import { Booking, BookingStatus } from "src/bookings/domain/booking";
import { QueryBookingDto } from "src/bookings/dto/query-booking.dto";
import { JobsService } from "src/jobs/jobs.service";
import { Job } from "src/jobs/domain/job";
import { QueryJobDto } from "src/jobs/dto/query-job.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UpdateUserDto } from "src/users/dto/update-user.dto";
import { UpdateBookingDto } from "src/bookings/dto/update-booking.dto";
import { AuthService } from "src/auth/auth.service";
import { AuthRegisterLoginDto } from "src/auth/dto/auth-register-login.dto";
import { LoginResponseDto } from "src/auth/dto/login-response.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AuthUpdateDto } from "src/auth/dto/auth-update.dto";
import { RolesGuard } from "src/roles/roles.guard";
import { Roles } from "src/roles/roles.decorator";
import { RoleEnum } from "src/roles/roles.enum";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
    private readonly jobService: JobsService,
    private readonly authService: AuthService
  ) {}
  // Create a new admin
  //create a new user
  @Post("users")
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: AuthRegisterLoginDto
  ): Promise<LoginResponseDto | errorResponseDto> {
    try {
      const user = await this.authService.register(createUserDto);
      if (!user) {
        throw new NotFoundException("User not created");
      }
      return user;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  // update a user
  @Put("users/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async updateUser(
    @Body() updateUserDto: AuthUpdateDto,
    @Request() request,
    @Param("id") id: string
  ): Promise<User | errorResponseDto> {
    try {
      const user = await this.authService.update(request.user, updateUserDto);
      if (!user) {
        throw new NotFoundException("User not updated");
      }
      return user;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }

  @Get("users")
  @HttpCode(HttpStatus.CREATED)
  async getUsers(
    @Query() query: QueryUserDto
  ): Promise<InfinityPaginationResponseDto<User>> {
    console.log(query);
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 200;
    if (limit > 50) {
      limit = 50;
    }
    return infinityPagination(
      await this.usersService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit }
    );
    // Your logic here
  }

  @Get("users/:id")
  @HttpCode(HttpStatus.CREATED)
  async getUserById(
    @Param("id") id: string
  ): Promise<NullableType<User> | errorResponseDto> {
    try {
      const user = await this.usersService.findById(id);

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }
  @Delete("users/:id")
  async deleteUser(@Param("id") id: string): Promise<errorResponseDto> {
    try {
      const user = await this.usersService.findById(id);

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        };
      }

      await this.usersService.remove(id);

      return {
        status: HttpStatus.OK,
        message: `User with ID ${id} has been successfully deleted`,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || "Internal Server Error",
      };
    }
  }
  // get all bookings
  @Get("bookings")
  async getBookings(
    @Query() query: QueryBookingDto
  ): Promise<InfinityPaginationResponseDto<Booking> | errorResponseDto> {
    try {
      console.log(query);
      const page = query?.page ?? 1;
      let limit = query?.limit ?? 200;
      if (limit > 50) {
        limit = 50;
      }
      const bookings = await infinityPagination(
        await this.bookingsService.findAllBookingsWithPagination({
          sortOptions: query?.sort,
          paginationOptions: {
            page,
            limit,
          },
        }),
        { page, limit }
      );
      if (bookings.data.length === 0) {
        throw new NotFoundException("No bookings found");
      }
      return bookings;
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }
  // get booking by id
  @Get("bookings/:id")
  async findById(
    @Param("id") id: Booking["id"]
  ): Promise<NullableType<Booking> | errorResponseDto> {
    try {
      const bookings = await this.bookingsService.findById(id);
      if (!bookings) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return bookings;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  // update booking status
  @Put("bookings/:id")
  async updateBookingStatus(
    @Param("id") id: Booking["id"],
    @Body() status: BookingStatus
  ): Promise<Boolean | errorResponseDto> {
    try {
      const booking = await this.bookingsService.updateBookingStatus(
        id,
        status
      );
      if (!booking) {
        throw new NotFoundException("Booking not updated");
      }
      return booking;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }

  // get all confirmed bookings

  @Get("get-confirmed-booking")
  async findAllConfirmedBookings(): Promise<Booking[] | errorResponseDto> {
    try {
      const confirmedBookings =
        await this.bookingsService.findAllConfirmedBookings();
      if (confirmedBookings.length === 0) {
        throw new NotFoundException("No confirmed bookings found");
      }
      return confirmedBookings;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Get("get-pending-booking")
  async findAllPendingBookings(): Promise<Booking[] | errorResponseDto> {
    try {
      const confirmedBookings =
        await this.bookingsService.findAllPendingBookings();
      if (confirmedBookings.length === 0) {
        throw new NotFoundException("No Pending bookings found");
      }
      return confirmedBookings;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Get("get-canceled-booking")
  async findAllCancelBookings(): Promise<Booking[] | errorResponseDto> {
    try {
      const confirmedBookings =
        await this.bookingsService.findAllCanceledBookings();
      if (confirmedBookings.length === 0) {
        throw new NotFoundException("No canceled bookings found");
      }
      return confirmedBookings;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Get("get-completed-booking")
  async findAllCompletedBookings(): Promise<Booking[] | errorResponseDto> {
    try {
      const confirmedBookings =
        await this.bookingsService.findAllCompletedBookings();
      if (confirmedBookings.length === 0) {
        throw new NotFoundException("No completed bookings found");
      }
      return confirmedBookings;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Delete("bookings/:bookingId")
  async deleteBooking(
    @Param("bookingId") bookingId: Booking["id"]
  ): Promise<void | errorResponseDto> {
    try {
      const existBooking = await this.bookingsService.findById(bookingId);
      if (!existBooking) {
        throw new NotFoundException(
          `Can't delete Booking with ID ${bookingId} not found`
        );
      }
      await this.bookingsService.remove(bookingId);
      return;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Get("jobs")
  async getJobs(
    @Query() query: QueryJobDto
  ): Promise<InfinityPaginationResponseDto<Job> | errorResponseDto> {
    try {
      const filterOptions = { ...query?.filters };
      const jobs = infinityPagination(
        await this.jobService.findManyWithPagination({
          filterOptions: filterOptions ? filterOptions : {},
          paginationOptions: {
            page: 1,
            limit: 200,
          },
        }),
        { page: 1, limit: 200 }
      );
      return jobs;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Get("jobs/:id")
  async getJob(@Param("id") id: Job["id"]) {
    try {
      const job = await this.jobService.findById(id);
      if (!job) {
        throw new NotFoundException(`Job with ID ${id} not found`);
      }
      return job;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
  @Delete("jobs/:id")
  async deleteJob(
    @Param("id") id: Job["id"]
  ): Promise<void | errorResponseDto> {
    try {
      const existJob = await this.jobService.findById(id);
      if (!existJob) {
        throw new NotFoundException(`Can't delete Job with ID ${id} not found`);
      }
      await this.jobService.remove(id);
      return;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }

  @Get("tutor-applications")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getPendingTutorApplications(): Promise<User[] | errorResponseDto> {
    try {
      const applications = await this.adminService.getPendingTutorApplications();
      if (applications.length === 0) {
        throw new NotFoundException("No pending tutor applications found");
      }
      return applications;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }

  @Post("tutor-applications/:id/approve")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async approveTutorApplication(
    @Param("id") id: string
  ): Promise<NullableType<User> | errorResponseDto> {
    try {
      let newVer=true;
      
      const user = await this.adminService.approveTutorApplication(Number(id));
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }

  @Post("tutor-applications/:id/reject")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async rejectTutorApplication(
    @Param("id") id: string,
    @Body() data: { reason: string }
  ): Promise<NullableType<User> | errorResponseDto> {
    try {
      const user = await this.adminService.rejectTutorApplication(
        Number(id),
        data.reason
      );
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
}
