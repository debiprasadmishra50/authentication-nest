import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { GetUser } from "./auth/decorators/get-user.decorator";
import { User } from "./auth/entities/user.entity";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("users/me")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async getUser(@GetUser() user: User): Promise<User> {
        return user;
    }
}
