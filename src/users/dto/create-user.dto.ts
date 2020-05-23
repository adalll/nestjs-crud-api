import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  groups: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  friends: string[];
}
