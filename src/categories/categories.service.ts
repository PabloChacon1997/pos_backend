import { Injectable, Post } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  @Post()
  create(createCategoryDto: CreateCategoryDto) {
    return 'Create category';
  }
}
