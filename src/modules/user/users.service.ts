import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }

  async create(data: Partial<User>) {
    const user = this.repo.create(data);

    return this.repo.save(user);
  }
}
