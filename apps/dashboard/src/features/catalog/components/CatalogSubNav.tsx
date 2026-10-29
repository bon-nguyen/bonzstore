import { FolderTree, Package, Tags } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';

export interface CatalogSubNavProps {
  productCount?: number;
  categoryCount?: number;
  tagCount?: number;
}

export function CatalogSubNav({
  productCount,
  categoryCount,
  tagCount,
}: CatalogSubNavProps) {
  const { t } = useI18n();

  const items = [
    {
      to: '/products',
      label: t('nav.products'),
      icon: Package,
      count: productCount,
    },
    {
      to: '/categories',
      label: t('nav.categories'),
      icon: FolderTree,
      count: categoryCount,
    },
    {
      to: '/tags',
      label: t('nav.tags'),
      icon: Tags,
      count: tagCount,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
      <span className="px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t('nav.productsGroup')}:
      </span>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
            {typeof item.count === 'number' ? (
              <span className="rounded-full bg-background/25 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                {item.count}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </div>
  );
}

