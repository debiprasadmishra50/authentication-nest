import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerMiddleware } from "./core/logger.middleware";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env.stage.${process.env.STAGE}`],
        }),
        DatabaseModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("/**");
    }
}
