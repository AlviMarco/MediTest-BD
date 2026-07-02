import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { BloodDonorsService } from './blood-donors.service';
import { SearchBloodDonorDto, UpdateBloodDonorDto } from './blood-donor.dto';

@ApiTags('Blood Donors')
@Controller('blood-donors')
export class BloodDonorsController {
  constructor(private readonly service: BloodDonorsService) {}

  // Public search — anyone can search for donors (even unauthenticated)
  @Public()
  @Get()
  findAll(@Query() filters: SearchBloodDonorDto) {
    return this.service.findAll(filters);
  }

  // Logged-in user এক ক্লিকে donor হবে (profile data থেকেই)
  @ApiBearerAuth()
  @Post('become-donor')
  becomeDonor(@Req() req) {
    return this.service.becomeDonor(req.user.id);
  }

  // Get current user's own donor profile
  @ApiBearerAuth()
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Update donor profile (last_donation_date, availability ইত্যাদি)
  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBloodDonorDto) {
    return this.service.update(id, dto);
  }

  // Mark donor available again (enforces 90-day cooldown)
  @ApiBearerAuth()
  @Put(':id/available')
  markAvailable(@Param('id') id: string) {
    return this.service.markAvailable(id);
  }
}