import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Product } from '@app/products/entities/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (tem) => {
      const transaction = new Transaction();
      transaction.total = createTransactionDto.total;
      for (const content of createTransactionDto.contents) {
        const product = await tem.findOneBy(Product, {
          id: content.productId,
        });
        if (!product) {
          throw new BadRequestException('Producto no encontrado');
        }
        if (content.quantity > product.inventory) {
          throw new BadRequestException(
            `No hay cantidad de: ${product.name} suficiente para efectuar la compra`,
          );
        }
        product.inventory -= content.quantity;
        const transactionContents = new TransactionContents();
        transactionContents.price = content.price;
        transactionContents.product = product;
        transactionContents.quantity = content.quantity;
        transactionContents.transaction = transaction;
        await tem.save(transaction);
        await tem.save(transactionContents);
      }
    });
    return 'Venta almacenda correctamente';
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
