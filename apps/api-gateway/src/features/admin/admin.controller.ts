import { User } from '@devcollab/common/interfaces/user.interface';
import { Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../../common/guards/platform-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminServices } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';

@Controller('admin')
@UseGuards(PlatformAdminGuard, JwtAuthGuard)
export class AdminController {
  constructor(private adminServices: AdminServices) {}
  /**
GET    /admin/users                        → adminService.listUsers(page, limit)
GET    /admin/users/:userId                → adminService.getUser(userId)
PATCH  /admin/users/:userId/make-admin     → adminService.setPlatformAdmin(userId, true)
PATCH  /admin/users/:userId/revoke-admin   → adminService.setPlatformAdmin(userId, false)
DELETE /admin/users/:userId                → adminService.deleteUser(userId, currentUser)
   */
  @Get('users')
  getUsers(dto: AdminQueryDto) {
    return this.adminServices.listUsers(dto);
  }
  @Get('users/:userId')
  getUser(userId: string) {
    return this.adminServices.getUser(userId);
  }
  @Patch('users/:userId/make-admin')
  makeAdmin(userId: string) {
    return this.adminServices.setPlatformAdmin(userId, true);
  }
  @Patch('users/:userId/revoke-admin')
  revokeAdmin(userId: string) {
    return this.adminServices.setPlatformAdmin(userId, false);
  }
  @Delete('users/:userId')
  delete(userId: string, @CurrentUser() user: User) {
    return this.adminServices.deleteUser(userId, user);
  }
}
