import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Nombre del producto es obligatorio' })
  @IsString({ message: 'Nombre no válido' })
  name: string;

  @IsNotEmpty({ message: 'Precio del producto es obligatorio' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Precio no válido' })
  price: number;

  @IsNotEmpty({ message: 'Cantidad del producto es obligatorio' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cantidad no válido' })
  inventory: number;

  @IsNotEmpty({ message: 'Categoria del producto es obligatorio' })
  @IsInt({ message: 'Categoria no válida' })
  categoryId: number;
}
