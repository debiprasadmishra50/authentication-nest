import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UseFilters,
    Res,
    UseGuards,
    Req,
    HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { TransformInterceptor } from "../core/transform.interceptor";
import { LoginUserDto } from "./dto/login-user.dto";
import { Request, Response } from "express";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
@UseInterceptors(TransformInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        const { user, token } = await this.authService.signup(createUserDto);

        res.status(HttpStatus.CREATED).json({
            status: "success",
            user,
            token,
        });
    }

    /* 
        Passport Auth
    */
    @Post("login")
    @UseGuards(LocalAuthGuard)
    async loginPassportLocal(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user;

        const token = await this.authService.signToken(user);

        res.cookie("jwt", token, {
            // secure: req.headers["x-forwarded-proto"] === "https" || true,
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
        });

        res.status(201).json({
            status: "success",
            user,
            token,
        });
    }

    /* 
        Jwt Auth
    */
    // @Post("login")
    // async loginJwt(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    //     const { user, token } = await this.authService.loginJwt(loginUserDto);

    //     res.cookie("jwt", token, {
    //         // secure: req.headers["x-forwarded-proto"] === "https" || true,
    //         httpOnly: true,
    //         expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
    //     });

    //     res.status(201).json({
    //         user,
    //         token,
    //     });
    // }

    @UseGuards(JwtAuthGuard)
    @Get("logout")
    async logout(@Res() res: Response) {
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000), // 10 secs
            httpOnly: true,
        });

        res.status(200).json({
            status: "success",
        });
    }
}
