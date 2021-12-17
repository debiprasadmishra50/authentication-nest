import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { map } from "rxjs/operators";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        return next.handle().pipe(
            map((data) => {
                // console.log(data);

                // const { user } = data;
                // if (user) {
                //     user.password = undefined;
                //     // user.passwordResetToken = undefined;
                //     // user.passwordResetExpires = undefined;
                // }

                // data.user = user;

                return instanceToPlain(data);
            }),
        );
    }
}
