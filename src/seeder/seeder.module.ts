import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { typeOrmConfig } from '../config/typeorm.config';
import { Product } from '@app/products/entities/product.entity';
import { Category } from '@app/categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Product, Category]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
