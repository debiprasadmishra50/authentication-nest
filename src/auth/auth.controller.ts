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
    InternalServerErrorException,
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
import { ThrottlerGuard } from "@nestjs/throttler";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GetUser } from "./decorators/get-user.decorator";
import { UpdateMyPasswordDto } from "./dto/update-password.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    @UseInterceptors(TransformInterceptor)
    async signup(
        @Body() createUserDto: CreateUserDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, token } = await this.authService.signup(createUserDto, req);

        res.cookie("jwt", token, {
            // secure: req.headers["x-forwarded-proto"] === "https" || true,
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
        });

        return {
            status: "success",
            user,
            token,
        };
    }

    @Patch("activate/:token")
    async activateAccount(@Param("token") token: string) {
        const isActivated = await this.authService.activateAccount(token);

        if (isActivated) return { status: "success", message: "Account Activated successfully" };
    }

    /* 
        Passport Auth
    */
    @Post("login")
    @UseGuards(LocalAuthGuard)
    @UseInterceptors(TransformInterceptor)
    async loginPassportLocal(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user;

        const token = await this.authService.signToken(user);

        res.cookie("jwt", token, {
            // secure: req.headers["x-forwarded-proto"] === "https" || true,
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
        });

        return { status: "success", user, token };
    }

    /* 
        Jwt Auth
    */
    // @Post("login")
    // @UseInterceptors(TransformInterceptor)
    // async loginJwt(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    //     const { user, token } = await this.authService.loginJwt(loginUserDto);

    //     res.cookie("jwt", token, {
    //         // secure: req.headers["x-forwarded-proto"] === "https" || true,
    //         httpOnly: true,
    //         expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
    //     });

    //     return { status: "success", user, token };
    // }

    @Get("logout")
    @UseGuards(JwtAuthGuard)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000), // 10 secs
            httpOnly: true,
        });

        return { status: "success" };
    }

    @Post("forgotPassword")
    async forgotPassword(@Body() forgotPassword: ForgotPasswordDto, @Req() req: Request) {
        const status = await this.authService.forgotPassword(forgotPassword?.email, req);

        if (!status) throw new InternalServerErrorException("Error sending email!");

        return {
            status: "success",
            message: "Password reset email sent successfully",
        };
    }

    @Patch("resetPassword/:token")
    @UseInterceptors(TransformInterceptor)
    async resetPassword(
        @Param("token") token: string,
        @Body() resetPassword: ResetPasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { updatedUser, newToken } = await this.authService.resetPassword(
            token,
            resetPassword,
        );

        res.cookie("jwt", newToken, {
            // secure: req.headers["x-forwarded-proto"] === "https" || true,
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
        });

        return { status: "success", user: updatedUser, token: newToken };
    }

    @Patch("updateMyPassword")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TransformInterceptor)
    async updateMyPassword(
        @Body() updateMyPassword: UpdateMyPasswordDto,
        @GetUser() user: User,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user: updatedUser, token: newToken } = await this.authService.updateMyPassword(
            updateMyPassword,
            user,
        );

        res.cookie("jwt", newToken, {
            // secure: req.headers["x-forwarded-proto"] === "https" || true,
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90days
        });

        return { status: "success", user: updatedUser, token: newToken };
    }
}
