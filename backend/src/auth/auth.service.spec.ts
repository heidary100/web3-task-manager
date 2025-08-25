import { AuthService } from "./auth.service"
import { JwtService } from "@nestjs/jwt"
import { UnauthorizedException } from "@nestjs/common"
import { ethers } from "ethers"

class MockPrisma {
  user = {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  }
}

describe("AuthService", () => {
  let service: AuthService
  let prisma: MockPrisma
  let jwt: JwtService

  beforeEach(() => {
    prisma = new MockPrisma()
    jwt = new JwtService({ secret: "test-secret" })
    service = new AuthService((prisma as unknown) as any, jwt)
  })

  it("generates and stores a secure nonce", async () => {
    prisma.user.upsert.mockResolvedValue({})
    const { nonce } = await service.generateNonce("0xabc")
    expect(typeof nonce).toBe("string")
    expect(nonce).toHaveLength(32) // 16 bytes hex
    expect(prisma.user.upsert).toHaveBeenCalled()
  })

  it("verifies signature and issues JWT token", async () => {
    const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    const nonce = "deadbeefdeadbeefdeadbeefdeadbeef"
    prisma.user.findUnique.mockResolvedValue({ id: 1, nonce })
    prisma.user.update.mockResolvedValue({})

    jest.spyOn(ethers, "verifyMessage").mockReturnValue(address)

    const res = await service.verifySignature({ address, signature: "0xsign", nonce })
    expect(res.access_token).toBeDefined()
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { address }, data: { nonce: null } })
  })

  it("throws on invalid nonce", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, nonce: "different" })
    await expect(
      service.verifySignature({ address: "0xabc", signature: "0xsign", nonce: "nope" }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it("throws on invalid signature", async () => {
    const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    const nonce = "deadbeefdeadbeefdeadbeefdeadbeef"
    prisma.user.findUnique.mockResolvedValue({ id: 1, nonce })
    jest.spyOn(ethers, "verifyMessage").mockReturnValue("0xsomeoneelse")

    await expect(
      service.verifySignature({ address, signature: "0xsign", nonce }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
