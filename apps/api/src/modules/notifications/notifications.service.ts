import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isEmpty, trim } from 'lodash';
import {
  ADMIN_MANAGER_ROLES,
  ROLES,
} from '../../common/constants/rbac.constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateTestNotificationDto,
  NotificationAction,
  NotificationModuleType,
  NotificationQueryDto,
  UpdateNotificationSettingsDto,
} from './dto/notification.dto';

export interface NotificationModulePreference {
  CREATE: boolean;
  UPDATE: boolean;
  DELETE: boolean;
}

export interface NotificationSettings {
  masterEnabled: boolean;
  showToastOnEvent: boolean;
  onlyAdminActions: boolean;
  retentionDays: number;
  modules: Record<NotificationModuleType, NotificationModulePreference>;
  updatedAt: string;
  updatedBy?: string;
}

export interface AdminNotificationItem {
  id: string;
  module: NotificationModuleType;
  action: NotificationAction;
  titleVi: string;
  titleEn: string;
  messageVi: string;
  messageEn: string;
  targetName: string;
  targetLink: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  isRead: boolean;
  createdAt: string;
}

const ALL_MODULES: NotificationModuleType[] = [
  'PRODUCTS',
  'CATEGORIES',
  'TAGS',
  'USERS',
  'ROLES',
];

