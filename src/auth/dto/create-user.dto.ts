import { Exclude } from "class-transformer";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsString({ message: "Email can not be only numbers" })
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(8, { message: "password must contain minimum of 8 characters" })
    @MaxLength(32, { message: "password must contain maximum of 32 characters" })
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Weak Password",
    })
    password: string;
}
