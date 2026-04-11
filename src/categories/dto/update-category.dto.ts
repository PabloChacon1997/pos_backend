import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNotEmpty({ message: 'El nombre de la categoria no puede ir vacio' })
  name: string;
}
