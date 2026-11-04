import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { trim } from 'lodash';
import { ADMIN_MANAGER_ROLES } from '../../common/constants/rbac.constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateLogisticsUnitDto,
  LogisticsQueryDto,
  UpdateLogisticsUnitDto,
} from './dto/logistics.dto';

export interface LogisticsUnitRecord {
  id: string;
  name: string;
  shortName: string;
  avatarUrl: string;
  address: string;
  phone: string;
  gmail: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

const KV_LOGISTICS_KEY = 'bonzstore_logistics_clean_v1';

@Injectable()
export class LogisticsService implements OnModuleInit {
  private units: LogisticsUnitRecord[] = [];
  private initializedFromDb = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureInitialized();
  }

  private assertCanOperateLogistics(currentUser?: AuthenticatedUser): void {
    if (!currentUser) return;
    const roleCode = currentUser.role?.code || '';
    if (!ADMIN_MANAGER_ROLES.includes(roleCode as any)) {
      throw new ForbiddenException(
        'Chỉ quyền SUPER_ADMIN và STORE_MANAGER mới được phép thao tác quản lý Đơn vị Logistics',
      );
    }
  }

  private async ensureInitialized(): Promise<void> {
    try {
      await this.prisma.client.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "app_kv_store" (
          "key" TEXT PRIMARY KEY,
          "value" JSONB NOT NULL,
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      if (!this.initializedFromDb) {
        const rows = await this.prisma.client.$queryRawUnsafe<
          Array<{ value: { units: LogisticsUnitRecord[] } }>
        >(
          `SELECT "value" FROM "app_kv_store" WHERE "key" = $1 LIMIT 1`,
          KV_LOGISTICS_KEY,
        );
        if (rows && rows.length > 0 && Array.isArray(rows[0].value?.units)) {
          this.units = rows[0].value.units;
        }
        this.initializedFromDb = true;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  private async persistToDb(): Promise<void> {
    try {
      const payload = {
        units: this.units,
        updatedAt: new Date().toISOString(),
      };
      await this.prisma.client.$executeRawUnsafe(
        `
        INSERT INTO "app_kv_store" ("key", "value", "updated_at")
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT ("key")
        DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = NOW();
      `,
        KV_LOGISTICS_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // Non-blocking fallback
    }
  }

  async findAll(query: LogisticsQueryDto, currentUser?: AuthenticatedUser) {
    this.assertCanOperateLogistics(currentUser);
    await this.ensureInitialized();

    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.max(Number(query.limit || 20), 1);
    const q = trim(query.search || '').toLowerCase();

    const sorted = [...this.units].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const filtered = q
      ? sorted.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            (u.shortName || '').toLowerCase().includes(q) ||
            (u.address || '').toLowerCase().includes(q) ||
            (u.phone || '').toLowerCase().includes(q) ||
            (u.gmail || '').toLowerCase().includes(q),
        )
      : sorted;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      totalCount: this.units.length,
      filteredCount: total,
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async create(
    dto: CreateLogisticsUnitDto,
    currentUser?: AuthenticatedUser,
  ): Promise<LogisticsUnitRecord> {
    this.assertCanOperateLogistics(currentUser);
    await this.ensureInitialized();

    const name = trim(dto.name || '');
    if (!name) {
      throw new BadRequestException('Tên đơn vị là bắt buộc');
    }

    const now = new Date().toISOString();
    const record: LogisticsUnitRecord = {
      id: randomUUID(),
      name,
      shortName: trim(dto.shortName || ''),
      avatarUrl: trim(dto.avatarUrl || ''),
      address: trim(dto.address || ''),
      phone: trim(dto.phone || ''),
      gmail: trim(dto.gmail || ''),
      isHidden: Boolean(dto.isHidden),
      createdAt: now,
      updatedAt: now,
    };

    this.units.unshift(record);
    await this.persistToDb();
    return record;
  }

  async update(
    id: string,
    dto: UpdateLogisticsUnitDto,
    currentUser?: AuthenticatedUser,
  ): Promise<LogisticsUnitRecord> {
    this.assertCanOperateLogistics(currentUser);
    await this.ensureInitialized();

    const record = this.units.find((u) => u.id === id);
    if (!record) {
      throw new NotFoundException(`Không tìm thấy đơn vị Logistics #${id}`);
    }

    if (dto.name !== undefined) {
      const cleanedName = trim(dto.name);
      if (!cleanedName) {
        throw new BadRequestException('Tên đơn vị không được để trống');
      }
      record.name = cleanedName;
    }
    if (dto.shortName !== undefined) record.shortName = trim(dto.shortName);
    if (dto.avatarUrl !== undefined) record.avatarUrl = trim(dto.avatarUrl);
    if (dto.address !== undefined) record.address = trim(dto.address);
    if (dto.phone !== undefined) record.phone = trim(dto.phone);
    if (dto.gmail !== undefined) record.gmail = trim(dto.gmail);
    if (dto.isHidden !== undefined) record.isHidden = Boolean(dto.isHidden);
    record.updatedAt = new Date().toISOString();

    await this.persistToDb();
    return record;
  }

  async remove(id: string, currentUser?: AuthenticatedUser) {
    this.assertCanOperateLogistics(currentUser);
    await this.ensureInitialized();

    const idx = this.units.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Không tìm thấy đơn vị Logistics #${id}`);
    }
    this.units.splice(idx, 1);
    await this.persistToDb();
    return { deleted: true, id };
  }
}
