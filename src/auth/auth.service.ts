import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { PrismaClient, USER_ROLE } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as ms from 'ms';
import * as bcrypt from 'bcrypt';
import * as lodash from 'lodash';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  async login(input: LoginDto): Promise<any> {
    // 1. check if user exists
    let user = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user)
      throw new BadRequestException(
        'Incorrect email/phone number or password ',
      );

    // 4. verify password
    const isPasswordVerified = await bcrypt.compare(
      input.password,
      user.password,
    );

    if (!isPasswordVerified)
      throw new BadRequestException('invalid email/phoneNumber or password');

    // 5. generate tokens
    const tokens = this._generateAuthTokenPairs(user.id, user.role);

    return {
      tokens: tokens,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signup(input: SignupDto): Promise<any> {
    // 1. check if user exists
    let user = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (user) throw new BadRequestException('User already Exists');
    const hash = await bcrypt.hash(input.password, 8);

    await this.prisma.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.password,
        role: input.role,
      },
    });

    return {
      message: 'success',
    };
  }

  // Generate access and refresh tokens
  generateJwtToken(
    payload: { type: 'access' | 'refresh' } & Record<string, string>,
    lifetime: number,
  ) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: lifetime,
    });
    return token;
  }
  private _generateAuthTokenPairs(userId: string, role: USER_ROLE) {
    const __access = this.generateJwtToken(
      { type: 'access', userId, role },
      ms(`10m`) / 1000,
    );

    const refreshReference = this.generateRandomString('alphanumeric', 10);

    const __refresh = this.generateJwtToken(
      { type: 'refresh', userId, reference: refreshReference, role },
      ms(`5d`) / 1000,
    );

    return {
      __access,
      __refresh,
    };
  }

  private generateRandomString(
    characterType: 'alphanumeric' | 'numeric',
    tokenLength: number = 10,
  ) {
    // character mapping
    const characters = {
      alphanumeric:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      numeric: '0123456789',
    };

    // token creation
    const chars = characters[characterType];
    let token = '';

    // create token if value is not manually passed in
    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = lodash.random(chars.length - 1);
      token += chars[randomIndex];
    }

    return token;
  }
}
