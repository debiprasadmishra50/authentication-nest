import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    transport: {
                        host: configService.get("EMAIL_HOST"),
                        port: configService.get("EMAIL_PORT"),
                        auth: {
                            user: configService.get("EMAIL_USERNAME"),
                            pass: configService.get("EMAIL_PASSWORD"),
                        },
                    },
                    defaults: {
                        from: "'no-reply' <noreply@leaptrade.com>",
                    },
                };
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
