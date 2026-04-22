import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Product } from '@app/products/entities/product.entity';
import { CouponsService } from '@app/coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (tem) => {
      const transaction = new Transaction();
      const total = createTransactionDto.contents.reduce(
        (total, item) => total + item.quantity * item.price,
        0,
      );
      transaction.total = total;
      if (createTransactionDto.coupon) {
        const coupon = await this.couponService.applyCoupon(
          createTransactionDto.coupon,
        );
        const discount = (coupon.percentage / 100) * total;
        transaction.discount = discount;
        transaction.coupon = coupon.name;
        transaction.total -= discount;
      }
      for (const content of createTransactionDto.contents) {
        const product = await tem.findOneBy(Product, {
          id: content.productId,
        });
        const errors: string[] = [];
        if (!product) {
          errors.push('Producto no encontrado');
          throw new NotFoundException(errors);
        }
        if (content.quantity > product.inventory) {
          errors.push(
            `No hay cantidad de: ${product.name} suficiente para efectuar la compra`,
          );
          throw new BadRequestException(errors);
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

  findAll(transactionDate?: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true,
      },
    };

    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('Fecha no válida');
      }
      const start = startOfDay(date);
      const end = endOfDay(date);

      options.where = {
        transactionDate: Between(start, end),
      };
    }
    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
      },
      relations: {
        contents: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaccion no encontrada');
    }

    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    if (!transaction) {
      throw new NotFoundException('Transaccion no encontrada');
    }

    for (const content of transaction.contents) {
      const product = await this.productRepository.findOneBy({
        id: content.product.id,
      });
      if (product) {
        product.inventory += content.quantity;
        await this.productRepository.save(product);
      }
      const transactionContents =
        await this.transactionContentsRepository.findOneBy({ id: content.id });
      if (transactionContents) {
        await this.transactionContentsRepository.remove(transactionContents);
      }
    }
    await this.transactionRepository.remove(transaction);
    return 'Transacción eliminada correctamente';
  }
}
