import { Module } from '@nestjs/common';
import { ServiceRepository } from '../service.repository';
import { ServicesRelationalRepository } from './repositories/service.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from './entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity])],
  providers: [
    {
      provide: ServiceRepository,
      useClass: ServicesRelationalRepository,
    },
  ],
  exports: [ServiceRepository],
})
export class RelationalServicePersistenceModule {}
