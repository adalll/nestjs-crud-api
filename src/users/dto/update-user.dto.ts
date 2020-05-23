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
  groups: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  friends: string[];
}
