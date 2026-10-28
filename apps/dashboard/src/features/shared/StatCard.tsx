import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn('stat-card flex items-center justify-between', className)}
    >
      <div>
        <p className="font-display text-xs font-bold uppercase text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            'mt-1 font-display text-2xl font-bold',
            highlight ? 'text-foreground dark:text-primary' : 'text-foreground',
          )}
        >
          {value}
        </p>
      </div>
      <div className="stat-card-icon">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

