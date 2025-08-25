import { TasksService } from "./tasks.service"
import { Queue } from "bull"

class MockPrisma {
  task = {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
  }
  taskLog = {
    create: jest.fn(),
    deleteMany: jest.fn(),
  }
}

function createMockQueue() {
  return {
    add: jest.fn(),
    getJobs: jest.fn().mockResolvedValue([]),
    getWaiting: jest.fn().mockResolvedValue([]),
    getActive: jest.fn().mockResolvedValue([]),
    getCompleted: jest.fn().mockResolvedValue([]),
    getFailed: jest.fn().mockResolvedValue([]),
    getDelayed: jest.fn().mockResolvedValue([]),
  } as unknown as Queue
}

describe("TasksService", () => {
  let service: TasksService
  let prisma: MockPrisma
  let queue: Queue

  beforeEach(() => {
    prisma = new MockPrisma()
    queue = createMockQueue()
    ;(prisma as any).$transaction = jest
      .fn()
      .mockImplementation(async (actions: any[]) => actions.map((fn: any) => ({ id: 1 })))
    service = new TasksService((prisma as unknown) as any, (queue as any))
  })

  it("creates task and enqueues job with log", async () => {
    prisma.task.create.mockResolvedValue({ id: 1 })
    const res = await service.create({ title: "t" }, 10)
    expect(res).toEqual({ id: 1 })
    expect(queue.add).toHaveBeenCalled()
    expect(prisma.taskLog.create).toHaveBeenCalled()
  })

  it("paginates tasks", async () => {
    prisma.task.findMany.mockResolvedValue([{ id: 1 }])
    prisma.task.count.mockResolvedValue(1)
    const res = await service.findAll(10, 2, 1)
    expect(res.page).toBe(2)
    expect(res.limit).toBe(1)
    expect(res.totalPages).toBe(1)
  })

  it("finds one and enforces ownership", async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 1, userId: 10, logs: [] })
    const res = await service.findOne(1, 10)
    expect(res.id).toBe(1)
  })

  it("updates task and logs", async () => {
    jest.spyOn(service, "findOne").mockResolvedValue({ id: 1, userId: 10 } as any)
    prisma.task.update.mockResolvedValue({ id: 1, title: "x" })
    const res = await service.update(1, { title: "x" }, 10)
    expect(res.title).toBe("x")
    expect(prisma.taskLog.create).toHaveBeenCalled()
  })

  it("removes task and cancels queued jobs", async () => {
    jest.spyOn(service, "findOne").mockResolvedValue({ id: 1, userId: 10 } as any)
    ;(queue.getJobs as any).mockResolvedValue([{ data: { taskId: 1 }, remove: jest.fn() }])
    prisma.task.delete.mockResolvedValue({ id: 1 })
    const res = await service.remove(1, 10)
    expect(res.id).toBe(1)
  })

  it("bulk creates deterministically and enqueues bulk job", async () => {
    const res = await service.createBulkTasks([{ title: "a" }, { title: "b" }], 10)
    expect(res.count).toBe(2)
    expect(Array.isArray(res.taskIds)).toBe(true)
    expect(queue.add).toHaveBeenCalled()
  })

  it("returns queue job stats", async () => {
    const stats = await service.getJobStats()
    expect(stats).toEqual({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 })
  })

  it("schedules cleanup and generates stats jobs", async () => {
    await service.scheduleTaskCleanup(7)
    expect(queue.add).toHaveBeenCalledWith(
      "cleanup-old-tasks",
      { olderThanDays: 7 },
      expect.any(Object),
    )

    await service.generateTaskStats(10)
    expect(queue.add).toHaveBeenCalledWith(
      "generate-task-stats",
      { userId: 10 },
      expect.any(Object),
    )
  })
})
