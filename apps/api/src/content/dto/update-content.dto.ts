import { IsObject } from 'class-validator';

export class UpdateContentDto {
  @IsObject()
  data!: Record<string, unknown>;
}
