import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.client.category.count();
    if (count === 0) {
      await this.syncTikTokCategoryAssets();
    }
  }

  async findAll() {
    const list = await this.prisma.client.category.findMany({
      orderBy: [{ level: 'asc' }, { localName: 'asc' }],
      include: {
        parent: true,
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    return list.map((c) => ({
      id: c.id,
      externalCategoryId: c.externalCategoryId,
      parentId: c.parentId,
      parentName: c.parent?.localName || null,
      externalParentId: c.externalParentId,
      localName: c.localName,
      slug: c.slug,
      level: c.level,
      isLeaf: c.isLeaf,
      categoryVersion: c.categoryVersion,
      permissionStatuses: c.permissionStatuses,
      status: c.status,
      productCount: c._count.products,
      childrenCount: c._count.children,
    }));
  }

  /**
   * Trả về cấu trúc chuẩn TikTok Shop Partner API (get-authorized-category-assets-202405)
   * Ref: GET /authorization/202405/category_assets
   */
  async getAuthorizedCategoryAssets() {
    const categories = await this.prisma.client.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ level: 'asc' }, { localName: 'asc' }],
    });

    return {
      code: 0,
      message: 'Success',
      request_id: `${Date.now()}-${randomUUID().slice(0, 8)}`,
      data: {
        category_assets: categories.map((c) => {
          const extId = c.externalCategoryId || c.id;
          return {
            id: c.id,
            cipher: `TTP_VN_CAT_ASSET_${extId}_202405`,
            target_market: 'VN',
            category: {
              id: extId,
              parent_id: c.externalParentId || '0',
              local_name: c.localName,
              is_leaf: c.isLeaf,
            },
            version: c.categoryVersion || 'v2',
            permission_statuses: c.permissionStatuses,
          };
        }),
      },
    };
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.slugify(dto.localName);
    let level = 1;
    let externalParentId = '0';

    if (dto.parentId) {
      const parent = await this.prisma.client.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Danh mục cha không tồn tại');
      }
      level = parent.level + 1;
      externalParentId = parent.externalCategoryId || parent.id;
    }

    return this.prisma.client.category.create({
      data: {
        localName: dto.localName,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        externalCategoryId:
          dto.externalCategoryId ||
          `${Math.floor(600000 + Math.random() * 299999)}`,
        parentId: dto.parentId || null,
        externalParentId,
        level,
        isLeaf: dto.isLeaf ?? true,
        categoryVersion: dto.categoryVersion || 'v2',
        permissionStatuses: dto.permissionStatuses || ['AVAILABLE'],
      },
    });
  }

  /**
   * Đồng bộ mẫu cây danh mục Anime chuẩn TikTok Shop 202405 về PostgreSQL
   */
  async syncTikTokCategoryAssets() {
    const tiktokAssets = [
      {
        extId: '605001',
        extParentId: '0',
        localName: 'Mô hình & Đồ chơi Anime (Figures & Collectibles)',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
      },
      {
        extId: '605012',
        extParentId: '605001',
        localName: 'Scale Figure & Statue Chính hãng',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
      },
      {
        extId: '605015',
        extParentId: '605001',
        localName: 'Nendoroid & Mô hình Chibi',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
      },
      {
        extId: '606001',
        extParentId: '0',
        localName: 'Thời trang & Phụ kiện Cosplay Anime',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
      },
      {
        extId: '606025',
        extParentId: '606001',
        localName: 'Trang phục Cosplay & Áo Haori Kimetsu',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
      },
      {
        extId: '607001',
        extParentId: '0',
        localName: 'Manga, Light Novel & Artbook',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE', 'INVITE_ONLY'],
      },
      {
        extId: '607019',
        extParentId: '607001',
        localName: 'Light Novel & Boxset Manga Đặc biệt',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
      },
    ];

    const extMap = new Map<string, string>();

    for (const item of tiktokAssets) {
      const parentId =
        item.extParentId !== '0' ? extMap.get(item.extParentId) || null : null;

      const record = await this.prisma.client.category.upsert({
        where: { externalCategoryId: item.extId },
        update: {
          localName: item.localName,
          parentId,
          externalParentId: item.extParentId,
          level: item.level,
          isLeaf: item.isLeaf,
          permissionStatuses: item.permissionStatuses,
          categoryVersion: 'v2',
        },
        create: {
          externalCategoryId: item.extId,
          parentId,
          externalParentId: item.extParentId,
          localName: item.localName,
          slug: `${this.slugify(item.localName)}-${item.extId}`,
          level: item.level,
          isLeaf: item.isLeaf,
          categoryVersion: 'v2',
          permissionStatuses: item.permissionStatuses,
        },
      });

      extMap.set(item.extId, record.id);
    }

    return {
      code: 0,
      message: 'Đồng bộ Category Assets (TikTok Shop 202405) thành công',
      syncedCount: tiktokAssets.length,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

