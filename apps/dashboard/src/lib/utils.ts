import { clsx, type ClassValue } from 'clsx';
import { get, isEmpty, isNil, omitBy, trim } from 'lodash';
import { twMerge } from 'tailwind-merge';
import { ROLE_RANK, ROLES } from '../constants/rbac.constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Đã xảy ra lỗi không xác định',
): string {
  if (error instanceof Error && !isEmpty(trim(error.message))) {
    return error.message;
  }
  const msg = get<string | undefined>(error, 'message', undefined);
  if (typeof msg === 'string' && !isEmpty(trim(msg))) {
    return msg;
  }
  return fallback;
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRoleRank(roleCode?: string | null): number {
  if (!roleCode || isEmpty(trim(roleCode))) return 0;
  return ROLE_RANK[roleCode] ?? 30;
}

/**
 * Kiểm tra xem người dùng hiện tại (actorRoleCode) có được phép thao tác trên tài khoản có targetRoleCode hay không.
 * - Chỉ SUPER_ADMIN mới có quyền thao tác trên mọi tài khoản.
 * - Các Role thấp hơn (VD: STORE_MANAGER) bị chặn thao tác trên SUPER_ADMIN hoặc Role cao hơn mình.
 */
export function canActorManageRole(
  actorRoleCode?: string | null,
  targetRoleCode?: string | null,
): boolean {
  if (actorRoleCode === ROLES.SUPER_ADMIN) return true;
  if (targetRoleCode === ROLES.SUPER_ADMIN) return false;
  return getRoleRank(actorRoleCode) >= getRoleRank(targetRoleCode);
}

/**
 * Kiểm tra xem một vai trò (roleCode) có được phép chọn khi Tạo mới hoặc Đổi vai trò cho user hay không.
 * - Quy tắc: Vai trò SUPER_ADMIN là DUY NHẤT trong hệ thống nên KHÔNG BAO GIỜ xuất hiện trong danh sách gán thêm.
 */
export function canActorAssignRole(
  actorRoleCode?: string | null,
  roleToAssign?: string | null,
): boolean {
  if (!roleToAssign || roleToAssign === ROLES.SUPER_ADMIN) return false;
  if (actorRoleCode === ROLES.SUPER_ADMIN) return true;
  return getRoleRank(actorRoleCode) >= getRoleRank(roleToAssign);
}

/**
 * Làm sạch object query params bằng lodash (loại bỏ giá trị rỗng, null, undefined hoặc mặc định)
 */
export function buildCleanSearchParams(
  params: Record<string, string | number | undefined | null>,
  defaults: Record<string, string | number> = {},
): Record<string, string> {
  const cleaned = omitBy(params, (val, key) => {
    if (isNil(val)) return true;
    const strVal = trim(String(val));
    if (isEmpty(strVal)) return true;
    if (defaults[key] !== undefined && String(defaults[key]) === strVal) {
      return true;
    }
    return false;
  });

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(cleaned)) {
    if (!isNil(value)) {
      result[key] = trim(String(value));
    }
  }
  return result;
}
