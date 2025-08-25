import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { BullModule } from "@nestjs/bull"
import { AuthModule } from "./auth/auth.module"
import { TasksModule } from "./tasks/tasks.module"
import { PrismaModule } from "./common/prisma/prisma.module"
import { HealthModule } from "./health/health.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: Number.parseInt(process.env.REDIS_DB) || 0,
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
