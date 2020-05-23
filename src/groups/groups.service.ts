import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './group.entity';

@Injectable()
export class GroupsService {

  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
  ) {
  }

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const { title, users } = createGroupDto;
    const group = new Group();
    group.id = uuid();
    group.title = title;
    group.users = users ? users : [];
    await group.save();
    return group;
  };

  async getGroups(): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async getGroup(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ id });
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found!`);
    }
    return group;
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const { title, users } = updateGroupDto;
    const group = await this.getGroup(id);
    if (title) group.title = title;
    if (users) group.users = users;
    await group.save();
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.getGroup(id);
    await this.groupRepository.remove(group);
  }
}
