import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { CreateUserDto } from './dto/create-user-dto';
import { v4 as uuid } from 'uuid';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  async getUsers(filterDto: GetUsersFilterDto): Promise<User[]> {
    const { search } = filterDto;
    const query = this.createQueryBuilder('user');

    if (search) {
      query.andWhere('(user.firstName LIKE :search OR user.lastName LIKE :search)', { search: `%${search}%` });
    }
    const users = query.getMany();
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName } = createUserDto;
    const user = new User();
    user.id = uuid();
    user.firstName = firstName;
    user.lastName = lastName;
    user.groups = [];
    user.friends = [];
    await user.save();
    return user;
  };

}
