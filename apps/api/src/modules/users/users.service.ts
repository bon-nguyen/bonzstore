import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { isEmpty, isNil, trim } from 'lodash';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
  ROLE_RANK,
  ROLES,
} from '../../common/constants/rbac.constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

const ALLOWED_VIEWER_ROLES: string[] = [...ADMIN_MANAGER_ROLES];
const MAX_PAGE_LIMIT = 20;

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureManagerPermissionsAndSampleUsers();
  }

  private getRoleRank(roleCode?: string | null): number {
    if (!roleCode) return 0;
    return ROLE_RANK[roleCode] ?? 30;
  }

  /**
   * Chặn cứng ở tầng Service: Chỉ SUPER_ADMIN và STORE_MANAGER mới có quyền xem / truy cập module Users
   */
  private assertCanViewUsers(currentUser?: AuthenticatedUser): void {
    const roleCode = currentUser?.role?.code || '';
    if (!ALLOWED_VIEWER_ROLES.includes(roleCode)) {
      throw new ForbiddenException(
        'Chỉ quyền SUPER_ADMIN và Quản lý cửa hàng (STORE_MANAGER) mới được phép xem và truy cập danh sách người dùng',
      );
    }
  }

  /**
   * Hash / Mask email đối với các tài khoản có quyền cao hơn người đang đăng nhập
   * Ví dụ: admin@bonzstore.com -> ad***#a1b2@bonzstore.com
   */
  private maskEmailForLowerRole(email: string): string {
    if (isEmpty(email) || !email.includes('@')) return '***';
    const [localPart, domain] = email.split('@');
    const shortHash = crypto
      .createHash('sha256')
      .update(email)
      .digest('hex')
      .slice(0, 4);
    const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
    return `${visiblePrefix}***#${shortHash}@${domain}`;
  }

  private maskPhoneForLowerRole(phone?: string | null): string | null {
    if (isNil(phone) || isEmpty(phone)) return null;
    if (phone.length <= 4) return '****';
    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  }

  async getStats(currentUser?: AuthenticatedUser) {
    this.assertCanViewUsers(currentUser);

    const [
      total,
      active,
      locked,
      inactive,
      adminUsers,
      rolesWithCounts,
    ] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.client.user.count({ where: { status: 'LOCKED' } }),
      this.prisma.client.user.count({ where: { status: 'INACTIVE' } }),
      this.prisma.client.user.count({
        where: { role: { isAdminPanel: true } },
      }),
      this.prisma.client.role.findMany({
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const byRole: Record<string, number> = {};
    for (const r of rolesWithCounts) {
      byRole[r.code] = r._count.users;
    }

    const byStatus: Record<string, number> = {
      ACTIVE: active,
      LOCKED: locked,
      INACTIVE: inactive,
    };

    return {
      total,
      active,
      locked,
      inactive,
      adminUsers,
      totalRoles: rolesWithCounts.length,
      byRole,
      byStatus,
    };
  }

  async findAll(query: UserQueryDto, currentUser?: AuthenticatedUser) {
    this.assertCanViewUsers(currentUser);

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(query.limit) || MAX_PAGE_LIMIT, 1),
      MAX_PAGE_LIMIT,
    );
    const skip = (page - 1) * limit;
    const take = limit;

    const sortBy = !isEmpty(query.sortBy) ? query.sortBy! : 'role';
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'desc' ? 'desc' : 'asc';

    const where: Record<string, unknown> = {};

    if (!isEmpty(query.status)) {
      where.status = query.status;
    }

    if (!isEmpty(query.roleCode) && query.roleCode !== 'ALL') {
      where.role = { code: trim(query.roleCode) };
    }

    const cleanedSearch = trim(query.search || '');
    if (!isEmpty(cleanedSearch)) {
      where.OR = [
        { email: { contains: cleanedSearch, mode: 'insensitive' } },
        { fullName: { contains: cleanedSearch, mode: 'insensitive' } },
        {
          role: {
            OR: [
              { code: { contains: cleanedSearch, mode: 'insensitive' } },
              { name: { contains: cleanedSearch, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const orderBy =
      sortBy === 'role'
        ? [{ role: { code: sortOrder } }, { createdAt: 'desc' as const }]
        : sortBy === 'status'
          ? [{ status: sortOrder }, { createdAt: 'desc' as const }]
          : [{ [sortBy]: sortOrder }];

    const [data, total, statusGroups] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
              _count: { select: { users: true } },
            },
          },
          _count: {
            select: { refreshTokens: true },
          },
        },
      }),
      this.prisma.client.user.count({ where }),
      this.prisma.client.user.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const statusCountMap: Record<string, number> = {};
    for (const grp of statusGroups) {
      statusCountMap[grp.status] = grp._count._all;
    }

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      data: data.map((u) =>
        this.transformEntity(u, currentUser, statusCountMap),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy,
        sortOrder,
      },
    };
  }

  async findOne(id: string, currentUser?: AuthenticatedUser) {
    this.assertCanViewUsers(currentUser);

    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
            _count: { select: { users: true } },
          },
        },
        _count: {
          select: { refreshTokens: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const statusCount = await this.prisma.client.user.count({
      where: { status: user.status },
    });

    return this.transformEntity(user, currentUser, {
      [user.status]: statusCount,
    });
  }

  async create(dto: CreateUserDto, currentUser?: AuthenticatedUser) {
    this.assertCanViewUsers(currentUser);

    const requesterRoleCode = currentUser?.role?.code || '';
    const requesterRank = this.getRoleRank(requesterRoleCode);

    const email = trim(dto.email).toLowerCase();
    if (isEmpty(email)) {
      throw new BadRequestException('Email không được để trống');
    }

    const existing = await this.prisma.client.user.findUnique({
      where: { email },
    });
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

    const targetRoleRank = this.getRoleRank(role.code);

    // Quy tắc bất biến: Vai trò SUPER_ADMIN là duy nhất trong hệ thống, không ai được phép tạo thêm
    if (role.code === 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Vai trò SUPER_ADMIN là duy nhất trong hệ thống, không được phép tạo thêm tài khoản SUPER_ADMIN',
      );
    }

    if (requesterRoleCode !== 'SUPER_ADMIN' && targetRoleRank > requesterRank) {
      throw new ForbiddenException(
        `Tài khoản ${requesterRoleCode} không có quyền tạo tài khoản với vai trò cấp cao hơn (${role.code})`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.client.user.create({
      data: {
        email,
        passwordHash,
        fullName: trim(dto.fullName),
        phone: dto.phone ? trim(dto.phone) : undefined,
        roleId: role.id,
        status: dto.status || 'ACTIVE',
      },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
            _count: { select: { users: true } },
          },
        },
        _count: {
          select: { refreshTokens: true },
        },
      },
    });

    return this.transformEntity(created, currentUser);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser?: AuthenticatedUser,
  ) {
    this.assertCanViewUsers(currentUser);

    const requesterRoleCode = currentUser?.role?.code || '';
    const requesterRank = this.getRoleRank(requesterRoleCode);

    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const targetCurrentRank = this.getRoleRank(user.role?.code);

    if (
      requesterRoleCode !== 'SUPER_ADMIN' &&
      (user.role?.code === 'SUPER_ADMIN' || targetCurrentRank > requesterRank)
    ) {
      throw new ForbiddenException(
        `Tài khoản ${requesterRoleCode} không đủ thẩm quyền thao tác trên tài khoản cấp cao hơn (${user.role?.code})`,
      );
    }

    const updateData: Record<string, unknown> = {};
    if (!isNil(dto.fullName)) updateData.fullName = trim(dto.fullName);
    if (!isNil(dto.phone)) updateData.phone = trim(dto.phone) || null;
    if (!isNil(dto.status)) updateData.status = dto.status;

    if (!isEmpty(dto.roleIdOrCode)) {
      const nextRole = await this.prisma.client.role.findFirst({
        where: {
          OR: [{ id: dto.roleIdOrCode }, { code: dto.roleIdOrCode }],
        },
      });
      if (!nextRole) {
        throw new BadRequestException('Vai trò không hợp lệ');
      }

      const nextRoleRank = this.getRoleRank(nextRole.code);

      // Quy tắc bất biến: SUPER_ADMIN là duy nhất, không thể nâng bất kỳ tài khoản nào khác lên SUPER_ADMIN
      if (
        nextRole.code === 'SUPER_ADMIN' &&
        user.role?.code !== 'SUPER_ADMIN'
      ) {
        throw new ForbiddenException(
          'Vai trò SUPER_ADMIN là duy nhất trong hệ thống, không thể gán thêm cho tài khoản khác',
        );
      }

      // Không cho phép hạ quyền của tài khoản SUPER_ADMIN duy nhất
      if (
        user.role?.code === 'SUPER_ADMIN' &&
        nextRole.code !== 'SUPER_ADMIN'
      ) {
        throw new ForbiddenException(
          'Tài khoản SUPER_ADMIN là duy nhất trong hệ thống, không thể thay đổi vai trò của tài khoản này',
        );
      }

      if (
        requesterRoleCode !== 'SUPER_ADMIN' &&
        nextRoleRank > requesterRank
      ) {
        throw new ForbiddenException(
          `Không thể gán vai trò ${nextRole.code} cao hơn cấp bậc hiện tại của bạn.`,
        );
      }

      updateData.roleId = nextRole.id;
    }

    if (!isEmpty(dto.password)) {
      updateData.passwordHash = await bcrypt.hash(dto.password!, 10);
    }

    const updated = await this.prisma.client.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
            _count: { select: { users: true } },
          },
        },
        _count: {
          select: { refreshTokens: true },
        },
      },
    });

    return this.transformEntity(updated, currentUser);
  }

  async resetPassword(
    id: string,
    newPassword: string,
    currentUser?: AuthenticatedUser,
  ) {
    this.assertCanViewUsers(currentUser);

    const requesterRoleCode = currentUser?.role?.code || '';
    const requesterRank = this.getRoleRank(requesterRoleCode);

    const cleanedPassword = trim(newPassword);
    if (isEmpty(cleanedPassword) || cleanedPassword.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const targetCurrentRank = this.getRoleRank(user.role?.code);

    if (
      requesterRoleCode !== 'SUPER_ADMIN' &&
      (user.role?.code === 'SUPER_ADMIN' || targetCurrentRank > requesterRank)
    ) {
      throw new ForbiddenException(
        `Tài khoản ${requesterRoleCode} không đủ thẩm quyền đặt lại mật khẩu cho tài khoản cấp cao hơn (${user.role?.code})`,
      );
    }

    const passwordHash = await bcrypt.hash(cleanedPassword, 10);

    const [updated] = await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id },
        data: { passwordHash },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
              _count: { select: { users: true } },
            },
          },
          _count: {
            select: { refreshTokens: true },
          },
        },
      }),
      this.prisma.client.refreshToken.deleteMany({
        where: { userId: id },
      }),
    ]);

    return {
      user: this.transformEntity(updated, currentUser),
      message: `Đã đặt lại mật khẩu và đăng xuất các phiên cũ của ${user.fullName}`,
    };
  }

  private transformEntity(
    entity: any,
    currentUser?: AuthenticatedUser,
    statusCountMap?: Record<string, number>,
  ) {
    const requesterRoleCode = currentUser?.role?.code || 'SUPER_ADMIN';
    const requesterRank = this.getRoleRank(requesterRoleCode);
    const targetRoleCode = entity.role?.code || '';
    const targetRank = this.getRoleRank(targetRoleCode);

    const isProtectedHigherRole =
      requesterRoleCode !== 'SUPER_ADMIN' &&
      (targetRoleCode === 'SUPER_ADMIN' || targetRank > requesterRank);

    const canManage =
      requesterRoleCode === 'SUPER_ADMIN' || !isProtectedHigherRole;

    return {
      id: entity.id,
      email: isProtectedHigherRole
        ? this.maskEmailForLowerRole(entity.email)
        : entity.email,
      isEmailMasked: isProtectedHigherRole,
      canManage,
      fullName: entity.fullName,
      phone: isProtectedHigherRole
        ? this.maskPhoneForLowerRole(entity.phone)
        : entity.phone,
      avatarUrl: entity.avatarUrl,
      status: entity.status,
      statusUserCount: statusCountMap?.[entity.status] ?? 0,
      roleUserCount: entity.role?._count?.users ?? 0,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      activeSessions: entity._count?.refreshTokens ?? 0,
      role: entity.role
        ? {
            id: entity.role.id,
            code: entity.role.code,
            name: entity.role.name,
            description: entity.role.description,
            isAdminPanel: entity.role.isAdminPanel,
          }
        : null,
      permissions:
        entity.role?.permissions?.map((rp: any) => rp.permission.code) || [],
    };
  }

  private async ensureManagerPermissionsAndSampleUsers() {
    try {
      const [managerRole, staffRole, customerRole] = await Promise.all([
        this.prisma.client.role.findUnique({
          where: { code: ROLES.STORE_MANAGER },
        }),
        this.prisma.client.role.findUnique({ where: { code: ROLES.STAFF } }),
        this.prisma.client.role.findUnique({ where: { code: ROLES.CUSTOMER } }),
      ]);

      const userPerms = await this.prisma.client.permission.findMany({
        where: {
          code: {
            in: [
              PERMISSIONS.USERS_READ,
              PERMISSIONS.USERS_CREATE,
              PERMISSIONS.USERS_UPDATE,
              PERMISSIONS.USERS_DELETE,
            ],
          },
        },
      });

      if (managerRole) {
        for (const perm of userPerms) {
          if (perm.code !== PERMISSIONS.USERS_DELETE) {
            await this.prisma.client.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: managerRole.id,
                  permissionId: perm.id,
                },
              },
              update: {},
              create: { roleId: managerRole.id, permissionId: perm.id },
            });
          }
        }
      }

      // Đảm bảo các role ngoài SUPER_ADMIN và STORE_MANAGER không giữ quyền users.*
      if (userPerms.length > 0) {
        await this.prisma.client.rolePermission.deleteMany({
          where: {
            permissionId: { in: userPerms.map((p) => p.id) },
            role: {
              code: { notIn: ALLOWED_VIEWER_ROLES },
            },
          },
        });
      }

      const currentCount = await this.prisma.client.user.count();
      if (currentCount < 25 && staffRole && customerRole) {
        const defaultPass = await bcrypt.hash('Bonz@123', 10);
        const sampleUsers = Array.from({ length: 22 }, (_, idx) => {
          const num = idx + 1;
          const isStaff = num <= 8;
          return {
            email: isStaff
              ? `anime.staff${String(num).padStart(2, '0')}@bonzstore.com`
              : `otaku.customer${String(num - 8).padStart(2, '0')}@gmail.com`,
            passwordHash: defaultPass,
            fullName: isStaff
              ? `Nhân viên Anime #${String(num).padStart(2, '0')}`
              : `Khách hàng Otaku #${String(num - 8).padStart(2, '0')}`,
            phone: `0908100${String(num).padStart(3, '0')}`,
            status: (num % 7 === 0 ? 'LOCKED' : 'ACTIVE') as
              | 'ACTIVE'
              | 'LOCKED',
            roleId: isStaff ? staffRole.id : customerRole.id,
          };
        });

        for (const u of sampleUsers) {
          await this.prisma.client.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
          });
        }
      }
    } catch {
      // Ignore if schema is not pushed yet
    }
  }
}
