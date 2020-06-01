import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../groups/group.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private userRepository: MongoRepository<User>,
    @InjectRepository(Group) private groupRepository: MongoRepository<Group>,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {
  }

  async putUser(id: string) {
    const user = await this.userRepository.findOne({ id });

    this.groupRepository.updateMany({
      where: {
        id: {
          $in: user.groups,
        },
      },
    }, { $addToSet: { users: user.id } });


    const groups = await this.groupRepository.find({
      where: {
        id: {
          $in: user.groups,
        },
      },
    });

    return groups;
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUser(id: string, throwError?: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user && throwError) {
      throw new NotFoundException(`User with id ${id} not found!`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, groups, friends } = createUserDto;
    const user = new User();
    user.id = uuid();
    user.firstName = firstName;
    user.lastName = lastName;
    user.groups = [];
    user.friends = [];
    if (groups) {

      // const existGroups = (await this.groupRepository.find({
      //   where: {
      //     id: {
      //       $in: groups,
      //     }
      //   }})).map(group => group.id);

      const existGroups = await this.groupRepository.find( { }, { 'title': 1, 'id': 1 } );


      await this.groupRepository.updateMany({
        id: {
          $in: groups,
        },
      }, { $addToSet: { users: user.id } });

      // const uniqGroups = groups.filter((item, idx, arr) => arr.indexOf(item) === idx);
      // for (const group of uniqGroups) {
      //   //Check if group exist
      //   if (await this.groupsService.getGroup(group)) {
      //     // Add user to groups from list
      //     await this.groupsService.addUserToGroup(user.id, group);
      //     // Add group to user's groups
      //     user.groups.push(group);
      //   }
      // }
      user.groups = groups;
    }
    if (friends) {

      await this.userRepository.updateMany({
        id: {
          $in: friends,
        },
      }, { $addToSet: { friends: user.id } });

      // const uniqFriends = friends.filter((item, idx, arr) => arr.indexOf(item) === idx);
      // for (const friend of uniqFriends) {
      //   //Check if user exist
      //   if (await this.getUser(friend)) {
      //     // Add user to friends from list
      //     await this.addUserToFriends(user.id, friend);
      //     // Add friend to friends list
      //     user.friends.push(friend);
      //   }
      // }
      user.friends = friends;
    }
    await user.save();
    return user;
  };

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const { firstName, lastName, groups, friends } = updateUserDto;
    const userCopy = Object.assign(await this.getUser(id, true));

    if (firstName) {
      userCopy.firstName = firstName;
    }
    if (lastName) {
      userCopy.lastName = lastName;
    }
    // If replace list of groups in user
    if (groups) {

      for (const group of groups) {
        // Check if we have new group not in old groups list
        if (userCopy.groups.indexOf(group) === -1) {
          // Check if group exist
          if (await this.groupsService.getGroup(group)) {
            // Add user to added groups
            await this.groupsService.addUserToGroup(userCopy.id, group);
            // Add group to groups list
            userCopy.groups.push(group);
          }
        }
      }
      for (const group of userCopy.groups) {
        // Check if group from old list not in new list
        if (groups.indexOf(group) === -1) {
          if (await this.groupsService.getGroup(group)) {
            // Remove user from removed groups
            await this.groupsService.deleteUserFromGroup(userCopy.id, group);
            // Remove group from list
            userCopy.groups = userCopy.groups.filter(item => item !== group);
          }
        }
      }
    }

    // If replace list of friends in user
    if (friends) {
      for (const friend of friends) {
        // Check if we have new friend not in old friends list
        if (userCopy.friends.indexOf(friend) === -1) {
          // Check if user exist
          if (await this.getUser(friend)) {
            // Add user to friends from new list
            await this.addUserToFriends(userCopy.id, friend);
            userCopy.friends.push(friend);
          }
        }
      }
      // Remove user from removed friends
      for (const friend of userCopy.friends) {
        if (friends.indexOf(friend) === -1) {
          // Check if user exist
          if (await this.getUser(friend)) {
            // Add user to friends from new list
            await this.deleteUserFromFriends(userCopy.id, friend);
            userCopy.friends = userCopy.friends.filter(item => item !== friend);
          }
        }
      }
    }
    await userCopy.save();
    return userCopy;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id, true);

    // Remove deleted user from all groups
    for (const group of user.groups) {
      await this.groupsService.deleteUserFromGroup(user.id, group);
    }
    // Remove deleted user from all friends
    for (const friend of user.friends) {
      await this.deleteUserFromFriends(user.id, friend);
    }
    await this.userRepository.remove(user);
  }

  async addGroupToUser(userId: string, groupId: string): Promise<void> {
    const userCopy = Object.assign(await this.getUser(userId));
    userCopy.groups.push(groupId);
    await userCopy.save();
  }

  async deleteGroupFromUser(userId: string, groupId: string): Promise<void> {
    const userCopy = Object.assign(await this.getUser(userId));
    userCopy.groups = userCopy.groups.filter(group => group !== groupId);
    await userCopy.save();
  }

  async addUserToFriends(userId: string, recieverUserId: string): Promise<void> {
    const userCopy = Object.assign(await this.getUser(recieverUserId));
    userCopy.friends.push(userId);
    await userCopy.save();
  }

  async deleteUserFromFriends(userId: string, recieverUserId: string): Promise<void> {
    const userCopy = Object.assign(await this.getUser(recieverUserId));
    userCopy.friends = userCopy.friends.filter(friend => friend !== userId);
    await userCopy.save();
  }

  async getManyUsers(usersIds: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: {
          $in: usersIds,
        },
      },
    });
  }
}
