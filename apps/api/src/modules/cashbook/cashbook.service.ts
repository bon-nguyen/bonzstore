import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { isEmpty, trim } from 'lodash';
import { ADMIN_MANAGER_ROLES } from '../../common/constants/rbac.constants';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { HoabinhMainOrderData } from '../imports/data/hoabinh-order-55479.data';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CashbookQueryDto,
  CashbookVoucherType,
  CreateCashbookVoucherDto,
  UpdateCashbookVoucherDto,
  UpdateOpeningBalanceDto,
} from './dto/cashbook.dto';

export interface CashbookChannelBreakdown {
  total: number;
  cash: number;
  card: number;
  transfer: number;
}

export interface CashbookSummaryReport {
  openingBalance: CashbookChannelBreakdown;
  totalIncome: CashbookChannelBreakdown;
  totalExpense: CashbookChannelBreakdown;
  closingBalance: CashbookChannelBreakdown;
  voucherCounts: {
    total: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export interface CashbookVoucherItem {
  id: string;
  voucherCode: string;
  transactionDate: string;
  type: CashbookVoucherType;
  category: string;
  content: string;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  totalAmount: number;
  partnerName: string; // Người nhận, Nộp
  staffName: string; // Người thu Chi
  importOrderId: number | null;
  externalPaymentId: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface PersistedCashbookState {
  openingBalance: CashbookChannelBreakdown;
  vouchers: CashbookVoucherItem[];
  updatedAt: string;
}

const KV_STORE_KEY = 'bonzstore_cashbook_clean_v1';

function createInitialOpeningBalance(): CashbookChannelBreakdown {
  return {
    cash: 0,
    card: 0,
    transfer: 0,
    total: 0,
  };
}

function createInitialVouchers(): CashbookVoucherItem[] {
  return [];
}

@Injectable()
export class CashbookService implements OnModuleInit {
  private openingBalance: CashbookChannelBreakdown =
    createInitialOpeningBalance();
  private vouchers: CashbookVoucherItem[] = createInitialVouchers();
  private initializedFromDb = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.ensureRestoredOnApiCall();
  }

  private assertCanManageCashbook(currentUser?: AuthenticatedUser): void {
    if (!currentUser) return;
    const roleCode = currentUser.role?.code || '';
    if (!ADMIN_MANAGER_ROLES.includes(roleCode as any)) {
      throw new ForbiddenException(
        'Chỉ quyền Admin (SUPER_ADMIN) và Quản lý (STORE_MANAGER) mới được phép lập phiếu, chỉnh sửa hoặc khôi phục sổ quỹ',
      );
    }
  }

  async ensureRestoredOnApiCall(): Promise<void> {
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
          Array<{ value: PersistedCashbookState }>
        >(`SELECT "value" FROM "app_kv_store" WHERE "key" = $1 LIMIT 1`, KV_STORE_KEY);

        if (rows && rows.length > 0 && rows[0].value) {
          const parsed = rows[0].value;
          if (parsed.openingBalance && Array.isArray(parsed.vouchers)) {
            this.openingBalance = parsed.openingBalance;
            this.vouchers = parsed.vouchers;
            this.initializedFromDb = true;
            return;
          }
        }

        this.openingBalance = createInitialOpeningBalance();
        this.vouchers = createInitialVouchers();
        this.initializedFromDb = true;
        await this.persistStateToDb();
      }
    } catch {
      // Non-blocking fallback
    }
  }

  private async ensureOrder55479VouchersPresent(): Promise<void> {
    return;
  }

