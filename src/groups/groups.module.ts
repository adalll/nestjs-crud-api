import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { GroupResolver } from './group.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => UsersModule)
  ],
  controllers: [GroupsController],
  providers: [GroupsService, UsersService, GroupResolver],
  exports: [GroupsService, TypeOrmModule.forFeature([Group])]
})
export class GroupsModule {}
