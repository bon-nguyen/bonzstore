import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../features/auth/context/AuthContext';
import {
  useCashbookVouchers,
  useRestoreCashbookData,
} from '../features/cashbook/hooks/useCashbook';
import { useI18n } from '../features/i18n/I18nContext';
import {
  useImportOrders,
  useRestoreImportsData,
} from '../features/imports/hooks/useImports';
import { useRoles } from '../features/roles/hooks/useRoles';
import { PageHeader } from '../features/shared/PageHeader';
import { PageSectionContainer } from '../features/shared/PageSectionContainer';
import { StatCard } from '../features/shared/StatCard';
import { StatusBadge } from '../features/shared/StatusBadge';
import { useUserStats } from '../features/users/hooks/useUsers';

function formatVND(amount: number | undefined | null): string {
  const num = Number(amount || 0);
  return `${num.toLocaleString('vi-VN')} ₫`;
}

export function DashboardHomePage() {
  const { user } = useAuthContext();
  const { t } = useI18n();
  const { data: userStats } = useUserStats();
  const { data: roles } = useRoles();
  const { data: importsData } = useImportOrders({ page: 1, limit: 5 });
  const { data: cashbookData } = useCashbookVouchers({ page: 1, limit: 5 });
  const restoreImportMutation = useRestoreImportsData();
  const restoreCashbookMutation = useRestoreCashbookData();

  const importStats = importsData?.stats;
  const cashbookSummary = cashbookData?.summary;

  const handleQuickRestoreAll = async () => {
    await Promise.all([
      restoreImportMutation.mutateAsync(),
      restoreCashbookMutation.mutateAsync(),
    ]);
  };

  return (
    <div className="page-container">
      <PageHeader
        subtitle={t('home.subtitle')}
        title={`${t('home.welcome')}, ${user?.fullName || 'Admin'}`}
        badge={user?.role?.code || 'ADMIN'}
        description={t('home.desc')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/imports" className="action-btn-primary">
              <Truck className="h-4 w-4" />
              <span>Nhập hàng (#55479)</span>
            </Link>
            <Link to="/cashbook" className="action-btn-secondary">
              <Wallet className="h-4 w-4" />
              <span>Sổ Quỹ Thu/Chi</span>
            </Link>
            <Link to="/charts" className="action-btn-secondary">
              <BarChart3 className="h-4 w-4" />
              <span>Biểu đồ</span>
            </Link>
            <Link to="/roles" className="action-btn-secondary">
              <KeyRound className="h-4 w-4" />
              <span>{t('home.configRbac')}</span>
            </Link>
          </div>
        }
      />

      {/* Section Mới: Trung tâm Nhập Hàng Hoà Bình Logistics (#55479), Sổ Quỹ & Biểu Đồ */}
      <PageSectionContainer
        title="Phân hệ Nhập hàng Logistics (#55479), Sổ Quỹ & Biểu Đồ"
        subBadge="Hoà Bình Logistics API • Sổ Quỹ 3 Kênh • Biểu Đồ Trực Quan"
        description="Quy trình 3 bước Open Tabs Login → Lấy Token → Lấy Chi Tiết Đơn #55479, tự động đồng bộ Sản phẩm (/products), Sổ Quỹ (/cashbook) và Biểu đồ (/charts) kèm Auto-Restore khi gọi API"
        icon={Truck}
        headerRight={
          <button
            type="button"
            onClick={handleQuickRestoreAll}
            disabled={
              restoreImportMutation.isPending ||
              restoreCashbookMutation.isPending
            }
            className="action-btn-secondary"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                restoreImportMutation.isPending ||
                restoreCashbookMutation.isPending
                  ? 'animate-spin'
                  : ''
              }`}
            />
            <span>Restore Data #55479</span>
          </button>
        }
        bodyClassName="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Nhập hàng #55479 */}
          <div className="stat-card flex flex-col justify-between border-primary/30 bg-primary/5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1 font-mono text-xs font-bold text-foreground dark:text-primary">
                  <Truck className="h-3.5 w-3.5" />
                  Đơn #55479 • Đã hoàn thành
                </span>
                <a
                  href="https://hoabinhlogistics.com/api/main-order/55479"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <span>API</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-foreground">
                1. Nhập hàng Hoà Bình Logistics
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Open Tabs Login → Lấy Bearer Token → Lấy chi tiết đơn{' '}
                <code className="font-mono font-semibold">#55479</code> (3 mặt
                hàng 1688 • {importStats?.totalItemsQuantity ?? 50} sp •{' '}
                {importStats?.totalWeightKg ?? 34.04} kg / 4 kiện vận đơn).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-background/70 p-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Tổng tiền đơn:</span>
                  <p className="font-mono font-bold text-foreground">
                    {formatVND(importStats?.totalImportValueVND ?? 9844276)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Đã thanh toán:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(importStats?.totalDepositPaidVND ?? 9844276)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[11px] text-muted-foreground">
                Tự động đồng bộ sang <code className="font-mono">/products</code>
              </span>
              <Link
                to="/imports"
                className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-foreground hover:text-primary dark:text-primary"
              >
                <span>Mở Nhập hàng</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Sổ quỹ */}
          <div className="stat-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Sổ Quỹ Đa Kênh
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Tiền mặt • Thẻ • CK
                </span>
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-foreground">
                2. Quản lý Sổ Quỹ Thu / Chi
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Bảng 10 cột chuẩn kế toán, 4 thẻ Đầu kỳ / Tổng thu / Tổng chi /
                Cuối kỳ tách theo Tiền mặt, Thẻ, Chuyển khoản và Lập Phiếu Thu /
                Phiếu Chi.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Tổng thu kỳ này:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatVND(cashbookSummary?.totalIncome.total ?? 33140000)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tồn quỹ cuối kỳ:</span>
                  <p className="font-mono font-bold text-foreground">
                    {formatVND(
                      cashbookSummary?.closingBalance.total ?? 47165724,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[11px] text-muted-foreground">
                Khớp phiếu chi cọc & tất toán #55479
              </span>
              <Link
                to="/cashbook"
                className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-foreground hover:text-primary dark:text-primary"
              >
                <span>Mở Sổ Quỹ</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Biểu đồ */}
          <div className="stat-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-2.5 py-1 font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics & Charts
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Real-time Sync
                </span>
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-foreground">
                3. Biểu Đồ Dòng Tiền & Nhập Hàng
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Trực quan hoá xu hướng Thu/Chi theo ngày, tỷ trọng Tiền mặt /
                Thẻ / Chuyển khoản, cơ cấu chi phí và trọng lượng 4 kiện hàng
                đơn #55479.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Kiện hàng về VN:</span>
                  <p className="font-mono font-bold text-foreground">
                    {importStats?.totalSmallPackages ?? 4} kiện (
                    {importStats?.totalWeightKg ?? 34.04} kg)
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">SP đồng bộ kho:</span>
                  <p className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    3 SKU • 50 đơn vị
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Package className="h-3 w-3" />
                <span>Xem Sản phẩm</span>
              </Link>
              <Link
                to="/charts"
                className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-foreground hover:text-primary dark:text-primary"
              >
                <span>Mở Biểu Đồ</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </PageSectionContainer>

      {/* Section 1: Thống kê tổng quan nhân sự & phân quyền */}
      <PageSectionContainer
        title="Tổng quan Chỉ số Hệ thống"
        subBadge="System KPIs & RBAC Overview"
        description="Theo dõi số lượng tài khoản hoạt động, đội ngũ quản trị và cấu trúc vai trò hiện hành"
        icon={Activity}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t('home.totalUsers')}
            value={userStats?.total ?? '—'}
            icon={Users}
          />
          <StatCard
            label={t('home.activeUsers')}
            value={userStats?.active ?? '—'}
            icon={CheckCircle2}
            highlight
          />
          <StatCard
            label={t('home.adminStaff')}
            value={userStats?.adminUsers ?? '—'}
            icon={ShieldCheck}
          />
          <StatCard
            label={t('home.totalRoles')}
            value={roles?.length ?? '—'}
            icon={Lock}
          />
        </div>
      </PageSectionContainer>

      {/* Section 2: Thông tin phiên đăng nhập & quyền hạn được cấp */}
      <PageSectionContainer
        title={t('home.sessionTitle')}
        subBadge="Active Session & Permissions"
        description={t('home.sessionSub')}
        icon={ShieldCheck}
        headerRight={<StatusBadge status={user?.status || 'ACTIVE'} />}
        bodyClassName="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-xs text-muted-foreground">Email:</span>
            <p className="mt-0.5 font-mono font-medium">{user?.email}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.roleLabel')}
            </span>
            <p className="mt-0.5 font-semibold text-foreground dark:text-primary">
              {user?.role?.name} ({user?.role?.code})
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {t('home.portalLabel')}
            </span>
            <p className="mt-0.5 font-medium">
              {user?.role?.isAdminPanel
                ? t('home.portalAllowed')
                : t('home.portalRestricted')}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('home.grantedPerms')} ({user?.permissions?.length || 0}):
          </p>
          <div className="flex flex-wrap gap-2">
            {user?.permissions?.map((code) => (
              <span
                key={code}
                className="status-badge status-active font-mono text-xs"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </PageSectionContainer>
    </div>
  );
}
