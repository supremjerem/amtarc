import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Division, ShooterCategory } from '../../generated/prisma/client';
import { REGISTRABLE_DIVISIONS } from '../registration-options';

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

  @IsString()
  @IsNotEmpty()
  club!: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsIn(REGISTRABLE_DIVISIONS)
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
