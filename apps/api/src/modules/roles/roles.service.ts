import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.client.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: { permission: true },
        },
      },
    });

    return roles.map((r) => this.transformRole(r));
  }

  async findAllPermissions() {
    return this.prisma.client.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  async create(dto: CreateRoleDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.client.role.findUnique({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Mã vai trò ${code} đã tồn tại`);
    }

    const permissions = dto.permissionCodes?.length
      ? await this.prisma.client.permission.findMany({
          where: { code: { in: dto.permissionCodes } },
        })
      : [];

    const created = await this.prisma.client.role.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
        isAdminPanel: dto.isAdminPanel ?? true,
        permissions: {
          create: permissions.map((p) => ({
            permissionId: p.id,
          })),
        },
      },
      include: {
        _count: { select: { users: true } },
        permissions: { include: { permission: true } },
      },
    });

    return this.transformRole(created);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.client.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }

    if (dto.permissionCodes) {
      const permissions = await this.prisma.client.permission.findMany({
        where: { code: { in: dto.permissionCodes } },
      });

      await this.prisma.client.$transaction([
        this.prisma.client.rolePermission.deleteMany({ where: { roleId: id } }),
        this.prisma.client.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: id,
            permissionId: p.id,
          })),
        }),
      ]);
    }

    const updated = await this.prisma.client.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isAdminPanel: dto.isAdminPanel,
        status: dto.status,
      },
      include: {
        _count: { select: { users: true } },
        permissions: { include: { permission: true } },
      },
    });

    return this.transformRole(updated);
  }

  private transformRole(role: any) {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isAdminPanel: role.isAdminPanel,
      status: role.status,
      userCount: role._count?.users || 0,
      permissions:
        role.permissions?.map((rp: any) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
          module: rp.permission.module,
        })) || [],
      permissionCodes:
        role.permissions?.map((rp: any) => rp.permission.code) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

