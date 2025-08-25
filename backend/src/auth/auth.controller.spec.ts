import { Test } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"

describe("AuthController", () => {
  let controller: AuthController
  let service: any

  beforeEach(async () => {
    service = {
      generateNonce: jest.fn().mockResolvedValue({ nonce: "x" }),
      verifySignature: jest.fn().mockResolvedValue({ access_token: "t" }),
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile()

    controller = moduleRef.get(AuthController)
  })

  it("gets nonce", async () => {
    const res = await controller.getNonce({ address: "0xabc" } as any)
    expect(res.nonce).toBe("x")
  })

  it("verifies signature", async () => {
    const res = await controller.verifySignature({} as any)
    expect(res.access_token).toBe("t")
  })

  it("returns profile from request", () => {
    const req = { user: { id: 1 } } as any
    expect(controller.getProfile(req)).toEqual({ id: 1 })
  })
})
