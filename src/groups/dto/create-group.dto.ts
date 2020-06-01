import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateGroupDto {

  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  userIds: string[];
}
