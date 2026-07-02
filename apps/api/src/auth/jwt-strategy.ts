import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Authorization: Bearer <token>
      // এভাবে token পাঠাতে হবে

      ignoreExpiration: false,
      // expired token reject করবে

      secretOrKey: configService.get<string>('JWT_SECRET'),
      // .env থেকে secret নেবে
    });
  }

  async validate(payload: { sub: string; role_id: number }) {
    // token এর ভেতর থেকে user id নিয়ে
    // database থেকে user খুঁজবে
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account বন্ধ করা হয়েছে');
    }

    return user;
    // এই user টা প্রতিটা request এ
    // req.user হিসেবে পাওয়া যাবে
  }
}