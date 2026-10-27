import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateProductDto,
  ImportPlatformProductDto,
} from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [total, active, syncedFromPlatform, skuAgg] = await Promise.all([
      this.prisma.client.product.count(),
      this.prisma.client.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.client.product.count({
        where: { sourcePlatform: { in: ['TIKTOK_SHOP', 'SHOPEE'] } },
      }),
      this.prisma.client.productSku.aggregate({
        _sum: { stockQuantity: true },
      }),
    ]);

    return {
      total,
      active,
      syncedFromPlatform,
      totalStock: skuAgg._sum.stockQuantity || 0,
    };
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = query.skip;
    const take = query.take;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.sourcePlatform) where.sourcePlatform = query.sourcePlatform;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { externalProductId: { contains: query.search, mode: 'insensitive' } },
        { brandName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          skus: true,
        },
      }),
      this.prisma.client.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((p) => this.transformProduct(p)),
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
    const mainImages = dto.imageUrl
      ? [{ url: dto.imageUrl, width: 800, height: 800 }]
      : [];

    const created = await this.prisma.client.product.create({
      data: {
        title: dto.title,
        slug,
        categoryId: dto.categoryId,
        brandName: dto.brandName || 'BonzStore',
        descriptionHtml: dto.descriptionHtml,
        mainImages,
        status: 'ACTIVE',
        sourcePlatform: dto.sourcePlatform || 'LOCAL',
        skus: {
          create: [
            {
              sellerSku: dto.sellerSku,
              originalPrice: dto.originalPrice,
              salePrice: dto.salePrice,
              stockQuantity: dto.stockQuantity,
              salesAttributes: dto.salesAttributes || [
                { name: 'Phiên bản', value_name: 'Tiêu chuẩn' },
              ],
            },
          ],
        },
      },
      include: {
        category: true,
        skus: true,
      },
    });

    return this.transformProduct(created);
  }

  async updateStatus(
    id: string,
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FREEZE',
  ) {
    const prod = await this.prisma.client.product.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Không tìm thấy sản phẩm');

    const updated = await this.prisma.client.product.update({
      where: { id },
      data: { status },
      include: { category: true, skus: true },
    });

    return this.transformProduct(updated);
  }

  async importFromPlatform(dto: ImportPlatformProductDto) {
    // Ensure leaf categories exist
    let leafCat = await this.prisma.client.category.findFirst({
      where: { isLeaf: true },
    });

    if (!leafCat) {
      leafCat = await this.prisma.client.category.create({
        data: {
          externalCategoryId: '600012',
          localName: 'Áo thun & Polo Nam',
          slug: `ao-thun-polo-nam-${Date.now()}`,
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
      ? `[TikTok Sync] Mô hình Figure Luffy Gear 5 Sun God Nika 28cm #${timestamp}`
      : `[Shopee Copy] Nendoroid Gojo Satoru Jujutsu Kaisen Ver.DX #${timestamp}`;

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
        status: 'ACTIVE',
        sourcePlatform: dto.platform,
        externalProductId: isTikTok
          ? `17295${timestamp}88`
          : `SP-${timestamp}99`,
        externalShopId:
          dto.externalShopId || (isTikTok ? 'VN-ANIME-TTS-99' : 'SHOPEE-OTAKU-88'),
        lastSyncedAt: new Date(),
        skus: {
          create: [
            {
              externalSkuId: `SKU-${timestamp}-1`,
              sellerSku: isTikTok ? `FIG-LUFFY-G5-${timestamp}` : `NEND-GOJO-${timestamp}`,
              salesAttributes: isTikTok
                ? [
                    { name: 'Phiên bản', value_name: 'Awakening LED Base' },
                    { name: 'Tỉ lệ', value_name: '1/7 (28cm)' },
                  ]
                : [{ name: 'Phiên bản', value_name: 'Full Box + Faceplate' }],
              originalPrice: isTikTok ? 1450000 : 1290000,
              salePrice: isTikTok ? 980000 : 890000,
              stockQuantity: isTikTok ? 45 : 30,
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
    const skus = p.skus || [];
    const totalStock = skus.reduce(
      (sum: number, s: any) => sum + (s.stockQuantity || 0),
      0,
    );
    const minPrice = skus.length
      ? Math.min(...skus.map((s: any) => s.salePrice))
      : 0;
    const images = Array.isArray(p.mainImages) ? p.mainImages : [];

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      brandName: p.brandName,
      status: p.status,
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
          }
        : null,
      skuCount: skus.length,
      minPrice,
      totalStock,
      skus,
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

