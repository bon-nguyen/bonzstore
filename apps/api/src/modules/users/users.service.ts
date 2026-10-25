import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [total, active, locked, adminUsers] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.client.user.count({ where: { status: 'LOCKED' } }),
      this.prisma.client.user.count({
        where: { role: { isAdminPanel: true } },
      }),
    ]);

    return { total, active, locked, adminUsers };
  }

  async findAll(query: UserQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = query.skip;
    const take = query.take;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.roleCode) {
      where.role = { code: query.roleCode };
    }
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      }),
      this.prisma.client.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((u) => this.transformEntity(u)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.client.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email này đã tồn tại trong hệ thống');
    }

    const role = await this.prisma.client.role.findFirst({
      where: {
        OR: [{ id: dto.roleIdOrCode }, { code: dto.roleIdOrCode }],
      },
    });
    if (!role) {
      throw new BadRequestException('Vai trò không tồn tại');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.client.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        roleId: role.id,
        status: dto.status || 'ACTIVE',
      },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    return this.transformEntity(created);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updateData: any = {
      fullName: dto.fullName,
      phone: dto.phone,
      status: dto.status,
    };

    if (dto.roleIdOrCode) {
      const role = await this.prisma.client.role.findFirst({
        where: {
          OR: [{ id: dto.roleIdOrCode }, { code: dto.roleIdOrCode }],
        },
      });
      if (!role) {
        throw new BadRequestException('Vai trò không hợp lệ');
      }
      updateData.roleId = role.id;
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.client.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    return this.transformEntity(updated);
  }

  private transformEntity(entity: any) {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      phone: entity.phone,
      avatarUrl: entity.avatarUrl,
      status: entity.status,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      role: entity.role
        ? {
            id: entity.role.id,
            code: entity.role.code,
            name: entity.role.name,
            isAdminPanel: entity.role.isAdminPanel,
          }
        : null,
      permissions:
        entity.role?.permissions?.map((rp: any) => rp.permission.code) || [],
    };
  }
}

