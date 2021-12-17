import { MailerService } from "@nestjs-modules/mailer";
import {
    BadRequestException,
    Injectable,
    Logger,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Request } from "express";
import { MailService } from "../mail/mail.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtPayload } from "./dto/jwt-payload.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateMyPasswordDto } from "./dto/update-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";

@Injectable()
export class AuthService {
    private readonly logger = new Logger("AUTH");

    constructor(
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async signup(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.createUser(createUserDto);

        this.logger.log("User Created");

        const token: string = await this.signToken(user);

        this.logger.log("Sending welcome email");
        await this.mailService.sendUserConfirmationMail(user);

        // TODO: send account activation link

        // TODO: Send confirmation SMS to new user

        user.password = undefined;
        return { user, token };
    }

    /*
        For Passport local auth
    */
    async loginPassport(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        this.logger.log("Searching User with provided email");
        const user = await this.userRepository.findOne({ email });

        this.logger.log("Verifying User");
        if (user && (await bcrypt.compare(password, user.password))) {
            user.password = undefined;
            return user;
        }

        return null;
    }

    async signToken(user: any) {
        const payload: JwtPayload = { id: user.id };
        this.logger.log("Signing token");

        return this.jwtService.sign(payload);
    }

    /* 
        For Jwt auth
    */
    async loginJwt(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        this.logger.log("Searching User with provided email");
        const user = await this.userRepository.findOne({ email });

        this.logger.log("Verifing User");
        if (user && (await bcrypt.compare(password, user.password))) {
            const token: string = await this.signToken(user);

            user.password = undefined;
            return { user, token };
        }

        throw new UnauthorizedException("Invalid Credentials!!!");
    }

    async forgotPassword(email: string, req: Request) {
        this.logger.log("Searching User with provided email");
        const user = await this.userRepository.findOne({ email });

        if (!user) {
            throw new NotFoundException("User Not Found");
        }

        this.logger.log("Creating password reset token");
        const resetToken: string = await this.userRepository.updateUser(user);

        const resetURL = `${req.protocol}://${req.get(
            "host",
        )}/api/v1/auth/resetPassword/${resetToken}`;
        //NOTE: FOR UI
        // const resetURL = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;

        try {
            this.logger.log("Sending password reset token mail");
            await this.mailService.sendForgotPasswordMail(email, resetURL);

            return true;
        } catch (err) {
            user.passwordResetToken = null;
            user.passwordResetExpires = null;

            await this.userRepository.save(user);
            return false;
        }
    }

    async resetPassword(token: string, resetPassword: ResetPasswordDto) {
        const { password, passwordConfirm } = resetPassword;

        this.logger.log("Checking Password equality");
        if (password !== passwordConfirm) {
            throw new NotAcceptableException("password and passwordConfirm should match");
        }

        this.logger.log("Generating token");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        this.logger.log("Retrieving user");
        const user: User = await this.userRepository.findOne({ passwordResetToken: hashedToken });

        if (!user) throw new BadRequestException("Invalid token or token expired");

        this.logger.log("Checking if token is valid");
        const resetTime: number = +user.passwordResetExpires;
        if (Date.now() >= resetTime) {
            throw new BadRequestException("Invalid token or token expired");
        }

        this.logger.log("Hashing the password");
        user.password = await bcrypt.hash(password, 10);

        user.passwordResetExpires = null;
        user.passwordResetToken = null;

        this.logger.log("Update the user password");
        const updatedUser: User = await this.userRepository.save(user);

        const newToken: string = await this.signToken(updatedUser);

        this.logger.log("Sending reset password confirmation mail");
        await this.mailService.sendPasswordResetConfirmationMail(user);

        return { updatedUser, newToken };
    }

    async updateMyPassword(updateMyPassword: UpdateMyPasswordDto, user: User) {
        const { passwordCurrent, password, passwordConfirm } = updateMyPassword;

        this.logger.log("Verifying current password from user");
        if (!(await bcrypt.compare(passwordCurrent, user.password))) {
            throw new UnauthorizedException("Invalid password");
        }

        if (password === passwordCurrent) {
            throw new BadRequestException("New password and old password can not be same");
        }

        if (password !== passwordConfirm) {
            throw new BadRequestException("Password does not match with passwordConfirm");
        }

        this.logger.log("Masking Password");
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        this.logger.log("Saving Updated User");
        await this.userRepository.save(user);

        this.logger.log("Sending password update mail");
        await this.mailService.sendPasswordUpdateEmail(user);

        this.logger.log("Login the user and send the token again");
        const token: string = await this.signToken(user);

        return { user, token };
    }
}
