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
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTransactionDto, TopUpDto } from './dto/create-transaction.dto';
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
import Stripe from 'stripe';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { QueryTransactionDto, TransactionsReponse } from './dto/query-transaction.dto';
import { Transaction } from './domain/transaction';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { TransactionsService } from './transactions.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';

const stripe = new Stripe(process.env.STRIPE_SECRET ?? '');

@Controller({
  path: 'transactions',
  version: '1',
})
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('topup')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async topupWallet(
    @Body() body: { paymentMethodId: string, amount: number },
    @Request() req,
  ) {
    try {
      console.log("=== Starting topup wallet ===");
      console.log("Request body:", body);
      console.log("User:", req.user);

      const { paymentMethodId, amount } = body;
      console.log("Payment Method ID:", paymentMethodId);
      console.log("Amount:", amount);

      console.log("Creating payment intent...");
      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        return_url: `${process.env.FRONTEND_DOMAIN}/payment-confirmation`,
      });
      console.log("Payment intent created:", paymentIntent);
      console.log("Payment intent status:", paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded");
        // Calculate credits (5 credits per dollar)
        const credits = amount * 5;
        console.log("Credits to add:", credits);
        
        // Add credits to user's wallet
        console.log("Adding credits to user wallet...");
        await this.transactionsService.addCredits(req.user.id, credits, 'TOPUP');
        console.log("Credits added successfully");

        return { success: true, credits };

      } else if (paymentIntent.status === 'requires_action') {
        console.log("Payment requires additional action");
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret
        };
      } else {
        console.log("Payment failed with status:", paymentIntent.status);
        throw new UnprocessableEntityException('Payment failed');
      }

    } catch (error) {
      console.error("Error in topup wallet:", error);
      if (error instanceof Stripe.errors.StripeError) {
        console.error("Stripe error:", error.message);
        throw new UnprocessableEntityException(error.message);
      }
      console.error("Unexpected error:", error);
      throw new UnprocessableEntityException('An unexpected error occurred');
    }
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Transaction),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.tutor, RoleEnum.student)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryTransactionDto,
    @Request() req,
  ): Promise<TransactionsReponse> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const userEntity = new UserEntity();
    userEntity.id = req.user.id;

    const filters = {
      ...query?.filters,
      user: userEntity
    };

    const totalBalance = await this.transactionsService.getTotalBalance(req.user.id);

    return {
      total: totalBalance,
      transactions: infinityPagination(
        await this.transactionsService.findManyWithPagination({
          filterOptions: filters,
          sortOptions: query?.sort,
          paginationOptions: {
            page,
            limit,
          },
        }),
        { page, limit },
      ),
    };
  }
}
