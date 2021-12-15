import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtPayload } from "./dto/jwt-payload.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";

@Injectable()
export class AuthService {
    private readonly logger = new Logger("AUTH");

    constructor(
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async signup(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.createUser(createUserDto);

        this.logger.log("User Created");

        const token: string = await this.signToken(user);

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
}
