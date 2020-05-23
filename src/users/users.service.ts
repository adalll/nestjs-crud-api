import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, groups, friends } = createUserDto;
    const user = new User();
    user.id = uuid();
    user.firstName = firstName;
    user.lastName = lastName;
    user.groups = groups ? groups : [];
    user.friends = friends ? friends : [];
    await user.save();
    return user;
  };

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found!`);
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const { firstName, lastName, groups, friends } = updateUserDto;
    const user = await this.getUser(id);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (groups) user.groups = groups;
    if (friends) user.friends = friends;
    await user.save();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id);
    await this.userRepository.remove(user);
  }
}
