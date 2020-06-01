import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  groupIds: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  friendIds: string[];
}
