import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { GroupsModule } from '../groups/groups.module';
import { GroupsService } from '../groups/groups.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => GroupsModule)
  ],
  controllers: [UsersController],
  providers: [UsersService, GroupsService, UserResolver],
  exports: [
    UsersService,
    TypeOrmModule.forFeature([User])
  ]
})
export class UsersModule {
}
