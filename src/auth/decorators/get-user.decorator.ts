import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../entities/user.entity";

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    // req.user.password = undefined;
    return req.user;
});
