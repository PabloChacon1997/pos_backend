import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from '@app/categories/entities/category.entity';
import { UploadImageModule } from '@app/upload-image/upload-image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), UploadImageModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
