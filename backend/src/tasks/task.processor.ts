import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from "@nestjs/bull"
import { Injectable } from "@nestjs/common"
import type { Job } from "bull"
import { PrismaService } from "../common/prisma/prisma.service"
import { Logger } from "@nestjs/common"

@Injectable()

@Processor("tasks")
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name)

  constructor(
    private readonly prisma: PrismaService
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with result: ${JSON.stringify(result)}`)
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`)
  }

  @Process("process-task")
  async handleTaskProcessing(job: Job) {
    const { taskId } = job.data

    try {
      await job.progress(10)

      // Simulate some processing work
      await this.simulateProcessing(job, taskId)

      await job.progress(50)

      // Update task status to processed
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: "processed" },
      })

      await job.progress(80)

      // Create task log
      await this.prisma.taskLog.create({
        data: {
          taskId,
          action: "processed",
          details: "Task processed successfully after 5 second delay",
        },
      })

      await job.progress(100)

      this.logger.log(`✅ Task ${taskId} processed successfully`)
      return { taskId, status: "processed", processedAt: new Date() }
    } catch (error) {
      this.logger.error(`❌ Error processing task ${taskId}:`, error)

      // Update task status to failed
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: "failed" },
      })

      // Create error log
      await this.prisma.taskLog.create({
        data: {
          taskId,
          action: "failed",
          details: `Task processing failed: ${error.message}`,
        },
      })

      throw error // Re-throw to mark job as failed
    }
  }

  @Process("process-bulk-tasks")
  async handleBulkTaskProcessing(job: Job) {
    const { taskIds } = job.data
    const results = []

    try {
      this.logger.log(`Processing ${taskIds.length} tasks in bulk`)

      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i]
        const progress = Math.round(((i + 1) / taskIds.length) * 100)

        try {
          // Process individual task
          await this.simulateProcessing(job, taskId)

          // Update task status
          await this.prisma.task.update({
            where: { id: taskId },
            data: { status: "processed" },
          })

          // Log the action
          await this.prisma.taskLog.create({
            data: {
              taskId,
              action: "bulk_processed",
              details: `Task processed in bulk operation (${i + 1}/${taskIds.length})`,
            },
          })

          results.push({ taskId, status: "processed" })
        } catch (error) {
          this.logger.error(`Failed to process task ${taskId} in bulk:`, error)

          await this.prisma.task.update({
            where: { id: taskId },
            data: { status: "failed" },
          })

          await this.prisma.taskLog.create({
            data: {
              taskId,
              action: "bulk_failed",
              details: `Task failed in bulk operation: ${error.message}`,
            },
          })

          results.push({ taskId, status: "failed", error: error.message })
        }

        await job.progress(progress)
      }

      this.logger.log(`✅ Bulk processing completed. Processed ${results.length} tasks`)
      return { processedCount: results.length, results }
    } catch (error) {
      this.logger.error("❌ Bulk processing failed:", error)
      throw error
    }
  }

  @Process("cleanup-old-tasks")
  async handleTaskCleanup(job: Job) {
    const { olderThanDays = 30 } = job.data

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      // Find old completed tasks
      const oldTasks = await this.prisma.task.findMany({
        where: {
          status: "processed",
          updatedAt: {
            lt: cutoffDate,
          },
        },
        select: { id: true },
      })

      if (oldTasks.length === 0) {
        this.logger.log("No old tasks to cleanup")
        return { deletedCount: 0 }
      }

      // Delete old task logs first (due to foreign key constraint)
      await this.prisma.taskLog.deleteMany({
        where: {
          taskId: {
            in: oldTasks.map((t) => t.id),
          },
        },
      })

      // Delete old tasks
      const deleteResult = await this.prisma.task.deleteMany({
        where: {
          id: {
            in: oldTasks.map((t) => t.id),
          },
        },
      })

      this.logger.log(`✅ Cleaned up ${deleteResult.count} old tasks`)
      return { deletedCount: deleteResult.count }
    } catch (error) {
      this.logger.error("❌ Task cleanup failed:", error)
      throw error
    }
  }

  @Process("generate-task-stats")
  async handleTaskStatsGeneration(job: Job) {
    const { userId } = job.data

    try {
      const stats = await this.prisma.task.groupBy({
        by: ["status"],
        where: userId ? { userId } : {},
        _count: {
          status: true,
        },
      })

      const totalTasks = await this.prisma.task.count({
        where: userId ? { userId } : {},
      })

      const recentTasks = await this.prisma.task.count({
        where: {
          ...(userId ? { userId } : {}),
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      })

      const statsResult = {
        totalTasks,
        recentTasks,
        statusBreakdown: stats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status
            return acc
          },
          {} as Record<string, number>,
        ),
        generatedAt: new Date(),
      }

      this.logger.log(`✅ Generated task statistics: ${JSON.stringify(statsResult)}`)
      return statsResult
    } catch (error) {
      this.logger.error("❌ Task stats generation failed:", error)
      throw error
    }
  }

  private async simulateProcessing(job: Job, taskId: number): Promise<void> {
    // Simulate processing time (5 seconds as specified in requirements)
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Simulate potential random failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`Random processing failure for task ${taskId}`)
    }
  }
}
