import { User } from '@devcollab/common/interfaces/user.interface';
import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../../common/guards/platform-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminServices } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class AdminController {
  constructor(private adminServices: AdminServices) {}
  @Get('users')
  getUsers(@Query() dto: AdminQueryDto) {
    return this.adminServices.listUsers(dto);
  }
  @Get('users/:userId')
  getUser(@Param('userId') userId: string) {
    return this.adminServices.getUser(userId);
  }
  @Patch('users/:userId/make-admin')
  makeAdmin(@Param('userId') userId: string) {
    return this.adminServices.setPlatformAdmin(userId, true);
  }
  @Patch('users/:userId/revoke-admin')
  revokeAdmin(@Param('userId') userId: string) {
    return this.adminServices.setPlatformAdmin(userId, false);
  }
  @Delete('users/:userId')
  delete(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.adminServices.deleteUser(userId, user);
  }
}
