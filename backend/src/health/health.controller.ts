import { Controller, Get } from "@nestjs/common"
import { PrismaService } from "../common/prisma/prisma.service"

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          database: "healthy",
          api: "healthy",
        },
      }
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        services: {
          database: "unhealthy",
          api: "healthy",
        },
        error: error.message,
      }
    }
  }
}
