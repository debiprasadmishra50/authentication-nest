import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    type: "postgres",
                    host: configService.get("DB_HOST"),
                    port: +configService.get("DB_PORT"),
                    username: configService.get("DB_USER"),
                    password: configService.get("DB_PASSWORD"),
                    database: configService.get("DATABASE"),
                    // entities: [],
                    autoLoadEntities: true,
                    synchronize: true,
                };
            },
        }),
    ],
})
export class DatabaseModule {}
