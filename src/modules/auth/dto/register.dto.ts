import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  clinicName: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
