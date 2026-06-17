import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../user/entities/user.entity";
import { Tenant } from "../tenant/tenant.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (exists) {
      throw new ConflictException("Email já cadastrado");
    }

    const slug = dto.clinicName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const tenant = this.tenantRepo.create({
      name: dto.clinicName,

      slug,

      email: dto.email,
    });

    await this.tenantRepo.save(tenant);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      tenantId: tenant.id,

      name: dto.name,

      email: dto.email,

      passwordHash,

      role: UserRole.TENANT_ADMIN,

      isActive: true,
    });

    await this.userRepo.save(user);

    const payload = {
      sub: user.id,

      email: user.email,

      role: user.role,

      tenantId: tenant.id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      message: "Conta criada com sucesso",

      access_token,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

        tenantId: tenant.id,
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const payload = {
      sub: user.id,

      email: user.email,

      tenantId: user.tenantId,

      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },
    };
  }
}
