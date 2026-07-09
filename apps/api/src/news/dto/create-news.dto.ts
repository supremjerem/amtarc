import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { NewsCategory } from '../../../generated/prisma/client';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsEnum(NewsCategory)
  category!: NewsCategory;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
