import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../../common/guards/platform-admin.guard';

@Controller('admin')
@UseGuards(PlatformAdminGuard, JwtAuthGuard)
export class AdminController {
  constructor() {}
  /**
   * GET    /admin/users                    list all users (paginated, offset)
GET    /admin/users/:userId            get single user
PATCH  /admin/users/:userId/make-admin promote to platform admin
DELETE /admin/users/:userId            soft delete a user
   */
}
