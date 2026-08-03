import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Division, ShooterCategory } from '../../generated/prisma/client';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  licenceNumber!: string;

  @IsOptional()
  @IsString()
  club?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsEnum(Division)
  division!: Division;

  @IsOptional()
  @IsEnum(ShooterCategory)
  category?: ShooterCategory;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  squadRequests?: string[];
}
