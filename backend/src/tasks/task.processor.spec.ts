import { TaskProcessor } from "./task.processor"
import { PrismaService } from "../common/prisma/prisma.service"

function createJob(data: any) {
  return {
    id: 1,
    name: "test",
    data,
    progress: jest.fn(),
  } as any
}

describe("TaskProcessor", () => {
  let prisma: any
  let processor: TaskProcessor

  beforeEach(() => {
    jest.useFakeTimers()
    prisma = {
      task: {
        update: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      taskLog: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any as PrismaService

    processor = new TaskProcessor(prisma as PrismaService)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it("processes a single task successfully", async () => {
    const job = createJob({ taskId: 1 })
    jest.spyOn<any, any>(processor as any, "simulateProcessing").mockResolvedValue(undefined)
    prisma.task.update.mockResolvedValue({})
    prisma.taskLog.create.mockResolvedValue({})

    // cover queue hooks as well
    processor.onActive(job)
    const res = await processor.handleTaskProcessing(job)
    processor.onCompleted(job, res)

    expect(res.status).toBe("processed")
    expect(prisma.task.update).toHaveBeenCalled()
    expect(prisma.taskLog.create).toHaveBeenCalled()
  })

  it("marks task failed on error", async () => {
    const job = createJob({ taskId: 1 })
    jest.spyOn<any, any>(processor as any, "simulateProcessing").mockRejectedValue(new Error("x"))
    prisma.task.update.mockResolvedValue({})
    prisma.taskLog.create.mockResolvedValue({})

    await expect(processor.handleTaskProcessing(job)).rejects.toBeInstanceOf(Error)
    processor.onFailed(job, new Error("x"))
    expect(prisma.task.update).toHaveBeenCalled()
    expect(prisma.taskLog.create).toHaveBeenCalled()
  })

  it("bulk processes tasks", async () => {
    const job = createJob({ taskIds: [1, 2] })
    jest.spyOn<any, any>(processor as any, "simulateProcessing").mockResolvedValue(undefined)
    prisma.task.update.mockResolvedValue({})
    prisma.taskLog.create.mockResolvedValue({})

    const res = await processor.handleBulkTaskProcessing(job)
    expect(res.processedCount).toBe(2)
  })

  it("bulk handles per-item error path", async () => {
    const job = createJob({ taskIds: [1] })
    jest
      .spyOn<any, any>(processor as any, "simulateProcessing")
      .mockRejectedValueOnce(new Error("boom"))
    prisma.task.update.mockResolvedValue({})
    prisma.taskLog.create.mockResolvedValue({})

    const res = await processor.handleBulkTaskProcessing(job)
    expect(res.results[0].status).toBe("failed")
  })

  it("bulk outer catch when prisma throws", async () => {
    const job = createJob({ taskIds: [1] })
    jest.spyOn<any, any>(processor as any, "simulateProcessing").mockResolvedValue(undefined)
    prisma.task.update.mockRejectedValueOnce(new Error("db"))
    const res = await processor.handleBulkTaskProcessing(job)
    expect(res.results[0].status).toBe("failed")
  })

  it("cleans up old tasks", async () => {
    const job = createJob({ olderThanDays: 1 })
    prisma.task.findMany.mockResolvedValue([{ id: 1 }])
    prisma.taskLog.deleteMany = jest.fn().mockResolvedValue({})
    prisma.task.deleteMany = jest.fn().mockResolvedValue({ count: 1 })

    const res = await processor.handleTaskCleanup(job)
    expect(res.deletedCount).toBe(1)
  })

  it("cleanup no-op when no old tasks", async () => {
    const job = createJob({ olderThanDays: 1 })
    prisma.task.findMany.mockResolvedValue([])
    const res = await processor.handleTaskCleanup(job)
    expect(res.deletedCount).toBe(0)
  })

  it("cleanup error catch when prisma throws", async () => {
    const job = createJob({ olderThanDays: 1 })
    prisma.task.findMany.mockRejectedValue(new Error("db"))
    await expect(processor.handleTaskCleanup(job)).rejects.toBeInstanceOf(Error)
  })

  it("generates task stats", async () => {
    const job = createJob({ userId: 1 })
    prisma.task.groupBy.mockResolvedValue([{ status: "PROCESSED", _count: { status: 2 } }])
    prisma.task.count.mockResolvedValue(2)

    const res = await processor.handleTaskStatsGeneration(job)
    expect(res.totalTasks).toBe(2)
    expect(res.statusBreakdown.PROCESSED).toBe(2)
  })

  it("generates global stats without userId", async () => {
    const job = createJob({})
    prisma.task.groupBy.mockResolvedValue([{ status: "PROCESSED", _count: { status: 3 } }])
    prisma.task.count.mockResolvedValue(3)

    const res = await processor.handleTaskStatsGeneration(job)
    expect(res.totalTasks).toBe(3)
    expect(res.statusBreakdown.PROCESSED).toBe(3)
  })

  it("outer catch triggers when taskIds is invalid", async () => {
    const job = createJob({ taskIds: null })
    await expect(processor.handleBulkTaskProcessing(job)).rejects.toBeInstanceOf(Error)
  })

  it("stats generation catch on prisma error", async () => {
    const job = createJob({ userId: 1 })
    prisma.task.groupBy.mockRejectedValue(new Error("db"))
    await expect(processor.handleTaskStatsGeneration(job)).rejects.toBeInstanceOf(Error)
  })

  it("covers simulateProcessing happy path and random failure", async () => {
    const job = createJob({})
    // happy path
    jest.spyOn(global.Math, "random").mockReturnValue(0.5)
    const p1 = (processor as any).simulateProcessing(job, 1)
    jest.advanceTimersByTime(5000)
    await expect(p1).resolves.toBeUndefined()

    // failure path (random < 0.05)
    ;(global.Math.random as jest.Mock).mockReturnValue(0.01)
    const p2 = (processor as any).simulateProcessing(job, 2)
    jest.advanceTimersByTime(5000)
    await expect(p2).rejects.toBeInstanceOf(Error)
  })
})
