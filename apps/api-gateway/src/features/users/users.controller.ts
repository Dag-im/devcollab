import { User } from '@devcollab/common/interfaces/user.interface';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**
   * GET    /users/me           → usersService.getProfile(user.id)
    PATCH  /users/me           → usersService.updateProfile(user.id, dto)
    PATCH  /users/me/password  → usersService.changePassword(user.id, dto)
    DELETE /users/me           → usersService.deleteAccount(user.id) + clear cookie + 204
   */
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }
  @Patch('me')
  updateProfile(@CurrentUser() user: User, dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }
  @Patch('me/password')
  updatePassword(@CurrentUser() user: User, dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }
  @Delete('me')
  @HttpCode(204)
  deleteProfile(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token');
    return this.usersService.deleteAccount(user.id);
  }
}
