import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create task / reminder' })
  create(@CurrentUser() user: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Today\'s tasks' })
  findToday(@CurrentUser() user: any) {
    return this.tasksService.findToday(user.id);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Param('status') status: any) {
    return this.tasksService.updateStatus(user.id, id, status);
  }
}