  private async persistStateToDb(): Promise<void> {
    try {
      const payload: PersistedCashbookState = {
        openingBalance: this.openingBalance,
        vouchers: this.vouchers,
        updatedAt: new Date().toISOString(),
      };
      await this.prisma.client.$executeRawUnsafe(
        `
        INSERT INTO "app_kv_store" ("key", "value", "updated_at")
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT ("key")
        DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = NOW();
      `,
        KV_STORE_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // Ignore DB write error in read-only fallback
    }
  }

  /**
   * Đồng bộ tự động lịch sử thanh toán (PayOrderHistories) từ đơn hàng Hoà Bình Logistics sang Sổ Quỹ
   */
  async syncFromHoabinhOrder(
    order: HoabinhMainOrderData,
    actorName?: string,
  ): Promise<{ syncedCount: number; vouchers: CashbookVoucherItem[] }> {
    await this.ensureRestoredOnApiCall();

    const histories = Array.isArray(order.PayOrderHistories)
      ? order.PayOrderHistories
      : [];
    let syncedCount = 0;
    const syncedVouchers: CashbookVoucherItem[] = [];

    for (const pay of histories) {
      const voucherCode = `PC-HB${pay.Id}`;
      const isDeposit = pay.Status === 2 || pay.StatusName?.includes('Đặt cọc');
      const isWalletOrTransfer =
        pay.Type === 2 ||
        (pay.TypeName || '').toLowerCase().includes('ví') ||
        (pay.TypeName || '').toLowerCase().includes('chuyển khoản');

      const cashAmount = isWalletOrTransfer ? 0 : Number(pay.Amount || 0);
      const transferAmount = isWalletOrTransfer ? Number(pay.Amount || 0) : 0;
      const cardAmount = 0;
      const totalAmount = cashAmount + cardAmount + transferAmount;

      const category = isDeposit
        ? 'Đặt cọc nhập hàng 1688'
        : 'Tất toán & Cước vận chuyển TQ-VN';
      const content = isDeposit
        ? `Đặt cọc đơn hàng mua hộ #${order.Id} (${pay.StatusName}) — Shop ${order.ShopName || '1688'} (${order.Orders?.length || 0} mặt hàng)`
        : `Thanh toán tất toán đơn #${order.Id} (${pay.StatusName}) — Trọng lượng ${order.TQVNWeight || order.OrderWeight || 0}kg, Cước cân nặng ${(order.FeeWeight || 0).toLocaleString('vi-VN')}₫`;

      const partnerName = isDeposit
        ? `Hoà Bình Logistics (${pay.TypeName || 'Ví điện tử'} - Đơn #${order.Id})`
        : `Kho Hoà Bình Logistics (${pay.CreatedBy || order.ReceivedBy || 'KHOHN'} - Đơn #${order.Id})`;
      const staffName =
        actorName ||
        (pay.CreatedBy === 'tranbon1'
          ? 'tranbon1 (bon)'
          : `${order.UserName || 'tranbon1'} (${order.FullName || 'bon'})`);

      const existingIdx = this.vouchers.findIndex(
        (v) =>
          v.externalPaymentId === pay.Id || v.voucherCode === voucherCode,
      );

      const item: CashbookVoucherItem = {
        id:
          existingIdx >= 0
            ? this.vouchers[existingIdx].id
            : `cb-hb-${pay.Id}`,
        voucherCode,
        transactionDate: pay.Created || order.Created || new Date().toISOString(),
        type: 'EXPENSE',
        category,
        content,
        cashAmount,
        cardAmount,
        transferAmount,
        totalAmount,
        partnerName,
        staffName,
        importOrderId: order.Id,
        externalPaymentId: pay.Id,
        note: `Đồng bộ từ đơn nhập hàng #${order.Id} — Mã GD #${pay.Id} (${pay.TypeName})`,
        createdAt:
          existingIdx >= 0
            ? this.vouchers[existingIdx].createdAt
            : pay.Created || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        this.vouchers[existingIdx] = item;
      } else {
        this.vouchers.unshift(item);
      }

      syncedCount += 1;
      syncedVouchers.push(item);
    }

    await this.persistStateToDb();
    return { syncedCount, vouchers: syncedVouchers };
  }

  private filterVouchers(query?: CashbookQueryDto): CashbookVoucherItem[] {
    let list = [...this.vouchers];

    if (query?.type && query.type !== 'ALL') {
      list = list.filter((v) => v.type === query.type);
    }

    if (query?.category && query.category !== 'ALL') {
      list = list.filter((v) => v.category === query.category);
    }

    if (query?.paymentChannel && query.paymentChannel !== 'ALL') {
      if (query.paymentChannel === 'CASH') {
        list = list.filter((v) => v.cashAmount > 0);
      } else if (query.paymentChannel === 'CARD') {
        list = list.filter((v) => v.cardAmount > 0);
      } else if (query.paymentChannel === 'TRANSFER') {
        list = list.filter((v) => v.transferAmount > 0);
      }
    }

    if (query?.importOrderId) {
      const ordId = Number(query.importOrderId);
      if (!Number.isNaN(ordId)) {
        list = list.filter((v) => v.importOrderId === ordId);
      }
    }

    if (query?.startDate) {
      const startMs = new Date(query.startDate).getTime();
      if (!Number.isNaN(startMs)) {
        list = list.filter(
          (v) => new Date(v.transactionDate).getTime() >= startMs,
        );
      }
    }

    if (query?.endDate) {
      const endObj = new Date(query.endDate);
      endObj.setHours(23, 59, 59, 999);
      const endMs = endObj.getTime();
      if (!Number.isNaN(endMs)) {
        list = list.filter(
          (v) => new Date(v.transactionDate).getTime() <= endMs,
        );
      }
    }

    const q = trim(query?.search || '').toLowerCase();
    if (!isEmpty(q)) {
      list = list.filter(
        (v) =>
          v.voucherCode.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.content.toLowerCase().includes(q) ||
          v.partnerName.toLowerCase().includes(q) ||
          v.staffName.toLowerCase().includes(q) ||
          String(v.importOrderId || '').includes(q),
      );
    }

    return list;
  }

  private calculateSummaryForList(
    filteredVouchers: CashbookVoucherItem[],
  ): CashbookSummaryReport {
    let incomeCash = 0;
    let incomeCard = 0;
    let incomeTransfer = 0;
    let expenseCash = 0;
    let expenseCard = 0;
    let expenseTransfer = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const v of filteredVouchers) {
      if (v.type === 'INCOME') {
        incomeCount += 1;
        incomeCash += Number(v.cashAmount || 0);
        incomeCard += Number(v.cardAmount || 0);
        incomeTransfer += Number(v.transferAmount || 0);
      } else {
        expenseCount += 1;
        expenseCash += Number(v.cashAmount || 0);
        expenseCard += Number(v.cardAmount || 0);
        expenseTransfer += Number(v.transferAmount || 0);
      }
    }

    const totalIncome: CashbookChannelBreakdown = {
      cash: incomeCash,
      card: incomeCard,
      transfer: incomeTransfer,
      total: incomeCash + incomeCard + incomeTransfer,
    };

    const totalExpense: CashbookChannelBreakdown = {
      cash: expenseCash,
      card: expenseCard,
      transfer: expenseTransfer,
      total: expenseCash + expenseCard + expenseTransfer,
    };

    // Công thức chuẩn: Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi
    const closingCash =
      this.openingBalance.cash + totalIncome.cash - totalExpense.cash;
    const closingCard =
      this.openingBalance.card + totalIncome.card - totalExpense.card;
    const closingTransfer =
      this.openingBalance.transfer +
      totalIncome.transfer -
      totalExpense.transfer;
    const closingTotal =
      this.openingBalance.total + totalIncome.total - totalExpense.total;

    return {
      openingBalance: { ...this.openingBalance },
      totalIncome,
      totalExpense,
      closingBalance: {
        cash: closingCash,
        card: closingCard,
        transfer: closingTransfer,
        total: closingTotal,
      },
      voucherCounts: {
        total: filteredVouchers.length,
        incomeCount,
        expenseCount,
      },
    };
  }

