import * as argon2 from "argon2";
import * as crypto from "crypto";

/**
 * Takes password as string and returns hashed password using argon2 algorithm
 * @param password Password to be masked
 * @returns hashed password using argon2 algorithm with argon2id specs
 */
const argon2hash = async (password: string): Promise<string> => {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        hashLength: 32,
        parallelism: 4,
        memoryCost: 65536,
        timeCost: 10,
        salt: crypto.randomBytes(16),
        saltLength: 16,
    });

    return hash;
};

/**
 * Takes hash and password as string and returns whether the password verifies with argon2 hash
 * @param hash argon2 hash
 * @param password password by user
 * @returns whether password verifies with argon2 hash
 */
const argon2verify = async (hash: string, password: string): Promise<boolean> => {
    return await argon2.verify(hash, password, { type: argon2.argon2id });
};

export { argon2hash, argon2verify };
