import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  BulkProductActionDto,
  CreateProductDto,
  ImportPlatformProductDto,
  ManageProductTagDto,
  UpdateProductDto,
  UpdateProductSkusDto,
} from './dto/create-product.dto';
import {
  ProductQueryDto,
  TikTokProductTabStatus,
} from './dto/product-query.dto';

export type ProductTabSubStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'FAILED'
  | 'INACTIVE'
  | 'DRAFT'
  | 'DELETED';

export interface ProductMetaJson {
  subStatus?: ProductTabSubStatus;
  tags?: string[];
  soldCount?: number;
  viewCount?: number;
  revenue?: number;
  attentionReason?: string;
}

export interface ParsedProductMeta {
  subStatus: ProductTabSubStatus;
  tags: string[];
  soldCount: number;
  viewCount: number;
  revenue: number;
  attentionReason: string;
}

@Injectable()
export class ProductsService implements OnModuleInit {
  private customTags = new Set<string>([
    'Hunter x Hunter',
    'Chibi Q-Ver',
    'Best Seller',
    'One Piece',
    'Jujutsu Kaisen',
    'Pre-order',
    'Limited Edition',
    'Flash Sale',
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureFlagshipTikTokProductsSeeded();
  }

  private parseMeta(raw: unknown, dbStatus: string): ParsedProductMeta {
    const obj =
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    let defaultSub: ProductTabSubStatus = 'ACTIVE';
    if (dbStatus === 'FREEZE') defaultSub = 'FAILED';
    else if (dbStatus === 'INACTIVE') defaultSub = 'INACTIVE';
    else if (dbStatus === 'DRAFT') defaultSub = 'DRAFT';

    const subStatus: ProductTabSubStatus =
      typeof obj.subStatus === 'string' && obj.subStatus.length > 0
        ? (obj.subStatus as ProductTabSubStatus)
        : defaultSub;

    const tags = Array.isArray(obj.tags)
      ? obj.tags.filter((t): t is string => typeof t === 'string')
      : [];
    const soldCount = typeof obj.soldCount === 'number' ? obj.soldCount : 0;
    const viewCount = typeof obj.viewCount === 'number' ? obj.viewCount : 0;
    const revenue = typeof obj.revenue === 'number' ? obj.revenue : 0;
    const attentionReason =
      typeof obj.attentionReason === 'string' ? obj.attentionReason : '';

    return {
      subStatus,
      tags,
      soldCount,
      viewCount,
      revenue,
      attentionReason,
    };
  }

  private mapTabStatusToDbStatus(tabStatus: TikTokProductTabStatus): {
    dbStatus: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FREEZE';
    subStatus: ProductTabSubStatus;
  } {
    switch (tabStatus) {
      case 'ACTIVE':
        return { dbStatus: 'ACTIVE', subStatus: 'ACTIVE' };
      case 'PENDING':
        return { dbStatus: 'DRAFT', subStatus: 'PENDING' };
      case 'FAILED':
      case 'FREEZE':
        return { dbStatus: 'FREEZE', subStatus: 'FAILED' };
      case 'INACTIVE':
        return { dbStatus: 'INACTIVE', subStatus: 'INACTIVE' };
      case 'DRAFT':
        return { dbStatus: 'DRAFT', subStatus: 'DRAFT' };
      case 'DELETED':
        return { dbStatus: 'INACTIVE', subStatus: 'DELETED' };
      default:
        return { dbStatus: 'ACTIVE', subStatus: 'ACTIVE' };
    }
  }

  /**
   * Tự động khởi tạo sản phẩm chuẩn theo `.feature/test.md` (TikTok Shop Seller Center)
   */
  private async ensureFlagshipTikTokProductsSeeded() {
    try {
      let chibiCat = await this.prisma.client.category.findFirst({
        where: { isLeaf: true, localName: { contains: 'Chibi' } },
      });

      if (!chibiCat) {
        chibiCat = await this.prisma.client.category.findFirst({
          where: { isLeaf: true },
        });
      }

      if (!chibiCat) {
        chibiCat = await this.prisma.client.category.create({
          data: {
            externalCategoryId: '605015',
            externalParentId: '605001',
            localName: 'Nendoroid & Mô hình Chibi',
            slug: 'nendoroid-mo-hinh-chibi-605015',
            level: 2,
            isLeaf: true,
            categoryVersion: 'v2',
            permissionStatuses: ['AVAILABLE'],
          },
        });
      }

      const existingHxh = await this.prisma.client.product.findFirst({
        where: { externalProductId: '1734097731620276111' },
      });

      if (!existingHxh) {
        const hxhSkus = [
          {
            externalSkuId: '1734097731620276101',
            sellerSku: 'HXH002-FULL-SET-8',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Full Bộ 8 Nhân Vật (Box Lớn)' },
            ],
            originalPrice: 299000,
            salePrice: 224250,
            stockQuantity: 5,
          },
          {
            externalSkuId: '1734097731620276102',
            sellerSku: 'HXH002-COMBO-4-MAIN',
            salesAttributes: [
              {
                name: 'Phân loại',
                value_name:
                  'Combo 4 Nhân Vật Chính (Gon/Killua/Kurapika/Leorio)',
              },
            ],
            originalPrice: 189000,
            salePrice: 141750,
            stockQuantity: 4,
          },
          {
            externalSkuId: '1734097731620276103',
            sellerSku: 'HXH002-COMBO-RYODAN',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Combo 4 Nhện Phantom Troupe' },
            ],
            originalPrice: 189000,
            salePrice: 141750,
            stockQuantity: 3,
          },
          {
            externalSkuId: '1734097731620276104',
            sellerSku: 'HXH002-GON',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Gon Freecss (9.5cm)' },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 4,
          },
          {
            externalSkuId: '1734097731620276105',
            sellerSku: 'HXH002-KILLUA',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Killua Zoldyck (9.5cm)' },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 3,
          },
          {
            externalSkuId: '1734097731620276106',
            sellerSku: 'HXH002-KURAPIKA',
            salesAttributes: [
              {
                name: 'Phân loại',
                value_name: 'Lẻ - Kurapika Dây Xích (9.5cm)',
              },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 2,
          },
          {
            externalSkuId: '1734097731620276107',
            sellerSku: 'HXH002-LEORIO',
            salesAttributes: [
              {
                name: 'Phân loại',
                value_name: 'Lẻ - Leorio Paradinight (10cm)',
              },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 2,
          },
          {
            externalSkuId: '1734097731620276108',
            sellerSku: 'HXH002-HISOKA',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Hisoka Morow (10cm)' },
            ],
            originalPrice: 79000,
            salePrice: 59250,
            stockQuantity: 2,
          },
          {
            externalSkuId: '1734097731620276109',
            sellerSku: 'HXH002-CHROLLO',
            salesAttributes: [
              {
                name: 'Phân loại',
                value_name: 'Lẻ - Chrollo Lucilfer (9.5cm)',
              },
            ],
            originalPrice: 79000,
            salePrice: 59250,
            stockQuantity: 2,
          },
          {
            externalSkuId: '1734097731620276110',
            sellerSku: 'HXH002-ILLUMI',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Illumi Zoldyck (9.5cm)' },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 2,
          },
          {
            externalSkuId: '1734097731620276111',
            sellerSku: 'HXH002-FEITAN',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Feitan Portor (9cm)' },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 1,
          },
          {
            externalSkuId: '1734097731620276112',
            sellerSku: 'HXH002-SHALNARK',
            salesAttributes: [
              { name: 'Phân loại', value_name: 'Lẻ - Shalnark Ryodan (9cm)' },
            ],
            originalPrice: 69000,
            salePrice: 51750,
            stockQuantity: 1,
          },
        ];

        await this.prisma.client.product.create({
          data: {
            title:
              '[Bonzstore] Mô Hình Hunter x Hunter Bộ 8 Nhân Vật Thợ Săn Chibi Q Version Dáng Ngồi 9-10cm - Figure PVC HXH002',
            slug: 'bonzstore-mo-hinh-hunter-x-hunter-bo-8-nhan-vat-chibi-hxh002',
            descriptionHtml:
              '<p>Bộ 8 Mô hình nhân vật Hunter x Hunter Chibi Q Version dáng ngồi cao 9-10cm chất liệu nhựa PVC cao cấp. Hàng chuẩn đồng bộ TikTok Shop Seller Center.</p>',
            categoryId: chibiCat.id,
            brandName: 'BonzStore Anime',
            mainImages: [
              {
                url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
                width: 800,
                height: 800,
              },
            ],
            packageDimensions: {
              subStatus: 'ACTIVE',
              tags: ['Hunter x Hunter', 'Chibi Q-Ver', 'Best Seller'],
              soldCount: 3,
              viewCount: 4852,
              revenue: 115650,
            },
            status: 'ACTIVE',
            sourcePlatform: 'TIKTOK_SHOP',
            externalProductId: '1734097731620276111',
            externalShopId: 'VN-BONZSTORE-TTS',
            lastSyncedAt: new Date(),
            skus: {
              create: hxhSkus,
            },
          },
        });
      }

      const totalCount = await this.prisma.client.product.count();
      if (totalCount <= 4) {
        await this.prisma.client.product.create({
          data: {
            title:
              '[Bonzstore] Mô Hình One Piece Luffy Gear 5 Nika Đế Mây Sấm Sét LED 28cm - Figure PVC OP-G5',
            slug: `bonzstore-luffy-gear-5-nika-led-${Date.now().toString().slice(-4)}`,
            categoryId: chibiCat.id,
            brandName: 'Banpresto',
            mainImages: [
              {
                url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
                width: 800,
                height: 800,
              },
            ],
            packageDimensions: {
              subStatus: 'PENDING',
              tags: ['One Piece', 'Pre-order'],
              soldCount: 0,
              viewCount: 320,
              revenue: 0,
            },
            status: 'DRAFT',
            sourcePlatform: 'TIKTOK_SHOP',
            externalProductId: '1734098819201145002',
            externalShopId: 'VN-BONZSTORE-TTS',
            lastSyncedAt: new Date(),
            skus: {
              create: [
                {
                  externalSkuId: '1734098819201145101',
                  sellerSku: 'OP-G5-PURPLE-BOX',
                  salesAttributes: [
                    { name: 'Phiên bản', value_name: 'Tím Ánh Kim + Đế LED' },
                  ],
                  originalPrice: 650000,
                  salePrice: 489000,
                  stockQuantity: 15,
                },
                {
                  externalSkuId: '1734098819201145102',
                  sellerSku: 'OP-G5-WHITE-STD',
                  salesAttributes: [
                    {
                      name: 'Phiên bản',
                      value_name: 'Trắng Tiêu Chuẩn (Full Box)',
                    },
                  ],
                  originalPrice: 520000,
                  salePrice: 399000,
                  stockQuantity: 20,
                },
              ],
            },
          },
        });

        await this.prisma.client.product.create({
          data: {
            title:
              '[Bonzstore] Mô Hình Jujutsu Kaisen Gojo Satoru Lãnh Địa Vô Lượng Không Xứ 26cm - JJK-GOJO-09',
            slug: `bonzstore-jjk-gojo-satoru-vo-luong-${Date.now().toString().slice(-4)}`,
            categoryId: chibiCat.id,
            brandName: 'Good Smile Company',
            mainImages: [
              {
                url: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&q=80',
                width: 800,
                height: 800,
              },
            ],
            packageDimensions: {
              subStatus: 'FAILED',
              tags: ['Jujutsu Kaisen', 'Flash Sale'],
              soldCount: 19,
              viewCount: 9410,
              revenue: 8550000,
              attentionReason:
                'Cần bổ sung ảnh chụp thật bao bì hộp sản phẩm theo chính sách TikTok Shop 202405',
            },
            status: 'FREEZE',
            sourcePlatform: 'TIKTOK_SHOP',
            externalProductId: '1734099920118834009',
            externalShopId: 'VN-BONZSTORE-TTS',
            lastSyncedAt: new Date(),
            skus: {
              create: [
                {
                  externalSkuId: '1734099920118834101',
                  sellerSku: 'JJK-GOJO-DX',
                  salesAttributes: [
                    {
                      name: 'Phân loại',
                      value_name: 'Bản Deluxe 2 Đầu Thay Thế (Hết hàng)',
                    },
                  ],
                  originalPrice: 590000,
                  salePrice: 450000,
                  stockQuantity: 0,
                },
              ],
            },
          },
        });
      }

      const existingProducts = await this.prisma.client.product.findMany({
        include: { skus: true },
      });
      for (const prod of existingProducts) {
        if (!prod.packageDimensions) {
          const meta: ProductMetaJson = {
            subStatus:
              prod.status === 'ACTIVE'
                ? 'ACTIVE'
                : prod.status === 'FREEZE'
                  ? 'FAILED'
                  : prod.status === 'INACTIVE'
                    ? 'INACTIVE'
                    : 'DRAFT',
            tags: ['Best Seller', 'Limited Edition'],
            soldCount: prod.status === 'ACTIVE' ? 14 : 2,
            viewCount: prod.status === 'ACTIVE' ? 6240 : 890,
            revenue: prod.status === 'ACTIVE' ? 12850000 : 1780000,
          };
          await this.prisma.client.product.update({
            where: { id: prod.id },
            data: { packageDimensions: meta as any },
          });
        }
      }
    } catch {
      // Non-blocking seed
    }
  }

