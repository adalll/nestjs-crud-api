import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {
  }

  @Get()
  getGroups(): Promise<Group[]> {
    return this.groupsService.getGroups();
  }

  @Get('/:id')
  getGroup(@Param('id') id: string): Promise<Group> {
    return this.groupsService.getGroup(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(createGroupDto);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @Delete('/:id')
  deleteGroup(@Param('id') id: string): Promise<void> {
    return this.groupsService.deleteGroup(id);
  }

}
