import { SetMetadata } from '@nestjs/common';

// Role IDs:
// 1 = super_admin
// 2 = admin
// 3 = moderator
// 4 = user

export const Roles = (...roles: number[]) => SetMetadata('roles', roles);

// সহজে ব্যবহারের জন্য constants
export const SUPER_ADMIN = 1;
export const ADMIN = 2;
export const MODERATOR = 3;
export const USER = 4;