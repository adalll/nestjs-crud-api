import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: 'mongodb://localhost/users-groups',
  synchronize: true,
  useUnifiedTopology: true,
  entities: [User, Group],
};