  async getStats() {
    const allProducts = await this.prisma.client.product.findMany({
      include: { skus: true },
    });

    let total = 0;
    let active = 0;
    let pending = 0;
    let failed = 0;
    let inactive = 0;
    let draft = 0;
    let deleted = 0;
    let outOfStock = 0;
    let syncedFromPlatform = 0;
    let totalStock = 0;

    const tagCounts = new Map<string, number>();
    for (const tag of this.customTags) {
      tagCounts.set(tag, 0);
    }

    for (const p of allProducts) {
      const transformed = this.transformProduct(p);

      for (const t of transformed.tags) {
        this.customTags.add(t);
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }

      if (transformed.status === 'DELETED') {
        deleted += 1;
        continue;
      }

      total += 1;
      totalStock += transformed.totalStock;

      if (
        p.sourcePlatform === 'TIKTOK_SHOP' ||
        p.sourcePlatform === 'SHOPEE'
      ) {
        syncedFromPlatform += 1;
      }

      if (
        transformed.totalStock === 0 ||
        transformed.outOfStockSkuCount > 0
      ) {
        outOfStock += 1;
      }

      switch (transformed.status) {
        case 'ACTIVE':
          active += 1;
          break;
        case 'PENDING':
          pending += 1;
          break;
        case 'FAILED':
          failed += 1;
          break;
        case 'INACTIVE':
          inactive += 1;
          break;
        case 'DRAFT':
          draft += 1;
          break;
      }
    }

    const tags = Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      total,
      active,
      pending,
      failed,
      inactive,
      draft,
      deleted,
      outOfStock,
      syncedFromPlatform,
      totalStock,
      tags,
    };
  }

  async getTags() {
    const stats = await this.getStats();
    return stats.tags;
  }

  async createOrAttachTag(dto: ManageProductTagDto) {
    const tagName = dto.name.trim();
    if (!tagName) {
      throw new BadRequestException('Tên thẻ không được để trống');
    }

    this.customTags.add(tagName);

    if (dto.productIds && dto.productIds.length > 0) {
      const products = await this.prisma.client.product.findMany({
        where: { id: { in: dto.productIds } },
      });

      for (const prod of products) {
        const meta = this.parseMeta(prod.packageDimensions, prod.status);
        if (!meta.tags.includes(tagName)) {
          meta.tags.push(tagName);
          await this.prisma.client.product.update({
            where: { id: prod.id },
            data: { packageDimensions: meta as any },
          });
        }
      }
    }

    return this.getTags();
  }

  async renameTag(oldName: string, newName: string) {
    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();
    if (!trimmedOld || !trimmedNew) {
      throw new BadRequestException('Tên thẻ không hợp lệ');
    }

    this.customTags.delete(trimmedOld);
    this.customTags.add(trimmedNew);

    const allProducts = await this.prisma.client.product.findMany();
    for (const prod of allProducts) {
      const meta = this.parseMeta(prod.packageDimensions, prod.status);
      if (meta.tags.includes(trimmedOld)) {
        meta.tags = Array.from(
          new Set(meta.tags.map((t) => (t === trimmedOld ? trimmedNew : t))),
        );
        await this.prisma.client.product.update({
          where: { id: prod.id },
          data: { packageDimensions: meta as any },
        });
      }
    }

    return this.getTags();
  }

  async deleteTag(name: string) {
    const trimmed = name.trim();
    this.customTags.delete(trimmed);

    const allProducts = await this.prisma.client.product.findMany();
    for (const prod of allProducts) {
      const meta = this.parseMeta(prod.packageDimensions, prod.status);
      if (meta.tags.includes(trimmed)) {
        meta.tags = meta.tags.filter((t) => t !== trimmed);
        await this.prisma.client.product.update({
          where: { id: prod.id },
          data: { packageDimensions: meta as any },
        });
      }
    }

    return this.getTags();
  }

  async findAll(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    // IMPORTANT: Never pass status="ALL" | "PENDING" | "FAILED" | "DELETED" into Prisma where.status
    const where: Record<string, any> = {};
    if (query.sourcePlatform) {
      where.sourcePlatform = query.sourcePlatform;
    }

    if (query.categoryId) {
      const childCats = await this.prisma.client.category.findMany({
        where: {
          OR: [{ id: query.categoryId }, { parentId: query.categoryId }],
        },
        select: { id: true },
      });
      const catIds = childCats.map((c) => c.id);
      where.categoryId = { in: catIds.length ? catIds : [query.categoryId] };
    }

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { externalProductId: { contains: q, mode: 'insensitive' } },
        { brandName: { contains: q, mode: 'insensitive' } },
        {
          skus: {
            some: {
              OR: [
                { sellerSku: { contains: q, mode: 'insensitive' } },
                { externalSkuId: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const rawProducts = await this.prisma.client.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        skus: {
          orderBy: { salePrice: 'asc' },
        },
      },
    });

    let items = rawProducts.map((p) => this.transformProduct(p));

    // Filter by 7 TikTok Shop Seller Center Tabs
    const tab = query.status || 'ALL';
    if (tab === 'ALL') {
      items = items.filter((item) => item.status !== 'DELETED');
    } else if (tab === 'FAILED' || tab === 'FREEZE') {
      items = items.filter((item) => item.status === 'FAILED');
    } else {
      items = items.filter((item) => item.status === tab);
    }

    // Filter by Out of Stock quick toggle ("Hết hàng") or Drawer stockState
    if (query.outOfStock === 'true' || query.stockState === 'out_of_stock') {
      items = items.filter(
        (item) => item.totalStock === 0 || item.outOfStockSkuCount > 0,
      );
    } else if (query.stockState === 'in_stock') {
      items = items.filter((item) => item.totalStock > 0);
    } else if (query.stockState === 'low_stock') {
      items = items.filter(
        (item) => item.totalStock > 0 && item.totalStock <= 10,
      );
    }

    // Filter by Tag ("Thẻ")
    if (query.tag) {
      items = items.filter((item) => item.tags.includes(query.tag!));
    }

    // Filter by Retail / Sale Price Range (from Filter Drawer)
    if (query.minPrice) {
      const minVal = Number(query.minPrice);
      if (!Number.isNaN(minVal) && minVal > 0) {
        items = items.filter((item) => item.maxOriginalPrice >= minVal);
      }
    }
    if (query.maxPrice) {
      const maxVal = Number(query.maxPrice);
      if (!Number.isNaN(maxVal) && maxVal > 0) {
        items = items.filter((item) => item.minOriginalPrice <= maxVal);
      }
    }

    // Filter by Promotional Discount state (from Filter Drawer)
    if (query.hasDiscount === 'true') {
      items = items.filter(
        (item) =>
          item.minPrice < item.minOriginalPrice ||
          item.maxPrice < item.maxOriginalPrice,
      );
    }

    // Sort items
    const sortBy = query.sortBy || 'updatedAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (sortBy === 'price') {
        return (a.minPrice - b.minPrice) * sortOrder;
      }
      if (sortBy === 'stock') {
        return (a.totalStock - b.totalStock) * sortOrder;
      }
      if (sortBy === 'soldCount') {
        return (
          (a.performance.soldCount - b.performance.soldCount) * sortOrder
        );
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status) * sortOrder;
      }
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return (timeA - timeB) * sortOrder;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedData = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
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

  async create(dto: CreateProductDto) {
    const category = await this.prisma.client.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Danh mục ngành hàng không tồn tại');
    }
    if (!category.isLeaf) {
      throw new BadRequestException(
        'Theo chuẩn TikTok Shop 202405, sản phẩm chỉ được gắn vào Danh mục lá (isLeaf = true)',
      );
    }

    const slug = `${this.slugify(dto.title)}-${Date.now().toString().slice(-4)}`;
    const imageList =
      dto.images && dto.images.length > 0
        ? dto.images.filter((u) => typeof u === 'string' && u.trim().length > 0)
        : dto.imageUrl
          ? [dto.imageUrl]
          : [
              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
            ];

    const mainImages = imageList.map((url) => ({
      url,
      width: 800,
      height: 800,
    }));

    const { dbStatus, subStatus } = this.mapTabStatusToDbStatus(
      dto.status || 'ACTIVE',
    );

    const tags = dto.tags && dto.tags.length ? dto.tags : ['New Arrival'];
    for (const t of tags) this.customTags.add(t);

    const packageDimensions: Record<string, unknown> = {
      subStatus,
      tags,
      soldCount: 0,
      viewCount: 1,
      revenue: 0,
      ...(dto.videoUrl ? { videoUrl: dto.videoUrl } : {}),
      ...(dto.attributes ? { attributes: dto.attributes } : {}),
    };

    const timestamp = Date.now().toString().slice(-8);

    const skusToCreate =
      dto.skus && dto.skus.length > 0
        ? dto.skus.map((sku, idx) => ({
            externalSkuId: `17341${timestamp}${String(idx + 1).padStart(2, '0')}`,
            sellerSku:
              sku.sellerSku && sku.sellerSku.trim()
                ? sku.sellerSku.trim()
                : `SKU-${timestamp}-${idx + 1}`,
            originalPrice: Math.max(0, Number(sku.originalPrice) || 99000),
            salePrice: Math.max(
              0,
              Number(sku.salePrice ?? sku.originalPrice) || 99000,
            ),
            stockQuantity: Math.max(0, Number(sku.stockQuantity) || 0),
            salesAttributes:
              sku.salesAttributes && sku.salesAttributes.length > 0
                ? sku.salesAttributes.map((attr) => ({
                    name: attr.name,
                    value_name: attr.value_name,
                    ...(sku.imageUrl || attr.sku_img
                      ? { sku_img: sku.imageUrl || attr.sku_img }
                      : {}),
                  }))
                : [{ name: 'Nhân vật', value_name: `Lựa chọn #${idx + 1}` }],
          }))
        : [
            {
              externalSkuId: `17341${timestamp}01`,
              sellerSku: dto.sellerSku || `SKU-${timestamp}-01`,
              originalPrice: Math.max(0, Number(dto.originalPrice) || 99000),
              salePrice: Math.max(
                0,
                Number(dto.salePrice ?? dto.originalPrice) || 99000,
              ),
              stockQuantity: Math.max(0, Number(dto.stockQuantity) || 10),
              salesAttributes: dto.salesAttributes || [
                { name: 'Phân loại', value_name: 'Bản Tiêu Chuẩn (Full Box)' },
              ],
            },
          ];

    const created = await this.prisma.client.product.create({
      data: {
        title: dto.title,
        slug,
        categoryId: dto.categoryId,
        brandName: dto.brandName || 'BonzStore Anime',
        descriptionHtml: dto.descriptionHtml,
        mainImages,
        packageWeight: dto.packageWeight ? Number(dto.packageWeight) : 0.35,
        packageDimensions: packageDimensions as any,
        status: dbStatus,
        sourcePlatform: dto.sourcePlatform || 'TIKTOK_SHOP',
        externalProductId: `17341${timestamp}`,
        externalShopId: 'VN-BONZSTORE-TTS',
        lastSyncedAt: new Date(),
        skus: {
          create: skusToCreate,
        },
      },
      include: {
        category: true,
        skus: true,
      },
    });

    return this.transformProduct(created);
  }

  async update(id: string, dto: UpdateProductDto) {
    const prod = await this.prisma.client.product.findUnique({
      where: { id },
    });
    if (!prod) throw new NotFoundException('Không tìm thấy sản phẩm');

    if (dto.categoryId) {
      const cat = await this.prisma.client.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!cat || !cat.isLeaf) {
        throw new BadRequestException(
          'Sản phẩm phải gắn vào Danh mục lá (isLeaf = true)',
        );
      }
    }

    const meta = this.parseMeta(prod.packageDimensions, prod.status);
    let nextDbStatus = prod.status;

    if (dto.status) {
      const mapped = this.mapTabStatusToDbStatus(dto.status);
      nextDbStatus = mapped.dbStatus;
      meta.subStatus = mapped.subStatus;
    }

    if (dto.tags) {
      meta.tags = dto.tags;
      for (const t of dto.tags) this.customTags.add(t);
    }

    const mainImages = dto.imageUrl
      ? [{ url: dto.imageUrl, width: 800, height: 800 }]
      : undefined;

    const updated = await this.prisma.client.product.update({
      where: { id },
      data: {
        title: dto.title ?? prod.title,
        categoryId: dto.categoryId ?? prod.categoryId,
        brandName: dto.brandName ?? prod.brandName,
        ...(mainImages ? { mainImages } : {}),
        status: nextDbStatus,
        packageDimensions: meta as any,
      },
      include: { category: true, skus: true },
    });

    return this.transformProduct(updated);
  }

  async updateStatus(id: string, tabStatus: TikTokProductTabStatus) {
    const prod = await this.prisma.client.product.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Không tìm thấy sản phẩm');

    const meta = this.parseMeta(prod.packageDimensions, prod.status);
    const { dbStatus, subStatus } = this.mapTabStatusToDbStatus(tabStatus);
    meta.subStatus = subStatus;

    const updated = await this.prisma.client.product.update({
      where: { id },
      data: {
        status: dbStatus,
        packageDimensions: meta as any,
      },
      include: { category: true, skus: true },
    });

    return this.transformProduct(updated);
  }

  async updateSkus(id: string, dto: UpdateProductSkusDto) {
    const prod = await this.prisma.client.product.findUnique({
      where: { id },
      include: { skus: true },
    });
    if (!prod) throw new NotFoundException('Không tìm thấy sản phẩm');

    for (const item of dto.skus) {
      if (item.id) {
        await this.prisma.client.productSku.update({
          where: { id: item.id },
          data: {
            sellerSku: item.sellerSku,
            originalPrice: Number(item.originalPrice),
            salePrice: Number(item.salePrice),
            stockQuantity: Math.max(0, Number(item.stockQuantity)),
            ...(item.salesAttributes
              ? { salesAttributes: item.salesAttributes }
              : {}),
          },
        });
      } else {
        await this.prisma.client.productSku.create({
          data: {
            productId: id,
            externalSkuId: `${Date.now().toString().slice(-10)}`,
            sellerSku: item.sellerSku,
            originalPrice: Number(item.originalPrice),
            salePrice: Number(item.salePrice),
            stockQuantity: Math.max(0, Number(item.stockQuantity)),
            salesAttributes: item.salesAttributes || [
              { name: 'Phân loại', value_name: item.sellerSku },
            ],
          },
        });
      }
    }

    const updated = await this.prisma.client.product.update({
      where: { id },
      data: { updatedAt: new Date() },
      include: {
        category: true,
        skus: { orderBy: { salePrice: 'asc' } },
      },
    });

    return this.transformProduct(updated);
  }

  async bulkAction(dto: BulkProductActionDto) {
    if (!dto.productIds || dto.productIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 sản phẩm');
    }

    const products = await this.prisma.client.product.findMany({
      where: { id: { in: dto.productIds } },
    });

    for (const prod of products) {
      const meta = this.parseMeta(prod.packageDimensions, prod.status);
      let nextDbStatus = prod.status;

      if (dto.action === 'ACTIVATE') {
        nextDbStatus = 'ACTIVE';
        meta.subStatus = 'ACTIVE';
      } else if (dto.action === 'DEACTIVATE') {
        nextDbStatus = 'INACTIVE';
        meta.subStatus = 'INACTIVE';
      } else if (dto.action === 'PENDING') {
        nextDbStatus = 'DRAFT';
        meta.subStatus = 'PENDING';
      } else if (dto.action === 'DRAFT') {
        nextDbStatus = 'DRAFT';
        meta.subStatus = 'DRAFT';
      } else if (dto.action === 'DELETE') {
        nextDbStatus = 'INACTIVE';
        meta.subStatus = 'DELETED';
      } else if (dto.action === 'ADD_TAG' && dto.tag) {
        const tag = dto.tag.trim();
        this.customTags.add(tag);
        if (!meta.tags.includes(tag)) meta.tags.push(tag);
      } else if (dto.action === 'REMOVE_TAG' && dto.tag) {
        meta.tags = meta.tags.filter((t) => t !== dto.tag);
      }

      await this.prisma.client.product.update({
        where: { id: prod.id },
        data: {
          status: nextDbStatus,
          packageDimensions: meta as any,
        },
      });
    }

    return {
      code: 0,
      updatedCount: products.length,
    };
  }

  async importFromPlatform(dto: ImportPlatformProductDto) {
    let leafCat = await this.prisma.client.category.findFirst({
      where: { isLeaf: true },
    });

    if (!leafCat) {
      leafCat = await this.prisma.client.category.create({
        data: {
          externalCategoryId: '605012',
          localName: 'Scale Figure & Statue Chính hãng',
          slug: `scale-figure-statue-${Date.now()}`,
          level: 2,
          isLeaf: true,
          categoryVersion: 'v2',
          permissionStatuses: ['AVAILABLE'],
        },
      });
    }

    const timestamp = Date.now().toString().slice(-5);
    const isTikTok = dto.platform === 'TIKTOK_SHOP';

    const title = isTikTok
      ? `[Bonzstore] Mô Hình Figure Kimetsu no Yaiba Rengoku Kyoujurou Hơi Thở Của Lửa 29cm #${timestamp}`
      : `[Bonzstore] Nendoroid Frieren Pháp Sư Tiễn Táng Bản Đặc Biệt #${timestamp}`;

    const meta: ProductMetaJson = {
      subStatus: 'ACTIVE',
      tags: isTikTok
        ? ['Kimetsu no Yaiba', 'TikTok Sync', 'Best Seller']
        : ['Frieren', 'Shopee Copy'],
      soldCount: isTikTok ? 8 : 5,
      viewCount: isTikTok ? 2150 : 1340,
      revenue: isTikTok ? 3920000 : 2450000,
    };

    const created = await this.prisma.client.product.create({
      data: {
        title,
        slug: `${this.slugify(title)}-${timestamp}`,
        descriptionHtml: `<p>Sản phẩm Anime chính hãng được đồng bộ tự động từ ${dto.platform} về BonzStore Web.</p>`,
        categoryId: leafCat.id,
        brandName: isTikTok ? 'Banpresto / Bandai' : 'Good Smile Company',
        mainImages: [
          {
            url: isTikTok
              ? 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80'
              : 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&q=80',
            width: 800,
            height: 800,
          },
        ],
        packageDimensions: meta as any,
        status: 'ACTIVE',
        sourcePlatform: dto.platform,
        externalProductId: isTikTok
          ? `17340977316202${timestamp}`
          : `SP-${timestamp}99`,
        externalShopId:
          dto.externalShopId ||
          (isTikTok ? 'VN-BONZSTORE-TTS' : 'SHOPEE-OTAKU-88'),
        lastSyncedAt: new Date(),
        skus: {
          create: [
            {
              externalSkuId: `SKU-${timestamp}-1`,
              sellerSku: isTikTok
                ? `FIG-RENGOKU-DX-${timestamp}`
                : `NEND-FRIEREN-${timestamp}`,
              salesAttributes: isTikTok
                ? [
                    {
                      name: 'Phân loại',
                      value_name: 'Bản Deluxe Đế Lửa LED (29cm)',
                    },
                  ]
                : [
                    {
                      name: 'Phân loại',
                      value_name: 'Full Box + Trượng Pháp Sư',
                    },
                  ],
              originalPrice: isTikTok ? 650000 : 590000,
              salePrice: isTikTok ? 490000 : 445000,
              stockQuantity: isTikTok ? 24 : 18,
            },
            {
              externalSkuId: `SKU-${timestamp}-2`,
              sellerSku: isTikTok
                ? `FIG-RENGOKU-STD-${timestamp}`
                : `NEND-FERN-${timestamp}`,
              salesAttributes: isTikTok
                ? [{ name: 'Phân loại', value_name: 'Bản Tiêu Chuẩn (25cm)' }]
                : [{ name: 'Phân loại', value_name: 'Combo Frieren + Fern' }],
              originalPrice: isTikTok ? 420000 : 980000,
              salePrice: isTikTok ? 315000 : 750000,
              stockQuantity: isTikTok ? 12 : 9,
            },
          ],
        },
      },
      include: { category: true, skus: true },
    });

    return {
      code: 0,
      message: `Đã đồng bộ sản phẩm từ ${dto.platform} về Web thành công`,
      data: this.transformProduct(created),
    };
  }

  private transformProduct(p: any) {
    const skus = Array.isArray(p.skus) ? p.skus : [];
    const totalStock = skus.reduce(
      (sum: number, s: any) => sum + (s.stockQuantity || 0),
      0,
    );
    const outOfStockSkuCount = skus.filter(
      (s: any) => (s.stockQuantity || 0) <= 0,
    ).length;

    const salePrices = skus.map((s: any) => Number(s.salePrice) || 0);
    const origPrices = skus.map((s: any) => Number(s.originalPrice) || 0);

    const minPrice = salePrices.length ? Math.min(...salePrices) : 0;
    const maxPrice = salePrices.length ? Math.max(...salePrices) : 0;
    const minOriginalPrice = origPrices.length ? Math.min(...origPrices) : 0;
    const maxOriginalPrice = origPrices.length ? Math.max(...origPrices) : 0;

    const images = Array.isArray(p.mainImages) ? p.mainImages : [];
    const meta = this.parseMeta(p.packageDimensions, p.status);

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      brandName: p.brandName,
      status: meta.subStatus,
      dbStatus: p.status,
      attentionReason: meta.attentionReason || null,
      tags: meta.tags,
      performance: {
        soldCount: meta.soldCount,
        viewCount: meta.viewCount,
        revenue: meta.revenue,
      },
      sourcePlatform: p.sourcePlatform,
      externalProductId: p.externalProductId,
      externalShopId: p.externalShopId,
      lastSyncedAt: p.lastSyncedAt,
      thumbnailUrl: images[0]?.url || null,
      category: p.category
        ? {
            id: p.category.id,
            externalCategoryId: p.category.externalCategoryId,
            localName: p.category.localName,
            isLeaf: p.category.isLeaf,
            cipher: `TTP_VN_CAT_ASSET_${p.category.externalCategoryId || p.category.id}_202405`,
          }
        : null,
      skuCount: skus.length,
      outOfStockSkuCount,
      minPrice,
      maxPrice,
      minOriginalPrice,
      maxOriginalPrice,
      totalStock,
      skus,
      updatedAt: p.updatedAt || p.createdAt,
      createdAt: p.createdAt,
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
