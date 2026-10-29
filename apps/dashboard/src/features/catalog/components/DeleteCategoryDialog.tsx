import { AlertTriangle, Trash2 } from 'lucide-react';
import { CategoryItem } from '../../../api/types/catalog.types';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useI18n } from '../../i18n/I18nContext';
import { useDeleteCategory } from '../hooks/useCatalog';

export interface DeleteCategoryDialogProps {
  category: CategoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const { t } = useI18n();
  const deleteMutation = useDeleteCategory();

  if (!category) return null;

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(category.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{t('categories.deleteModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <p className="text-sm font-medium text-foreground">
            {t('categories.deleteConfirmText', { name: category.localName })}
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
            <p className="font-semibold text-foreground">
              {category.level > 1 ? '↳ ' : ''}
              {category.localName}
            </p>
            <p className="mt-1 text-muted-foreground">
              {t('categories.idPrefix')}{' '}
              <span className="text-foreground">
                {category.externalCategoryId || category.id.slice(0, 6)}
              </span>{' '}
              • {t('categories.parentIdPrefix')}{' '}
              <span className="text-foreground">
                {category.externalParentId || '0'}
              </span>
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {t('categories.colProducts')}: {category.productCount} •{' '}
              {t('categories.childrenCountBadge', {
                count: category.childrenCount || 0,
              })}
            </p>
          </div>

          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-300">
            {t('categories.deleteNotice')}
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('app.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleConfirmDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('categories.deleteBtn')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

