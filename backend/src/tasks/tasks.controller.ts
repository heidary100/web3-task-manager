import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import { TasksService } from "./tasks.service"
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

@ApiTags('tasks')
@ApiBearerAuth()
@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId)
  }

  @Post("bulk")
  @ApiOperation({ summary: 'Create multiple tasks at once' })
  @ApiResponse({ status: 201, description: 'Tasks created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createBulk(@Body() createTasksDto: { tasks: CreateTaskDto[] }, @Request() req) {
    return this.tasksService.createBulkTasks(createTasksDto.tasks, req.user.userId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = Number.parseInt(page) || 1
    const limitNum = Number.parseInt(limit) || 50
    return this.tasksService.findAll(req.user.userId, pageNum, limitNum)
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(+id, req.user.userId)
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(+id, updateTaskDto, req.user.userId)
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(+id, req.user.userId)
  }

  @Get("admin/job-stats")
  @ApiOperation({ summary: 'Get job processing statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getJobStats() {
    return this.tasksService.getJobStats()
  }

  @Post('admin/cleanup')
  @ApiOperation({ summary: 'Schedule cleanup of old tasks' })
  @ApiResponse({ status: 200, description: 'Cleanup scheduled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  scheduleCleanup(@Body() cleanupDto: { olderThanDays?: number }) {
    return this.tasksService.scheduleTaskCleanup(cleanupDto.olderThanDays);
  }

  @Post('admin/generate-stats')
  @ApiOperation({ summary: 'Generate task statistics for a user' })
  @ApiResponse({ status: 200, description: 'Statistics generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generateStats(@Request() req) {
    return this.tasksService.generateTaskStats(req.user.userId);
  }
}
