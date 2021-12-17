import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../auth/entities/user.entity";

@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) {}

    async sendUserConfirmationMail(user: User) {
        await this.mailService.sendMail({
            to: user.email,
            subject: `Welcome to Leaptrade! ${user.firstName}`,
            text: "This is a welcome email",
            html: "<h1>This is a welcome email</h1>",
        });
    }

    async sendForgotPasswordMail(email: string, resetURL: string) {
        const text = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

        await this.mailService.sendMail({
            to: email,
            subject: "Your Password reset token (valid for only 10 minutes)",
            text,
            html: `<h3>${text}</h3>`,
        });
    }

    async sendPasswordResetConfirmationMail(user: User) {
        await this.mailService.sendMail({
            to: user.email,
            subject: `Password Changed!`,
            text: "You have changed your password",
            html: "<h1>You have changed your password</h1>",
        });
    }

    async sendPasswordUpdateEmail(user: User) {
        await this.mailService.sendMail({
            to: user.email,
            subject: `Password Updated!`,
            text: "You have successfully updated your password",
            html: "<h1>You have successfully updated your password</h1>",
        });
    }
}
