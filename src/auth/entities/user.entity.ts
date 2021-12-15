import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password: string;
}
