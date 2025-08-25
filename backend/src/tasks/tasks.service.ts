import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bull"
import { Queue } from "bull"
import { PrismaService } from "../common/prisma/prisma.service"
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto"

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('tasks') private taskQueue: Queue
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        status: "pending",
      },
    })

    await this.taskQueue.add(
      "process-task",
      { taskId: task.id },
      {
        delay: 5000, // 5 second delay as specified
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 10, // Keep last 10 completed jobs
        removeOnFail: 5, // Keep last 5 failed jobs
      },
    )

    // Log task creation
    await this.prisma.taskLog.create({
      data: {
        taskId: task.id,
        action: "created",
        details: "Task created and queued for processing",
      },
    })

    return task
  }

  async findAll(userId: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.task.count({ where: { userId } }),
    ])

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { logs: true },
    })

    if (!task) {
      throw new NotFoundException("Task not found")
    }

    if (task.userId !== userId) {
      throw new ForbiddenException("Access denied")
    }

    return task
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId)

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    })

    // Log task update
    await this.prisma.taskLog.create({
      data: {
        taskId: id,
        action: "updated",
        details: `Task updated: ${JSON.stringify(updateTaskDto)}`,
      },
    })

    return updatedTask
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId)

    // Remove any pending jobs for this task
    const jobs = await this.taskQueue.getJobs(["waiting", "delayed"])
    for (const job of jobs) {
      if (job.data.taskId === id) {
        await job.remove()
      }
    }

    // Log task deletion
    await this.prisma.taskLog.create({
      data: {
        taskId: id,
        action: "deleted",
        details: "Task marked for deletion",
      },
    })

    return this.prisma.task.delete({
      where: { id },
    })
  }

  async createBulkTasks(tasks: CreateTaskDto[], userId: number) {
    const created = await this.prisma.$transaction(
      tasks.map((data) =>
        this.prisma.task.create({
          data: {
            ...data,
            userId,
            status: "pending",
          },
        }),
      ),
    )

    const taskIds = created.map((t) => t.id)

    // Queue bulk processing job
    await this.taskQueue.add(
      "process-bulk-tasks",
      { taskIds },
      {
        delay: 5000,
        attempts: 2,
        removeOnComplete: 5,
        removeOnFail: 3,
      },
    )

    return { count: created.length, taskIds }
  }

  async getJobStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.taskQueue.getWaiting(),
      this.taskQueue.getActive(),
      this.taskQueue.getCompleted(),
      this.taskQueue.getFailed(),
      this.taskQueue.getDelayed(),
    ])

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    }
  }

  async scheduleTaskCleanup(olderThanDays = 30) {
    return this.taskQueue.add(
      "cleanup-old-tasks",
      { olderThanDays },
      {
        repeat: { cron: "0 2 * * *" }, // Run daily at 2 AM
        removeOnComplete: 1,
        removeOnFail: 1,
      },
    )
  }

  async generateTaskStats(userId?: number) {
    return this.taskQueue.add(
      "generate-task-stats",
      { userId },
      {
        removeOnComplete: 5,
        removeOnFail: 2,
      },
    )
  }
}
