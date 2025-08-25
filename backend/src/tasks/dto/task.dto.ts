import { IsString, IsOptional, IsIn } from "class-validator"

export class CreateTaskDto {
  @IsString()
  title: string

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsIn(["pending", "processed", "failed"])
  @IsOptional()
  status?: string
}
