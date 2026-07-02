import { Controller, Get, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './user.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'সব user দেখুন (Admin)' })
  async findAll(@Request() req: any) {
    const roleId = req.user?.role_id;
    return this.usersService.findAll(roleId);
  }

  @Get('referral-stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'লগইন করা user এর referral পরিসংখ্যান দেখুন' })
  async getMyReferralStats(@Request() req: any) {
    return this.usersService.getReferralStats(req.user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একজন user দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'User আপডেট করুন (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'User নিষ্ক্রিয় করুন (Admin)' })
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }
}
