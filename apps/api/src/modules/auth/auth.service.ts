import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PERMISSIONS, ROLES } from '../../common/constants/rbac.constants';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, requireAdminAccess = false) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động (${user.status})`,
      );
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    if (requireAdminAccess) {
      const canAccessAdmin =
        user.role.isAdminPanel ||
        user.role.code === ROLES.SUPER_ADMIN ||
        permissions.includes(PERMISSIONS.DASHBOARD_VIEW);

      if (!canAccessAdmin) {
        throw new ForbiddenException(
          'Tài khoản này không có quyền truy cập vào trang Quản trị (Admin Dashboard)',
        );
      }
    }

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role.code);

    this.logger.log(`User logged in: ${user.email} (${user.role.code})`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        status: user.status,
        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
          isAdminPanel: user.role.isAdminPanel,
        },
        permissions,
      },
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.client.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException('Email này đã được đăng ký');
    }

    const customerRole = await this.prisma.client.role.findUnique({
      where: { code: ROLES.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException('Chưa khởi tạo vai trò CUSTOMER (hãy chạy seed)');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.client.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        roleId: customerRole.id,
        status: 'ACTIVE',
      },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    const tokens = await this.issueTokens(created.id, created.email, created.role.code);
    return {
      ...tokens,
      user: {
        id: created.id,
        email: created.email,
        fullName: created.fullName,
        phone: created.phone,
        status: created.status,
        role: {
          id: created.role.id,
          code: created.role.code,
          name: created.role.name,
          isAdminPanel: created.role.isAdminPanel,
        },
        permissions: created.role.permissions.map((rp) => rp.permission.code),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.client.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    await this.prisma.client.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    return this.issueTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role.code,
    );
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.client.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
    return { message: 'Đăng xuất thành công' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
        isAdminPanel: user.role.isAdminPanel,
      },
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    };
  }

  private async issueTokens(userId: string, email: string, roleCode: string) {
    const payload = { sub: userId, email, roleCode };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = randomUUID() + '-' + randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.client.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
    };
  }
}

