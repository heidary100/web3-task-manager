import { Injectable, UnauthorizedException } from "@nestjs/common"
import { randomBytes } from "crypto"
import { JwtService } from "@nestjs/jwt"
import { ethers } from "ethers"
import { PrismaService } from "../common/prisma/prisma.service"
import type { VerifySignatureDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateNonce(address: string): Promise<{ nonce: string }> {
    const nonce = randomBytes(16).toString("hex")

    // Store nonce in database or cache (using user table for simplicity)
    await this.prisma.user.upsert({
      where: { address },
      update: { nonce },
      create: { address, nonce },
    })

    return { nonce }
  }

  async verifySignature(verifyDto: VerifySignatureDto): Promise<{ access_token: string }> {
    const { address, signature, nonce } = verifyDto

    // Get user and verify nonce
    const user = await this.prisma.user.findUnique({
      where: { address },
    })

    if (!user || user.nonce !== nonce) {
      throw new UnauthorizedException("Invalid nonce")
    }

    // Verify signature
    const message = `Sign this message to authenticate: ${nonce}`
    const recoveredAddress = ethers.verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException("Invalid signature")
    }

    // Clear nonce after successful verification
    await this.prisma.user.update({
      where: { address },
      data: { nonce: null },
    })

    // Generate JWT
    const payload = { address, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async validateUser(address: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { address },
    })
    return user
  }
}
