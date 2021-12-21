import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { User } from "../entities/user.entity";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { argon2hash } from "../argon2/argon2";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(createAuthDto: CreateUserDto): Promise<{ user: User; activateToken: string }> {
        let { password } = createAuthDto;

        // NOTE: For Bcrypt
        // password = await bcrypt.hash(password, 10);
        // NOTE: For Argon2
        password = await argon2hash(password);

        createAuthDto.password = password;

        try {
            const activateToken: string = crypto.randomBytes(32).toString("hex");

            let user = this.create(createAuthDto);
            user.activeToken = crypto.createHash("sha256").update(activateToken).digest("hex");

            user = await this.save(user);

            return { user, activateToken };
        } catch (err) {
            if (err.code === "23505") throw new ConflictException("Email already exists");
            else throw new InternalServerErrorException();
        }
    }

    async createPasswordResetToken(user: User): Promise<string> {
        const resetToken: string = crypto.randomBytes(32).toString("hex");

        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const timestamp = Date.now() + 10 * 60 * 1000;
        user.passwordResetExpires = timestamp.toString();

        await this.save(user);

        return resetToken;
    }
}