function createDefaultSettings(): NotificationSettings {
  return {
    masterEnabled: true,
    showToastOnEvent: true,
    onlyAdminActions: true,
    retentionDays: 30,
    modules: {
      PRODUCTS: { CREATE: true, UPDATE: true, DELETE: true },
      CATEGORIES: { CREATE: true, UPDATE: true, DELETE: true },
      TAGS: { CREATE: true, UPDATE: true, DELETE: true },
      USERS: { CREATE: true, UPDATE: true, DELETE: true },
      ROLES: { CREATE: true, UPDATE: true, DELETE: true },
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@bonzstore.com',
  };
}

@Injectable()
export class NotificationsService {
  private settings: NotificationSettings = createDefaultSettings();

  private notifications: AdminNotificationItem[] = [
    {
      id: 'notif-001',
      module: 'PRODUCTS',
      action: 'CREATE',
      titleVi: 'Thêm mới sản phẩm',
      titleEn: 'New Product Created',
      messageVi:
        'Admin đã đăng sản phẩm mới "[Chính Hãng] Mô Hình Hunter x Hunter Chibi Q-Ver ফুল Bộ 6 Nhân Vật" lên kệ.',
      messageEn:
        'Admin published new product "[Official] Hunter x Hunter Chibi Q-Ver Figure Set of 6" to store.',
      targetName:
        '[Chính Hãng] Mô Hình Hunter x Hunter Chibi Q-Ver Full Bộ 6 Nhân Vật',
      targetLink: '/products',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-002',
      module: 'CATEGORIES',
      action: 'UPDATE',
      titleVi: 'Cập nhật danh mục ngành hàng',
      titleEn: 'Category Updated',
      messageVi:
        'Quản lý cửa hàng đã cập nhật danh mục "Mô hình Nhân vật (Scale / Chibi / Prize Figure)" (ID: 605081).',
      messageEn:
        'Store Manager updated category "Character Figures (Scale / Chibi / Prize Figure)" (ID: 605081).',
      targetName: 'Mô hình Nhân vật (Scale / Chibi / Prize Figure)',
      targetLink: '/categories',
      actorName: 'Quản lý Cửa hàng',
      actorEmail: 'manager@bonzstore.com',
      actorRole: ROLES.STORE_MANAGER,
      isRead: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-003',
      module: 'TAGS',
      action: 'CREATE',
      titleVi: 'Tạo thẻ sản phẩm mới',
      titleEn: 'Product Tag Created',
      messageVi:
        'Admin đã tạo thẻ chiến dịch mới "Limited Edition" trong danh sách Thẻ sản phẩm.',
      messageEn:
        'Admin created a new campaign tag "Limited Edition" in Product Tags.',
      targetName: 'Limited Edition',
      targetLink: '/tags',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: false,
      createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-004',
      module: 'PRODUCTS',
      action: 'DELETE',
      titleVi: 'Xóa sản phẩm khỏi kệ',
      titleEn: 'Product Deleted',
      messageVi:
        'Admin đã chuyển sản phẩm "Móc Khóa Mica Anime Kimetsu no Yaiba Bản Cũ" sang trạng thái Đã xóa.',
      messageEn:
        'Admin moved product "Kimetsu no Yaiba Acrylic Keychain Old Ver" to Deleted status.',
      targetName: 'Móc Khóa Mica Anime Kimetsu no Yaiba Bản Cũ',
      targetLink: '/products?tab=DELETED',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-005',
      module: 'USERS',
      action: 'CREATE',
      titleVi: 'Tạo tài khoản nhân sự mới',
      titleEn: 'New User Account Created',
      messageVi:
        'Admin đã tạo tài khoản nhân viên mới "staff.tokyo@bonzstore.com" với vai trò STAFF.',
      messageEn:
        'Admin created a new staff account "staff.tokyo@bonzstore.com" with role STAFF.',
      targetName: 'staff.tokyo@bonzstore.com',
      targetLink: '/users',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-006',
      module: 'TAGS',
      action: 'UPDATE',
      titleVi: 'Đổi tên thẻ sản phẩm hàng loạt',
      titleEn: 'Product Tag Renamed',
      messageVi:
        'Quản lý cửa hàng đã đổi tên thẻ "Hot Sale" thành "Best Seller" trên 5 sản phẩm.',
      messageEn:
        'Store Manager renamed tag "Hot Sale" to "Best Seller" across 5 products.',
      targetName: 'Best Seller',
      targetLink: '/tags',
      actorName: 'Quản lý Cửa hàng',
      actorEmail: 'manager@bonzstore.com',
      actorRole: ROLES.STORE_MANAGER,
      isRead: true,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-007',
      module: 'ROLES',
      action: 'UPDATE',
      titleVi: 'Cập nhật ma trận phân quyền',
      titleEn: 'Role Permissions Updated',
      messageVi:
        'Admin đã cập nhật danh sách quyền hạn cho vai trò "Quản lý cửa hàng (STORE_MANAGER)".',
      messageEn:
        'Admin updated permission matrix for role "Store Manager (STORE_MANAGER)".',
      targetName: 'STORE_MANAGER',
      targetLink: '/roles',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: true,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-008',
      module: 'CATEGORIES',
      action: 'CREATE',
      titleVi: 'Tạo danh mục ngành hàng mới',
      titleEn: 'New Category Created',
      messageVi:
        'Admin đã tạo danh mục lá mới "Light Novel & Boxset Manga Đặc biệt" (ID: 607011).',
      messageEn:
        'Admin created new leaf category "Special Edition Light Novels & Manga Boxsets" (ID: 607011).',
      targetName: 'Light Novel & Boxset Manga Đặc biệt',
      targetLink: '/categories',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: true,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-009',
      module: 'USERS',
      action: 'UPDATE',
      titleVi: 'Cập nhật trạng thái tài khoản',
      titleEn: 'User Account Updated',
      messageVi:
        'Admin đã cập nhật thông tin và đặt lại mật khẩu bảo mật cho tài khoản "manager@bonzstore.com".',
      messageEn:
        'Admin updated profile and reset security password for account "manager@bonzstore.com".',
      targetName: 'manager@bonzstore.com',
      targetLink: '/users',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-010',
      module: 'TAGS',
      action: 'DELETE',
      titleVi: 'Xóa thẻ sản phẩm',
      titleEn: 'Product Tag Deleted',
      messageVi:
        'Quản lý cửa hàng đã xóa thẻ "Flash Deal T9" khỏi danh sách Thẻ sản phẩm.',
      messageEn:
        'Store Manager deleted tag "Flash Deal T9" from Product Tags.',
      targetName: 'Flash Deal T9',
      targetLink: '/tags',
      actorName: 'Quản lý Cửa hàng',
      actorEmail: 'manager@bonzstore.com',
      actorRole: ROLES.STORE_MANAGER,
      isRead: true,
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-011',
      module: 'CATEGORIES',
      action: 'DELETE',
      titleVi: 'Xóa danh mục ngành hàng',
      titleEn: 'Category Deleted',
      messageVi:
        'Admin đã xóa danh mục thử nghiệm "Phụ kiện Cosplay Tạm thời" khỏi cây danh mục.',
      messageEn:
        'Admin deleted temporary category "Temporary Cosplay Accessories" from category tree.',
      targetName: 'Phụ kiện Cosplay Tạm thời',
      targetLink: '/categories',
      actorName: 'Admin BonzStore',
      actorEmail: 'admin@bonzstore.com',
      actorRole: ROLES.SUPER_ADMIN,
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-012',
      module: 'PRODUCTS',
      action: 'UPDATE',
      titleVi: 'Cập nhật tồn kho & giá SKU',
      titleEn: 'Product SKU Stock & Price Updated',
      messageVi:
        'Quản lý cửa hàng đã cập nhật số lượng hàng có sẵn và giá khuyến mãi cho 12 SKU của sản phẩm Hunter x Hunter.',
      messageEn:
        'Store Manager updated available stock and promotional prices for 12 SKUs of Hunter x Hunter figure.',
      targetName: 'Mô Hình Hunter x Hunter Chibi Q-Ver (12 SKU)',
      targetLink: '/products',
      actorName: 'Quản lý Cửa hàng',
      actorEmail: 'manager@bonzstore.com',
      actorRole: ROLES.STORE_MANAGER,
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    },
  ];

  getSettings(): NotificationSettings {
    return this.settings;
  }

  updateSettings(
    dto: UpdateNotificationSettingsDto,
    currentUser?: AuthenticatedUser,
  ): NotificationSettings {
    if (dto.masterEnabled !== undefined) {
      this.settings.masterEnabled = dto.masterEnabled;
    }
    if (dto.showToastOnEvent !== undefined) {
      this.settings.showToastOnEvent = dto.showToastOnEvent;
    }
    if (dto.onlyAdminActions !== undefined) {
      this.settings.onlyAdminActions = dto.onlyAdminActions;
    }
    if (dto.retentionDays !== undefined) {
      this.settings.retentionDays = dto.retentionDays;
    }
    if (dto.modules) {
      for (const mod of ALL_MODULES) {
        const patch = dto.modules[mod];
        if (patch) {
          this.settings.modules[mod] = {
            ...this.settings.modules[mod],
            ...(patch.CREATE !== undefined ? { CREATE: patch.CREATE } : {}),
            ...(patch.UPDATE !== undefined ? { UPDATE: patch.UPDATE } : {}),
            ...(patch.DELETE !== undefined ? { DELETE: patch.DELETE } : {}),
          };
        }
      }
    }

    this.settings.updatedAt = new Date().toISOString();
    if (currentUser?.email) {
      this.settings.updatedBy = currentUser.email;
    }

    return this.settings;
  }

  resetSettings(currentUser?: AuthenticatedUser): NotificationSettings {
    this.settings = {
      ...createDefaultSettings(),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.email || 'admin@bonzstore.com',
    };
    return this.settings;
  }

  /**
   * Kiểm tra xem cấu hình hiện tại có cho phép ghi nhận thông báo cho (module, action) hay không
   */
  shouldRecord(
    module: NotificationModuleType,
    action: NotificationAction,
    actorRole?: string,
  ): boolean {
    if (!this.settings.masterEnabled) {
      return false;
    }
    if (
      this.settings.onlyAdminActions &&
      actorRole &&
      !(ADMIN_MANAGER_ROLES as readonly string[]).includes(actorRole)
    ) {
      return false;
    }
    const modPrefs = this.settings.modules[module];
    if (!modPrefs) return false;
    return Boolean(modPrefs[action]);
  }

  /**
   * Ghi nhận thông báo tự động khi có thao tác Thêm / Sửa / Xóa (CREATE / UPDATE / DELETE) từ các module
   */
  recordCrudEvent(params: {
    module: NotificationModuleType;
    action: NotificationAction;
    titleVi: string;
    titleEn: string;
    messageVi: string;
    messageEn: string;
    targetName: string;
    targetLink: string;
    currentUser?: AuthenticatedUser;
  }): AdminNotificationItem | null {
    const actorRole = params.currentUser?.role?.code || ROLES.SUPER_ADMIN;
    if (!this.shouldRecord(params.module, params.action, actorRole)) {
      return null;
    }

    const actorEmail = params.currentUser?.email || 'admin@bonzstore.com';
    const actorName =
      actorRole === ROLES.SUPER_ADMIN
        ? 'Admin BonzStore'
        : actorRole === ROLES.STORE_MANAGER
          ? 'Quản lý Cửa hàng'
          : actorEmail;

    const item: AdminNotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      module: params.module,
      action: params.action,
      titleVi: params.titleVi,
      titleEn: params.titleEn,
      messageVi: params.messageVi,
      messageEn: params.messageEn,
      targetName: params.targetName,
      targetLink: params.targetLink,
      actorName,
      actorEmail,
      actorRole,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(item);
    return item;
  }

  createTestNotification(
    dto: CreateTestNotificationDto,
    currentUser?: AuthenticatedUser,
  ): AdminNotificationItem {
    const module: NotificationModuleType = dto.module || 'PRODUCTS';
    const action: NotificationAction = dto.action || 'CREATE';
    const actorRole = currentUser?.role?.code || ROLES.SUPER_ADMIN;

    if (!this.settings.masterEnabled) {
      throw new BadRequestException(
        'Thông báo tổng đang tắt. Vui lòng bật "Nhận thông báo hệ thống" để nhận thông báo mới.',
      );
    }

    if (!this.settings.modules[module]?.[action]) {
      throw new BadRequestException(
        `Thông báo cho tác vụ ${action} trên phân hệ ${module} đang bị tắt trong Cài đặt thông báo.`,
      );
    }

    const targetName =
      trim(dto.customTargetName || '') ||
      (module === 'PRODUCTS'
        ? 'Figure Gojo Satoru Jujutsu Kaisen Scale 1/7'
        : module === 'CATEGORIES'
          ? 'Mô hình Nhân vật (Scale / Chibi / Prize Figure)'
          : module === 'TAGS'
            ? 'Jujutsu Kaisen'
            : module === 'USERS'
              ? 'manager@bonzstore.com'
              : 'STORE_MANAGER');

    const linkMap: Record<NotificationModuleType, string> = {
      PRODUCTS: '/products',
      CATEGORIES: '/categories',
      TAGS: '/tags',
      USERS: '/users',
      ROLES: '/roles',
    };

    const actionLabelsVi: Record<NotificationAction, string> = {
      CREATE: 'Thêm mới',
      UPDATE: 'Chỉnh sửa',
      DELETE: 'Xóa',
    };

    const actionLabelsEn: Record<NotificationAction, string> = {
      CREATE: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
    };

    const moduleLabelsVi: Record<NotificationModuleType, string> = {
      PRODUCTS: 'Sản phẩm',
      CATEGORIES: 'Danh mục',
      TAGS: 'Thẻ sản phẩm',
      USERS: 'Tài khoản người dùng',
      ROLES: 'Vai trò & Quyền hạn',
    };

    const moduleLabelsEn: Record<NotificationModuleType, string> = {
      PRODUCTS: 'Product',
      CATEGORIES: 'Category',
      TAGS: 'Product Tag',
      USERS: 'User Account',
      ROLES: 'Role & Permissions',
    };

    const created = this.recordCrudEvent({
      module,
      action,
      titleVi: `[Test] ${actionLabelsVi[action]} ${moduleLabelsVi[module]}`,
      titleEn: `[Test] ${moduleLabelsEn[module]} ${actionLabelsEn[action]}`,
      messageVi: `Quản trị viên (${actorRole}) vừa thực hiện tác vụ ${actionLabelsVi[action].toLowerCase()} trên ${moduleLabelsVi[module].toLowerCase()} "${targetName}".`,
      messageEn: `Administrator (${actorRole}) performed ${actionLabelsEn[action].toLowerCase()} action on ${moduleLabelsEn[module].toLowerCase()} "${targetName}".`,
      targetName,
      targetLink: linkMap[module],
      currentUser,
    });

    if (!created) {
      throw new BadRequestException(
        'Tác vụ này hiện đang bị chặn bởi bộ lọc cài đặt thông báo.',
      );
    }

    return created;
  }

  getStats() {
    const total = this.notifications.length;
    const unreadCount = this.notifications.filter((n) => !n.isRead).length;
    const readCount = total - unreadCount;

    const byAction: Record<NotificationAction, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
    };

    const byModule: Record<NotificationModuleType, number> = {
      PRODUCTS: 0,
      CATEGORIES: 0,
      TAGS: 0,
      USERS: 0,
      ROLES: 0,
    };

    for (const item of this.notifications) {
      byAction[item.action] = (byAction[item.action] || 0) + 1;
      byModule[item.module] = (byModule[item.module] || 0) + 1;
    }

    return {
      total,
      unreadCount,
      readCount,
      byAction,
      byModule,
    };
  }

  findPaginated(query: NotificationQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'asc' ? 'asc' : 'desc';
    const cleanedSearch = trim(query.search || '').toLowerCase();

    let filtered = [...this.notifications];

    if (query.module && query.module !== 'ALL') {
      filtered = filtered.filter((n) => n.module === query.module);
    }

    if (query.action && query.action !== 'ALL') {
      filtered = filtered.filter((n) => n.action === query.action);
    }

    if (query.readStatus === 'UNREAD') {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (query.readStatus === 'READ') {
      filtered = filtered.filter((n) => n.isRead);
    }

    if (!isEmpty(cleanedSearch)) {
      filtered = filtered.filter(
        (n) =>
          n.titleVi.toLowerCase().includes(cleanedSearch) ||
          n.titleEn.toLowerCase().includes(cleanedSearch) ||
          n.messageVi.toLowerCase().includes(cleanedSearch) ||
          n.messageEn.toLowerCase().includes(cleanedSearch) ||
          n.targetName.toLowerCase().includes(cleanedSearch) ||
          n.actorName.toLowerCase().includes(cleanedSearch) ||
          n.actorEmail.toLowerCase().includes(cleanedSearch),
      );
    }

    const dir = sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortBy === 'module') {
        const cmp = a.module.localeCompare(b.module) * dir;
        if (cmp !== 0) return cmp;
      } else if (sortBy === 'action') {
        const cmp = a.action.localeCompare(b.action) * dir;
        if (cmp !== 0) return cmp;
      }
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        dir
      );
    });

    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const data = filtered.slice(start, start + limit);

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
      stats: this.getStats(),
    };
  }

  markAsRead(id: string, isRead = true): AdminNotificationItem {
    const target = this.notifications.find((n) => n.id === id);
    if (!target) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    target.isRead = isRead;
    return target;
  }

  markAllAsRead() {
    let updatedCount = 0;
    for (const item of this.notifications) {
      if (!item.isRead) {
        item.isRead = true;
        updatedCount += 1;
      }
    }
    return {
      updatedCount,
      stats: this.getStats(),
    };
  }

  clearRead() {
    const before = this.notifications.length;
    this.notifications = this.notifications.filter((n) => !n.isRead);
    const deletedCount = before - this.notifications.length;
    return {
      deletedCount,
      stats: this.getStats(),
    };
  }

  remove(id: string) {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    const [removed] = this.notifications.splice(idx, 1);
    return {
      deletedId: removed.id,
      stats: this.getStats(),
    };
  }
}

