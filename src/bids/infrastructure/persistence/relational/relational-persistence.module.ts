import { Module } from '@nestjs/common';
import { BidRepository } from '../bid.repository';
import { BidsRelationalRepository } from './repositories/bid.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidEntity } from './entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BidEntity])],
  providers: [
    {
      provide: BidRepository,
      useClass: BidsRelationalRepository,
    },
  ],
  exports: [BidRepository],
})
export class RelationalBidPersistenceModule {}
