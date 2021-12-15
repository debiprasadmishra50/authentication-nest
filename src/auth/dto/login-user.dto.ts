import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}
