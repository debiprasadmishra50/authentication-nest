import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: "password must contain minimum of 8 characters" })
    @MaxLength(32, { message: "password must contain maximum of 32 characters" })
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Weak Password",
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    passwordConfirm: string;
}
