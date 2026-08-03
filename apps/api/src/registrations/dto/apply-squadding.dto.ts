import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SquadAssignmentDto {
  @IsString()
  registrationId!: string;

  // null clears the assignment (back to the unassigned pool).
  @IsOptional()
  @IsString()
  squadId?: string | null;
}

export class ApplySquaddingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadAssignmentDto)
  assignments!: SquadAssignmentDto[];
}
