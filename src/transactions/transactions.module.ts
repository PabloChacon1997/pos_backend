import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Product } from '@app/products/entities/product.entity';
import { CouponsModule } from '@app/coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionContents, Product]),
    CouponsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
