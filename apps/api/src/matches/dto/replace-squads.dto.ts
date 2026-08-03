import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class SquadInputDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsDateString()
  day!: string;

  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetSize?: number;
}

export class ReplaceSquadsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadInputDto)
  squads!: SquadInputDto[];
}
