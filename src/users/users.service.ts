import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
  }

  async getUsers(filterDto: GetUsersFilterDto): Promise<User[]> {
    return await this.userRepository.getUsers(filterDto);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

}
