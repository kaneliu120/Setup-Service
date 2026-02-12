import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashed });
    await this.userRepository.save(user);
    return { message: 'Registered successfully' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }

  async seedAdmin() {
    let admin = await this.userRepository.findOne({ where: { email: 'admin@myskillstore.com' } });
    const hashed = await bcrypt.hash('admin123', 10);
    if (!admin) {
      await this.userRepository.save(
        this.userRepository.create({ email: 'admin@myskillstore.com', password: hashed, role: 'admin' }),
      );
      console.log('Admin user created: admin@myskillstore.com / admin123');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      admin.password = hashed;
      await this.userRepository.save(admin);
      console.log('Admin user role/password reset: admin@myskillstore.com / admin123');
    } else {
      console.log('Admin user already exists');
    }
  }
}
