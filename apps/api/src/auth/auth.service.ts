import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Register — নতুন user তৈরি
  async register(data: {
    name: string;
    email?: string;
    phone: string;
    password: string;
    blood_group: string;
    division: string;
    district: string;
    upazilla: string;
    union_name?: string;
    referral_code?: string;
  }) {
    // phone mandatory
    if (!data.phone) {
      throw new BadRequestException('Phone number দিতে হবে');
    }
    // address ও blood group mandatory
    if (!data.division || !data.district || !data.upazilla) {
      throw new BadRequestException('বিভাগ, জেলা এবং উপজেলা দিতে হবে');
    }
    if (!data.blood_group) {
      throw new BadRequestException('Blood Group দিতে হবে');
    }

    // email আগে আছে কিনা check
    if (data.email) {
      const existingUser = await this.usersService.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException('এই email দিয়ে আগেই account আছে');
      }
    }

    // phone আগে আছে কিনা check
    const existingPhone = await this.usersService.findByPhone(data.phone);
    if (existingPhone) {
      throw new BadRequestException('এই phone দিয়ে আগেই account আছে');
    }

    // Referral code valid কিনা check করো (থাকলে)
    let referredByUserId: string | undefined;
    if (data.referral_code) {
      const referrer = await this.usersService.findByReferralCode(
        data.referral_code,
      );
      if (!referrer) {
        throw new BadRequestException('Referral code টি সঠিক নয়');
      }
      referredByUserId = referrer.id;
    }

    // user তৈরি করো (referral থাকলে নতুন user ২৫ coin পাবে)
    const user = await this.usersService.createUser({
      ...data,
      referred_by: referredByUserId,
      health_coins: referredByUserId ? 25 : 0,
    });

    // Referrer কে ৫০ coin reward দেওয়া
    if (referredByUserId) {
      await this.usersService.addHealthCoins(referredByUserId, 50);
    }

    // token বানাও
    const token = this.generateToken(user.id, user.role_id);

    return {
      message: 'Registration সফল হয়েছে',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        blood_group: user.blood_group,
        division: user.division,
        district: user.district,
        upazilla: user.upazilla,
        union_name: user.union_name,
        referral_code: user.referral_code,
        health_coins: user.health_coins,
      },
    };
  }

  // Login
  async login(data: {
    email?: string;
    phone?: string;
    password: string;
  }) {
    let user = null;

    // email দিয়ে login
    if (data.email) {
      user = await this.usersService.findByEmail(data.email);
    }

    // phone দিয়ে login
    if (data.phone) {
      user = await this.usersService.findByPhone(data.phone);
    }

    // user না পেলে
    if (!user) {
      throw new UnauthorizedException('Email/Phone অথবা Password ভুল');
    }

    // password check
    const isPasswordValid = await this.usersService.validatePassword(
      data.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email/Phone অথবা Password ভুল');
    }

    // account বন্ধ থাকলে
    if (!user.is_active) {
      throw new UnauthorizedException('আপনার account বন্ধ করা হয়েছে');
    }

    // last login update
    await this.usersService.updateLastLogin(user.id);

    // token বানাও
    const token = this.generateToken(user.id, user.role_id);

    return {
      message: 'Login সফল হয়েছে',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        blood_group: user.blood_group,
        division: user.division,
        district: user.district,
        upazilla: user.upazilla,
        union_name: user.union_name,
        referral_code: user.referral_code,
        health_coins: user.health_coins,
      },
    };
  }

  // JWT Token বানানো
  private generateToken(userId: string, roleId: number) {
    return this.jwtService.sign({
      sub: userId,
      role_id: roleId,
    });
  }
}