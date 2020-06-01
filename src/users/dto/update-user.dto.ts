import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  groupIds: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  friendIds: string[];
}
