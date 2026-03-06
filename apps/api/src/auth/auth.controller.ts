import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    // Disable public registration in production — admin users are seeded via ADMIN_PASSWORD env var
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Registration is disabled' };
    }
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('seed-admin')
  async seedAdmin(@Body() body: { secret: string }) {
    const seedSecret = process.env.SEED_SECRET || 'setup-service-2026';
    if (body.secret !== seedSecret) {
      return { message: 'Invalid secret' };
    }
    return this.authService.seedAdmin();
  }
}
