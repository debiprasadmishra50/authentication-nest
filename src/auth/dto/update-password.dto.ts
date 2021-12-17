import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateMyPasswordDto {
    @IsNotEmpty()
    @IsString()
    passwordCurrent: string;

    @IsNotEmpty()
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
