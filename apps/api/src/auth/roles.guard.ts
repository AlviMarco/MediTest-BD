import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // কোন role দরকার সেটা দেখো
    const requiredRoles = this.reflector.get<number[]>(
      'roles',
      context.getHandler(),
    );

    // role না থাকলে সবাই access করতে পারবে
    if (!requiredRoles) {
      return true;
    }

    // request থেকে user নাও
    const { user } = context.switchToHttp().getRequest();

    // user না থাকলে reject
    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // user এর role check করো
    const hasRole = requiredRoles.includes(user.role_id);

    if (!hasRole) {
      throw new ForbiddenException('এই কাজ করার অনুমতি নেই');
    }

    return true;
  }
}