import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let findUnique: jest.Mock;
  let passwordHash: string;

  const admin = () => ({
    id: 'admin-1',
    email: 'admin@amtarc.test',
    name: 'Admin',
    passwordHash,
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('correct-password', 4);
  });

  beforeEach(async () => {
    findUnique = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: { admin: { findUnique } } },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('signed-jwt') } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('should return a token and admin info for valid credentials', async () => {
    findUnique.mockResolvedValue(admin());

    const result = await service.login({
      email: 'admin@amtarc.test',
      password: 'correct-password',
    });

    expect(result).toEqual({
      accessToken: 'signed-jwt',
      admin: { id: 'admin-1', email: 'admin@amtarc.test', name: 'Admin' },
    });
  });

  it('should reject an unknown email', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@amtarc.test', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should reject a wrong password', async () => {
    findUnique.mockResolvedValue(admin());

    await expect(
      service.login({ email: 'admin@amtarc.test', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
