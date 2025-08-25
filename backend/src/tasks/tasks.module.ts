import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bull"
import { TasksController } from "./tasks.controller"
import { TasksService } from "./tasks.service"
import { TaskProcessor } from "./task.processor"
import { PrismaModule } from "../common/prisma/prisma.module"
import { PrismaService } from "../common/prisma/prisma.service"

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "tasks",
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskProcessor],
  exports: [TasksService],
})
export class TasksModule {}
