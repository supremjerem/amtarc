import { Body, Controller, Post } from '@nestjs/common';
import { seconds, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Tight limit: this is the only credential-guessing surface in the app.
  @Throttle({ default: { ttl: seconds(300), limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
