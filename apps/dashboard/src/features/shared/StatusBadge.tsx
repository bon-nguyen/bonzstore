import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const STATUS_CONFIG: Record<string, { className: string; text: string }> = {
  ACTIVE: { className: 'status-active', text: 'Hoạt động' },
  MAINTENANCE: { className: 'status-maintenance', text: 'Bảo trì' },
  INACTIVE: { className: 'status-inactive', text: 'Ngừng hoạt động' },
  LOCKED: { className: 'status-inactive', text: 'Đã khóa' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || 'INACTIVE';
  const config = STATUS_CONFIG[normalized] || {
    className: 'status-inactive',
    text: status,
  };

  return (
    <span className={cn('status-badge', config.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || config.text}
    </span>
  );
}

