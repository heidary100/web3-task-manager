import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import helmet from "helmet"
import * as compression from "compression"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  // Enable CORS for frontend
  app.enableCors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Security and performance middleware
  app.use(helmet())
  app.use(compression())

  const config = new DocumentBuilder()
    .setTitle('Web3 Task Manager API')
    .setDescription('RESTful API documentation for the Web3 Task Manager application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Redirect root to Swagger UI
  app.getHttpAdapter().get('/', (req, res) => {
    res.redirect('/api-docs');
  });

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Backend server running on http://localhost:${port}`)
}
bootstrap()
