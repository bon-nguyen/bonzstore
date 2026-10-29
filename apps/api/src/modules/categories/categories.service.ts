import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { isEmpty, isNil, trim } from 'lodash';
import { ADMIN_MANAGER_ROLES } from '../../common/constants/rbac.constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

export interface CategoryNodeItem {
  id: string;
  externalCategoryId: string | null;
  parentId: string | null;
  parentName: string | null;
  externalParentId: string | null;
  localName: string;
  slug: string;
  level: number;
  isLeaf: boolean;
  categoryVersion: string;
  permissionStatuses: string[];
  status: 'ACTIVE' | 'INACTIVE';
  productCount: number;
  directProductCount: number;
  childrenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.client.category.count();
      if (count < 12) {
        await this.syncTikTokCategoryAssets();
      } else {
        await this.repairCategoryHierarchyLinks();
      }
    } catch {
      // Ignore if database is not migrated yet
    }
  }

  private assertCanManageCategories(currentUser?: AuthenticatedUser): void {
    if (!currentUser) return;
    const roleCode = currentUser.role?.code || '';
    if (!ADMIN_MANAGER_ROLES.includes(roleCode as any)) {
      throw new ForbiddenException(
        'Chỉ quyền Admin (SUPER_ADMIN) và Quản lý (STORE_MANAGER) mới được phép thêm, chỉnh sửa hoặc xóa danh mục',
      );
    }
  }

  /**
   * Đảm bảo mọi danh mục con có externalParentId !== '0' đều được gắn đúng parentId UUID
   */
  private async repairCategoryHierarchyLinks() {
    const all = await this.prisma.client.category.findMany();
    const extIdToCategory = new Map<string, (typeof all)[number]>();
    for (const c of all) {
      if (c.externalCategoryId) {
        extIdToCategory.set(c.externalCategoryId, c);
      }
    }

    for (const c of all) {
      if (
        c.externalParentId &&
        c.externalParentId !== '0' &&
        !c.parentId &&
        extIdToCategory.has(c.externalParentId)
      ) {
        const parent = extIdToCategory.get(c.externalParentId)!;
        if (parent.id !== c.id) {
          await this.prisma.client.category.update({
            where: { id: c.id },
            data: {
              parentId: parent.id,
              level: parent.level + 1,
            },
          });
        }
      }
    }
  }

  /**
   * Xây dựng cây danh mục chuẩn Cha -> Con liền kề (không bao giờ tách rời con khỏi cha)
   */
  private async buildTreeAndFlatten(query?: CategoryQueryDto): Promise<{
    flattened: CategoryNodeItem[];
    families: CategoryNodeItem[][];
  }> {
    const rawList = await this.prisma.client.category.findMany({
      include: {
        parent: true,
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    const byId = new Map<string, (typeof rawList)[number]>();
    const byExtId = new Map<string, (typeof rawList)[number]>();

    for (const item of rawList) {
      byId.set(item.id, item);
      if (item.externalCategoryId) {
        byExtId.set(item.externalCategoryId, item);
      }
    }

    // Map sang node chuẩn và xác định cha thực tế (qua parentId hoặc externalParentId)
    const nodeMap = new Map<
      string,
      CategoryNodeItem & { childrenNodes: CategoryNodeItem[] }
    >();

    for (const c of rawList) {
      let resolvedParent = c.parentId ? byId.get(c.parentId) : undefined;
      if (
        !resolvedParent &&
        c.externalParentId &&
        c.externalParentId !== '0'
      ) {
        resolvedParent = byExtId.get(c.externalParentId);
      }
      if (resolvedParent && resolvedParent.id === c.id) {
        resolvedParent = undefined;
      }

      const extParentId = resolvedParent
        ? resolvedParent.externalCategoryId || resolvedParent.id
        : c.externalParentId || '0';

      nodeMap.set(c.id, {
        id: c.id,
        externalCategoryId: c.externalCategoryId,
        parentId: resolvedParent ? resolvedParent.id : null,
        parentName: resolvedParent ? resolvedParent.localName : null,
        externalParentId: extParentId,
        localName: c.localName,
        slug: c.slug,
        level: resolvedParent ? 2 : 1,
        isLeaf: c.isLeaf,
        categoryVersion: c.categoryVersion,
        permissionStatuses: c.permissionStatuses,
        status: c.status,
        productCount: c._count.products,
        directProductCount: c._count.products,
        childrenCount: c._count.children,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        childrenNodes: [],
      });
    }

    const roots: Array<
      CategoryNodeItem & { childrenNodes: CategoryNodeItem[] }
    > = [];

    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parentNode = nodeMap.get(node.parentId)!;
        node.level = parentNode.level + 1;
        node.parentName = parentNode.localName;
        node.externalParentId =
          parentNode.externalCategoryId || parentNode.id;
        parentNode.childrenNodes.push(node);
      } else {
        node.level = 1;
        node.externalParentId = '0';
        roots.push(node);
      }
    }

    // Tính tổng số sản phẩm của danh mục cha = sản phẩm trực tiếp + tổng sản phẩm các danh mục con
    for (const root of roots) {
      root.childrenCount = root.childrenNodes.length;
      if (root.childrenNodes.length > 0) {
        const childrenProducts = root.childrenNodes.reduce(
          (sum, ch) => sum + ch.directProductCount,
          0,
        );
        root.productCount = root.directProductCount + childrenProducts;
      }
    }

    const sortBy = query?.sortBy || 'localName';
    const sortOrder = query?.sortOrder === 'desc' ? 'desc' : 'asc';
    const dir = sortOrder === 'desc' ? -1 : 1;

    const compareNodes = (a: CategoryNodeItem, b: CategoryNodeItem): number => {
      if (sortBy === 'productCount') {
        const diff = (a.productCount - b.productCount) * dir;
        if (diff !== 0) return diff;
      } else if (sortBy === 'status') {
        const diff = a.status.localeCompare(b.status) * dir;
        if (diff !== 0) return diff;
      } else if (sortBy === 'createdAt') {
        const diff =
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir;
        if (diff !== 0) return diff;
      }
      return a.localName.localeCompare(b.localName, 'vi') * dir;
    };

    // Sắp xếp các danh mục cha, và bên trong từng danh mục cha sắp xếp các danh mục con
    roots.sort(compareNodes);
    for (const root of roots) {
      root.childrenNodes.sort(compareNodes);
    }

    const cleanedSearch = trim(query?.search || '').toLowerCase();
    const statusFilter = query?.status;
    const isLeafFilter = query?.isLeaf;

    const matchesNode = (node: CategoryNodeItem): boolean => {
      if (statusFilter && node.status !== statusFilter) {
        return false;
      }
      if (
        isLeafFilter !== undefined &&
        node.isLeaf !== (isLeafFilter === 'true')
      ) {
        return false;
      }
      if (!isEmpty(cleanedSearch)) {
        const extId = (node.externalCategoryId || '').toLowerCase();
        const extParent = (node.externalParentId || '').toLowerCase();
        const cipher =
          `ttp_vn_cat_asset_${extId || node.id.slice(0, 6)}_202405`.toLowerCase();
        const nameMatch = node.localName.toLowerCase().includes(cleanedSearch);
        const parentNameMatch = (node.parentName || '')
          .toLowerCase()
          .includes(cleanedSearch);
        const slugMatch = node.slug.toLowerCase().includes(cleanedSearch);

        return (
          nameMatch ||
          parentNameMatch ||
          slugMatch ||
          extId.includes(cleanedSearch) ||
          extParent.includes(cleanedSearch) ||
          cipher.includes(cleanedSearch)
        );
      }
      return true;
    };

    const stripInternal = (
      node: CategoryNodeItem & { childrenNodes?: CategoryNodeItem[] },
    ): CategoryNodeItem => {
      const { childrenNodes: _ignored, ...rest } = node;
      return rest;
    };

    const families: CategoryNodeItem[][] = [];
    const flattened: CategoryNodeItem[] = [];

    const hasSearch = !isEmpty(cleanedSearch);
    const hasStatus = Boolean(statusFilter);
    const hasIsLeaf = isLeafFilter !== undefined;

    for (const root of roots) {
      if (!hasSearch && !hasStatus && !hasIsLeaf) {
        const family = [
          stripInternal(root),
          ...root.childrenNodes.map((ch) => stripInternal(ch)),
        ];
        families.push(family);
        flattened.push(...family);
        continue;
      }

      const rootSelfMatch = matchesNode(root);
      const matchingChildren = root.childrenNodes.filter((ch) =>
        matchesNode(ch),
      );

      if (hasIsLeaf && isLeafFilter === 'true') {
        const leafFamily: CategoryNodeItem[] = [];
        if (rootSelfMatch && root.isLeaf) {
          leafFamily.push(stripInternal(root));
        }
        for (const ch of matchingChildren) {
          leafFamily.push(stripInternal(ch));
        }
        if (leafFamily.length > 0) {
          families.push(leafFamily);
          flattened.push(...leafFamily);
        }
        continue;
      }

      if (rootSelfMatch) {
        // Nếu cha khớp từ khóa tìm kiếm (và không có con nào khớp riêng lẻ), hiển thị cha cùng toàn bộ con của nó ngay bên dưới
        const childrenToInclude =
          matchingChildren.length > 0
            ? matchingChildren
            : root.childrenNodes.filter((ch) =>
                statusFilter ? ch.status === statusFilter : true,
              );
        const family = [
          stripInternal(root),
          ...childrenToInclude.map((ch) => stripInternal(ch)),
        ];
        families.push(family);
        flattened.push(...family);
      } else if (matchingChildren.length > 0) {
        // Nếu danh mục con khớp tìm kiếm/bộ lọc, luôn giữ thành phần cha ngay phía trên để không tách rời cha - con
        const family = [
          stripInternal(root),
          ...matchingChildren.map((ch) => stripInternal(ch)),
        ];
        families.push(family);
        flattened.push(...family);
      }
    }

    return { flattened, families };
  }

  async findAll(query?: CategoryQueryDto) {
    const { flattened } = await this.buildTreeAndFlatten(query);
    return flattened;
  }

  async findPaginated(query: CategoryQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const sortBy = query.sortBy || 'localName';
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'desc' ? 'desc' : 'asc';

    const { flattened, families } = await this.buildTreeAndFlatten(query);

    // Phân trang theo cụm Cha-Con (Family-aware pagination) để danh mục con luôn nằm ngay dưới danh mục cha, không bị cắt qua trang khác
    const pages: CategoryNodeItem[][] = [];
    let currentPageItems: CategoryNodeItem[] = [];

    for (const family of families) {
      if (
        currentPageItems.length > 0 &&
        currentPageItems.length + family.length > limit
      ) {
        pages.push(currentPageItems);
        currentPageItems = [...family];
      } else {
        currentPageItems.push(...family);
      }
    }
    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
    }

    const total = flattened.length;
    const totalPages = Math.max(pages.length, 1);
    const safePage = Math.min(page, totalPages);
    const data = pages[safePage - 1] || [];

    return {
      data,
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Trả về cấu trúc chuẩn TikTok Shop Partner API (get-authorized-category-assets-202405)
   * Ref: GET /authorization/202405/category_assets
   */
  async getAuthorizedCategoryAssets() {
    const { flattened } = await this.buildTreeAndFlatten();
    const activeCategories = flattened.filter((c) => c.status === 'ACTIVE');

    return {
      code: 0,
      message: 'Success',
      request_id: `${Date.now()}-${randomUUID().slice(0, 8)}`,
      data: {
        category_assets: activeCategories.map((c) => {
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

  async create(dto: CreateCategoryDto, currentUser?: AuthenticatedUser) {
    this.assertCanManageCategories(currentUser);

    const localName = trim(dto.localName);
    if (isEmpty(localName)) {
      throw new BadRequestException('Tên danh mục không được để trống');
    }

    const slug = this.slugify(localName);
    let level = 1;
    let externalParentId = '0';
    let parentId: string | null = null;

    if (!isEmpty(trim(dto.externalCategoryId || ''))) {
      const existingExt = await this.prisma.client.category.findUnique({
        where: { externalCategoryId: trim(dto.externalCategoryId!) },
      });
      if (existingExt) {
        throw new BadRequestException(
          `Mã danh mục (id: ${dto.externalCategoryId}) đã tồn tại trong hệ thống`,
        );
      }
    }

    if (!isEmpty(trim(dto.parentId || ''))) {
      const parent = await this.prisma.client.category.findUnique({
        where: { id: trim(dto.parentId!) },
      });
      if (!parent) {
        throw new BadRequestException('Danh mục cha không tồn tại');
      }
      parentId = parent.id;
      level = parent.level + 1;
      externalParentId = parent.externalCategoryId || parent.id;

      if (parent.isLeaf) {
        await this.prisma.client.category.update({
          where: { id: parent.id },
          data: { isLeaf: false },
        });
      }
    }

    return this.prisma.client.category.create({
      data: {
        localName,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        externalCategoryId:
          !isEmpty(trim(dto.externalCategoryId || ''))
            ? trim(dto.externalCategoryId!)
            : `${Math.floor(600000 + Math.random() * 299999)}`,
        parentId,
        externalParentId,
        level,
        isLeaf: dto.isLeaf ?? (parentId !== null),
        categoryVersion: dto.categoryVersion || 'v2',
        permissionStatuses: dto.permissionStatuses || ['AVAILABLE'],
        status: dto.status || 'ACTIVE',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    currentUser?: AuthenticatedUser,
  ) {
    this.assertCanManageCategories(currentUser);

    const existing = await this.prisma.client.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const updateData: Record<string, unknown> = {};

    if (!isNil(dto.localName)) {
      const cleanedName = trim(dto.localName);
      if (isEmpty(cleanedName)) {
        throw new BadRequestException('Tên danh mục không được để trống');
      }
      updateData.localName = cleanedName;
    }

    if (!isNil(dto.externalCategoryId)) {
      const cleanedExtId = trim(dto.externalCategoryId);
      if (!isEmpty(cleanedExtId) && cleanedExtId !== existing.externalCategoryId) {
        const duplicate = await this.prisma.client.category.findUnique({
          where: { externalCategoryId: cleanedExtId },
        });
        if (duplicate && duplicate.id !== id) {
          throw new BadRequestException(
            `Mã danh mục (id: ${cleanedExtId}) đã được sử dụng bởi danh mục khác`,
          );
        }
        updateData.externalCategoryId = cleanedExtId;
      }
    }

    if (dto.parentId !== undefined) {
      const cleanedParentId = trim(dto.parentId || '');
      if (isEmpty(cleanedParentId)) {
        updateData.parentId = null;
        updateData.externalParentId = '0';
        updateData.level = 1;
      } else {
        if (cleanedParentId === id) {
          throw new BadRequestException(
            'Danh mục không thể chọn chính nó làm danh mục cha',
          );
        }
        const parent = await this.prisma.client.category.findUnique({
          where: { id: cleanedParentId },
        });
        if (!parent) {
          throw new BadRequestException('Danh mục cha không tồn tại');
        }
        if (parent.parentId === id) {
          throw new BadRequestException(
            'Không thể chọn danh mục con của chính danh mục này làm danh mục cha',
          );
        }
        updateData.parentId = parent.id;
        updateData.externalParentId = parent.externalCategoryId || parent.id;
        updateData.level = parent.level + 1;

        if (parent.isLeaf) {
          await this.prisma.client.category.update({
            where: { id: parent.id },
            data: { isLeaf: false },
          });
        }
      }
    }

    if (!isNil(dto.isLeaf)) {
      updateData.isLeaf = existing.children.length > 0 ? false : dto.isLeaf;
    }

    if (!isNil(dto.status)) {
      updateData.status = dto.status;
    }

    if (!isNil(dto.categoryVersion)) {
      updateData.categoryVersion = dto.categoryVersion;
    }

    if (!isNil(dto.permissionStatuses) && dto.permissionStatuses.length > 0) {
      updateData.permissionStatuses = dto.permissionStatuses;
    }

    const updated = await this.prisma.client.category.update({
      where: { id },
      data: updateData,
    });

    // Đồng bộ lại externalParentId và level cho các danh mục con nếu có thay đổi
    if (existing.children.length > 0) {
      await this.prisma.client.category.updateMany({
        where: { parentId: id },
        data: {
          externalParentId: updated.externalCategoryId || updated.id,
          level: updated.level + 1,
        },
      });
    }

    return updated;
  }

  async remove(id: string, currentUser?: AuthenticatedUser) {
    this.assertCanManageCategories(currentUser);

    const existing = await this.prisma.client.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh mục cần xóa');
    }

    // Nếu danh mục đang có danh mục con, chuyển các danh mục con lên cấp gốc (parent_id = 0) trước khi xóa
    if (existing.children.length > 0) {
      await this.prisma.client.category.updateMany({
        where: { parentId: id },
        data: {
          parentId: null,
          externalParentId: '0',
          level: 1,
        },
      });
    }

    // Nếu danh mục đang gắn sản phẩm, tự động chuyển sản phẩm sang một danh mục lá dự phòng để không lỗi khóa ngoại
    if (existing._count.products > 0) {
      let fallbackCat = await this.prisma.client.category.findFirst({
        where: {
          id: { not: id },
          isLeaf: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!fallbackCat) {
        fallbackCat = await this.prisma.client.category.findFirst({
          where: { id: { not: id } },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!fallbackCat) {
        fallbackCat = await this.prisma.client.category.create({
          data: {
            externalCategoryId: '605999',
            externalParentId: '0',
            localName: 'Danh mục Anime Tổng hợp (Mặc định)',
            slug: `danh-muc-anime-mac-dinh-${Date.now().toString().slice(-4)}`,
            level: 1,
            isLeaf: true,
            categoryVersion: 'v2',
            permissionStatuses: ['AVAILABLE'],
            status: 'ACTIVE',
          },
        });
      }

      await this.prisma.client.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallbackCat.id },
      });
    }

    await this.prisma.client.category.delete({
      where: { id },
    });

    return {
      id,
      localName: existing.localName,
      deleted: true,
      message: `Đã xóa danh mục ${existing.localName}`,
    };
  }

  /**
   * Khởi tạo mẫu cây danh mục Anime chuẩn TikTok Shop 202405 về PostgreSQL
   */
  async syncTikTokCategoryAssets() {
    const tiktokAssets: Array<{
      extId: string;
      extParentId: string;
      localName: string;
      level: number;
      isLeaf: boolean;
      permissionStatuses: string[];
      status?: 'ACTIVE' | 'INACTIVE';
    }> = [
      {
        extId: '605001',
        extParentId: '0',
        localName: 'Mô hình & Đồ chơi Anime (Figures & Collectibles)',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '605012',
        extParentId: '605001',
        localName: 'Scale Figure & Statue Chính hãng',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '605015',
        extParentId: '605001',
        localName: 'Nendoroid & Mô hình Chibi',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '605018',
        extParentId: '605001',
        localName: 'Gunpla & Model Kit Nhựa Lắp Ráp',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '606001',
        extParentId: '0',
        localName: 'Thời trang & Phụ kiện Cosplay Anime',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '606025',
        extParentId: '606001',
        localName: 'Trang phục Cosplay & Áo Haori Kimetsu',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '606028',
        extParentId: '606001',
        localName: 'Tóc giả Wig & Phụ kiện Vũ khí Cosplay',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '607001',
        extParentId: '0',
        localName: 'Manga, Light Novel & Artbook',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE', 'INVITE_ONLY'],
        status: 'ACTIVE',
      },
      {
        extId: '607019',
        extParentId: '607001',
        localName: 'Light Novel & Boxset Manga Đặc biệt',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '607022',
        extParentId: '607001',
        localName: 'Artbook & Illustration Book Chính hãng',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE', 'INVITE_ONLY'],
        status: 'ACTIVE',
      },
      {
        extId: '608001',
        extParentId: '0',
        localName: 'Vật phẩm Sưu tầm & Goods Anime (Merchandise)',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '608011',
        extParentId: '608001',
        localName: 'Móc khóa Acrylic, Standee & Huy hiệu Badge',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '608015',
        extParentId: '608001',
        localName: 'Thẻ bài Sưu tầm TCG (One Piece / Pokémon)',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '609001',
        extParentId: '0',
        localName: 'Trang trí Phòng Otaku & Đèn LED Anime',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '609012',
        extParentId: '609001',
        localName: 'Đèn ngủ LED 3D Acrylic & Tranh Canvas Anime',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '609016',
        extParentId: '609001',
        localName: 'Gối ôm Dakimakura & Thảm trải bàn Gaming',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'INACTIVE',
      },
      {
        extId: '610001',
        extParentId: '0',
        localName: 'Thú bông Plushie & Nesoberi Anime',
        level: 1,
        isLeaf: false,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '610011',
        extParentId: '610001',
        localName: 'Thú bông Plushie & Móc khóa Bông Chibi',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'ACTIVE',
      },
      {
        extId: '610015',
        extParentId: '610001',
        localName: 'Gối bông Nesoberi & Blindbox Nhồi Bông',
        level: 2,
        isLeaf: true,
        permissionStatuses: ['AVAILABLE'],
        status: 'INACTIVE',
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
          status: item.status || 'ACTIVE',
        },
      });

      extMap.set(item.extId, record.id);
    }

    await this.repairCategoryHierarchyLinks();

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
