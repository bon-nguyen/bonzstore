import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../database/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roleCode: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'bonzstore-super-secret-jwt-access-key-2026'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
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
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Tài khoản đang ở trạng thái ${user.status}`);
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
        isAdminPanel: user.role.isAdminPanel,
      },
      permissions,
    };
  }
}

