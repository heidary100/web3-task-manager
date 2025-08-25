import { HealthController } from "./health.controller"

describe("HealthController", () => {
  it("returns ok when DB query succeeds", async () => {
    const prisma: any = { $queryRaw: jest.fn().mockResolvedValue(1) }
    const ctrl = new HealthController(prisma)
    const res = await ctrl.check()
    expect(res.status).toBe("ok")
    expect(res.services.database).toBe("healthy")
  })

  it("returns error when DB query fails", async () => {
    const prisma: any = { $queryRaw: jest.fn().mockRejectedValue(new Error("db")) }
    const ctrl = new HealthController(prisma)
    const res = await ctrl.check()
    expect(res.status).toBe("error")
    expect(res.services.database).toBe("unhealthy")
  })
})
