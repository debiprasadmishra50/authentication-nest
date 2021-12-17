import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import * as compression from "compression";
import * as helmet from "helmet";
import * as csurf from "csurf";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix("/api/v1");
    app.enableCors();
    app.use(cookieParser());
    app.use(compression());
    app.use(
        csurf({
            cookie: { httpOnly: true, secure: true },
            ignoreMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
        }),
    );
    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: [
                        "'self'",
                        // "data:",
                        // "blob:",
                        "https://*.stripe.com",
                        "https://polyfill.io",
                        "https://*.cloudflare.com",
                        "http://127.0.0.1:8000/",
                        "https://*.steampowered.com",
                        // "ws:",
                    ],
                    baseUri: ["'self'"],
                    scriptSrc: [
                        "self",
                        "http://127.0.0.1:8000/",
                        "https://*.cloudflare.com",
                        "https://*.stripe.com",
                        "https://polyfill.io",
                        // "http:",
                        // "data:",
                    ],
                    styleSrc: ["self", "https:", "http:", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    fontSrc: ["'self'", "https:", "data:"],
                    childSrc: ["'self'", "blob:"],
                    styleSrcAttr: ["'self'", "'unsafe-inline'", "http:"],
                    frameSrc: ["'self'", "https://*.stripe.com"],
                },
            },
        }),
    );
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const port = process.env.PORT || 3000;
    await app.listen(port, () => {
        console.log("Server started on port: " + port);
    });
}
bootstrap();
