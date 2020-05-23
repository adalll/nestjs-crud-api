import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateGroupDto {

  @IsOptional()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  users: string[];
}
