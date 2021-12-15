import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./repositories/user.repository";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([UserRepository]),
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get("JWT_SECRET"),
                    signOptions: {
                        expiresIn: configService.get("EXPIRES_IN"),
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {}
