import { Test } from "@nestjs/testing"
import { TasksController } from "./tasks.controller"
import { TasksService } from "./tasks.service"

describe("TasksController", () => {
  let controller: TasksController
  let service: any

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      createBulkTasks: jest.fn().mockResolvedValue({ count: 2, taskIds: [1, 2] }),
      findAll: jest.fn().mockResolvedValue({ tasks: [], total: 0, page: 1, limit: 50, totalPages: 0 }),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue({ id: 1 }),
      getJobStats: jest.fn().mockResolvedValue({}),
      scheduleTaskCleanup: jest.fn().mockResolvedValue({ id: "job" }),
      generateTaskStats: jest.fn().mockResolvedValue({ id: "job2" }),
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile()

    controller = moduleRef.get(TasksController)
  })

  it("creates task", async () => {
    const res = await controller.create({ title: "t" } as any, { user: { userId: 1 } } as any)
    expect(res.id).toBe(1)
  })

  it("creates bulk tasks", async () => {
    const res = await controller.createBulk({ tasks: [{ title: "a" }] }, { user: { userId: 1 } } as any)
    expect(res.count).toBe(2)
  })

  it("lists tasks", async () => {
    const res = await controller.findAll({ user: { userId: 1 } } as any, "1", "50")
    expect(res.page).toBe(1)
  })

  it("gets one, updates, deletes", async () => {
    await controller.findOne("1", { user: { userId: 1 } } as any)
    await controller.update("1", { title: "x" } as any, { user: { userId: 1 } } as any)
    await controller.remove("1", { user: { userId: 1 } } as any)
    expect(service.findOne).toHaveBeenCalled()
    expect(service.update).toHaveBeenCalled()
    expect(service.remove).toHaveBeenCalled()
  })

  it("admin endpoints", async () => {
    await controller.getJobStats()
    await controller.scheduleCleanup({ olderThanDays: 10 })
    await controller.generateStats({ user: { userId: 1 } } as any)
    expect(service.getJobStats).toHaveBeenCalled()
  })
})