  async findAll(query: CashbookQueryDto) {
    await this.ensureRestoredOnApiCall();

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const sortBy = query.sortBy || 'transactionDate';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const filtered = this.filterVouchers(query);
    const summary = this.calculateSummaryForList(filtered);

    filtered.sort((a, b) => {
      if (
        sortBy === 'totalAmount' ||
        sortBy === 'cashAmount' ||
        sortBy === 'cardAmount' ||
        sortBy === 'transferAmount'
      ) {
        return ((a as any)[sortBy] - (b as any)[sortBy]) * sortOrder;
      }
      if (sortBy === 'voucherCode' || sortBy === 'category') {
        return (
          String((a as any)[sortBy]).localeCompare(
            String((b as any)[sortBy]),
            'vi',
          ) * sortOrder
        );
      }
      const timeA = new Date(a.transactionDate).getTime();
      const timeB = new Date(b.transactionDate).getTime();
      return (timeA - timeB) * sortOrder;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    const categories = Array.from(
      new Set(this.vouchers.map((v) => v.category)),
    );

    return {
      data,
      summary,
      categories,
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async getSummary(query?: CashbookQueryDto): Promise<CashbookSummaryReport> {
    await this.ensureRestoredOnApiCall();
    const filtered = this.filterVouchers(query);
    return this.calculateSummaryForList(filtered);
  }

  async createVoucher(
    dto: CreateCashbookVoucherDto,
    currentUser?: AuthenticatedUser,
  ) {
    await this.ensureRestoredOnApiCall();
    this.assertCanManageCashbook(currentUser);

    const cashAmount = Math.max(0, Number(dto.cashAmount || 0));
    const cardAmount = Math.max(0, Number(dto.cardAmount || 0));
    const transferAmount = Math.max(0, Number(dto.transferAmount || 0));
    const totalAmount = cashAmount + cardAmount + transferAmount;

    if (totalAmount <= 0) {
      throw new BadRequestException(
        'Tổng số tiền (Tiền mặt + Thẻ + Chuyển khoản) phải lớn hơn 0₫',
      );
    }

    const prefix = dto.type === 'INCOME' ? 'PT' : 'PC';
    const rawCode = trim(dto.voucherCode || '');
    const voucherCode =
      rawCode.length > 0
        ? rawCode.toUpperCase()
        : `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
            this.vouchers.length + 1,
          ).padStart(3, '0')}`;

    if (
      this.vouchers.some(
        (v) => v.voucherCode.toLowerCase() === voucherCode.toLowerCase(),
      )
    ) {
      throw new BadRequestException(
        `Mã phiếu "${voucherCode}" đã tồn tại trong Sổ quỹ`,
      );
    }

    const now = new Date().toISOString();
    const newVoucher: CashbookVoucherItem = {
      id: `cb-${randomUUID().slice(0, 8)}`,
      voucherCode,
      transactionDate: dto.transactionDate || now,
      type: dto.type,
      category: trim(dto.category),
      content: trim(dto.content),
      cashAmount,
      cardAmount,
      transferAmount,
      totalAmount,
      partnerName: trim(dto.partnerName),
      staffName:
        trim(dto.staffName || '') ||
        currentUser?.fullName ||
        currentUser?.email ||
        'Admin BonzStore',
      importOrderId: dto.importOrderId ?? null,
      externalPaymentId: null,
      note: trim(dto.note || ''),
      createdAt: now,
      updatedAt: now,
    };

    this.vouchers.unshift(newVoucher);
    await this.persistStateToDb();

    this.notificationsService.recordCrudEvent({
      module: 'PRODUCTS',
      action: 'CREATE',
      titleVi:
        dto.type === 'INCOME'
          ? 'Lập Phiếu Thu sổ quỹ mới'
          : 'Lập Phiếu Chi sổ quỹ mới',
      titleEn:
        dto.type === 'INCOME'
          ? 'New Cashbook Receipt Created'
          : 'New Cashbook Payment Created',
      messageVi: `Đã lập ${dto.type === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi'} ${voucherCode} (${totalAmount.toLocaleString('vi-VN')}₫) — ${newVoucher.content}.`,
      messageEn: `Created ${dto.type} voucher ${voucherCode} (${totalAmount.toLocaleString('vi-VN')} VND).`,
      targetName: voucherCode,
      targetLink: '/cashbook',
      currentUser,
    });

    return {
      voucher: newVoucher,
      summary: this.calculateSummaryForList(this.vouchers),
    };
  }

  async updateVoucher(
    id: string,
    dto: UpdateCashbookVoucherDto,
    currentUser?: AuthenticatedUser,
  ) {
    await this.ensureRestoredOnApiCall();
    this.assertCanManageCashbook(currentUser);

    const idx = this.vouchers.findIndex((v) => v.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Không tìm thấy phiếu sổ quỹ (id: ${id})`);
    }

    const existing = this.vouchers[idx];
    const cashAmount =
      dto.cashAmount !== undefined
        ? Math.max(0, Number(dto.cashAmount))
        : existing.cashAmount;
    const cardAmount =
      dto.cardAmount !== undefined
        ? Math.max(0, Number(dto.cardAmount))
        : existing.cardAmount;
    const transferAmount =
      dto.transferAmount !== undefined
        ? Math.max(0, Number(dto.transferAmount))
        : existing.transferAmount;
    const totalAmount = cashAmount + cardAmount + transferAmount;

    if (totalAmount <= 0) {
      throw new BadRequestException(
        'Tổng số tiền (Tiền mặt + Thẻ + Chuyển khoản) phải lớn hơn 0₫',
      );
    }

    const updated: CashbookVoucherItem = {
      ...existing,
      type: dto.type ?? existing.type,
      voucherCode: dto.voucherCode
        ? trim(dto.voucherCode).toUpperCase()
        : existing.voucherCode,
      transactionDate: dto.transactionDate ?? existing.transactionDate,
      category: dto.category ? trim(dto.category) : existing.category,
      content: dto.content ? trim(dto.content) : existing.content,
      cashAmount,
      cardAmount,
      transferAmount,
      totalAmount,
      partnerName: dto.partnerName
        ? trim(dto.partnerName)
        : existing.partnerName,
      staffName: dto.staffName ? trim(dto.staffName) : existing.staffName,
      importOrderId:
        dto.importOrderId !== undefined
          ? dto.importOrderId
          : existing.importOrderId,
      note: dto.note !== undefined ? trim(dto.note) : existing.note,
      updatedAt: new Date().toISOString(),
    };

    this.vouchers[idx] = updated;
    await this.persistStateToDb();

    return {
      voucher: updated,
      summary: this.calculateSummaryForList(this.vouchers),
    };
  }

  async deleteVoucher(id: string, currentUser?: AuthenticatedUser) {
    await this.ensureRestoredOnApiCall();
    this.assertCanManageCashbook(currentUser);

    const idx = this.vouchers.findIndex((v) => v.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Không tìm thấy phiếu sổ quỹ (id: ${id})`);
    }

    const removed = this.vouchers[idx];
    this.vouchers.splice(idx, 1);
    await this.persistStateToDb();

    return {
      deletedId: id,
      voucherCode: removed.voucherCode,
      summary: this.calculateSummaryForList(this.vouchers),
    };
  }

  async updateOpeningBalance(
    dto: UpdateOpeningBalanceDto,
    currentUser?: AuthenticatedUser,
  ) {
    await this.ensureRestoredOnApiCall();
    this.assertCanManageCashbook(currentUser);

    const cash = Math.max(0, Number(dto.cash || 0));
    const card = Math.max(0, Number(dto.card || 0));
    const transfer = Math.max(0, Number(dto.transfer || 0));

    this.openingBalance = {
      cash,
      card,
      transfer,
      total: cash + card + transfer,
    };

    await this.persistStateToDb();
    return this.calculateSummaryForList(this.vouchers);
  }

  async restoreDefaultData(currentUser?: AuthenticatedUser) {
    this.assertCanManageCashbook(currentUser);

    this.openingBalance = createInitialOpeningBalance();
    this.vouchers = createInitialVouchers();
    this.initializedFromDb = true;
    await this.persistStateToDb();

    return {
      restored: true,
      message:
        'Đã khôi phục (Restore) toàn bộ dữ liệu Sổ Quỹ và các phiếu thanh toán của đơn nhập hàng #55479',
      summary: this.calculateSummaryForList(this.vouchers),
      totalVouchers: this.vouchers.length,
    };
  }

  /**
   * Trả về dữ liệu tổng hợp cho Trang Biểu Đồ (/charts)
   */
  async getChartsAnalytics() {
    await this.ensureRestoredOnApiCall();

    const summary = this.calculateSummaryForList(this.vouchers);

    // 1. Nhóm theo ngày (Time-series) để vẽ biểu đồ xu hướng Thu - Chi - Tồn quỹ
    const dateMap = new Map<
      string,
      {
        date: string;
        income: number;
        expense: number;
        incomeCash: number;
        incomeCard: number;
        incomeTransfer: number;
        expenseCash: number;
        expenseCard: number;
        expenseTransfer: number;
        voucherCount: number;
      }
    >();

    const sortedChronological = [...this.vouchers].sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime(),
    );

    for (const v of sortedChronological) {
      const dayKey = v.transactionDate.slice(0, 10);
      const curr = dateMap.get(dayKey) || {
        date: dayKey,
        income: 0,
        expense: 0,
        incomeCash: 0,
        incomeCard: 0,
        incomeTransfer: 0,
        expenseCash: 0,
        expenseCard: 0,
        expenseTransfer: 0,
        voucherCount: 0,
      };

      if (v.type === 'INCOME') {
        curr.income += v.totalAmount;
        curr.incomeCash += v.cashAmount;
        curr.incomeCard += v.cardAmount;
        curr.incomeTransfer += v.transferAmount;
      } else {
        curr.expense += v.totalAmount;
        curr.expenseCash += v.cashAmount;
        curr.expenseCard += v.cardAmount;
        curr.expenseTransfer += v.transferAmount;
      }
      curr.voucherCount += 1;
      dateMap.set(dayKey, curr);
    }

    let runningBalance = this.openingBalance.total;
    const timelineSeries = Array.from(dateMap.values()).map((point) => {
      runningBalance = runningBalance + point.income - point.expense;
      return {
        ...point,
        netFlow: point.income - point.expense,
        closingBalance: runningBalance,
      };
    });

    // 2. Nhóm theo Danh mục (Category breakdown)
    const incomeCategoryMap = new Map<string, number>();
    const expenseCategoryMap = new Map<string, number>();

    for (const v of this.vouchers) {
      if (v.type === 'INCOME') {
        incomeCategoryMap.set(
          v.category,
          (incomeCategoryMap.get(v.category) || 0) + v.totalAmount,
        );
      } else {
        expenseCategoryMap.set(
          v.category,
          (expenseCategoryMap.get(v.category) || 0) + v.totalAmount,
        );
      }
    }

    const incomeByCategory = Array.from(incomeCategoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          summary.totalIncome.total > 0
            ? Number(((amount / summary.totalIncome.total) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const expenseByCategory = Array.from(expenseCategoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          summary.totalExpense.total > 0
            ? Number(((amount / summary.totalExpense.total) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      summary,
      timelineSeries,
      paymentChannels: [
        {
          channel: 'CASH',
          labelVi: 'Tiền mặt',
          labelEn: 'Cash',
          opening: summary.openingBalance.cash,
          income: summary.totalIncome.cash,
          expense: summary.totalExpense.cash,
          closing: summary.closingBalance.cash,
        },
        {
          channel: 'CARD',
          labelVi: 'Thẻ (POS / Visa)',
          labelEn: 'Card (POS / Visa)',
          opening: summary.openingBalance.card,
          income: summary.totalIncome.card,
          expense: summary.totalExpense.card,
          closing: summary.closingBalance.card,
        },
        {
          channel: 'TRANSFER',
          labelVi: 'Chuyển khoản / Ví điện tử',
          labelEn: 'Bank Transfer / E-Wallet',
          opening: summary.openingBalance.transfer,
          income: summary.totalIncome.transfer,
          expense: summary.totalExpense.transfer,
          closing: summary.closingBalance.transfer,
        },
      ],
      incomeByCategory,
      expenseByCategory,
      order55479Analytics: {
        orderId: 0,
        shopName: 'Chưa có dữ liệu đơn nhập',
        site: '',
        exchangeRate: 0,
        totalPriceCNY: 0,
        productCostVND: 0,
        buyingFeeVND: 0,
        weightFeeVND: 0,
        totalImportCostVND: 0,
        depositPaidVND: 0,
        finalPaymentVND: 0,
        totalWeightKg: 0,
        totalQuantity: 0,
        recordedRevenueVND: summary.totalIncome.total,
        recordedExpenseVND: summary.totalExpense.total,
        netProfitToDateVND:
          summary.totalIncome.total - summary.totalExpense.total,
        costBreakdown: [],
        packagesBreakdown: [],
        itemsBreakdown: [],
      },
    };
  }
}

