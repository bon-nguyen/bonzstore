import { FolderEdit } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { CategoryItem } from '../../../api/types/catalog.types';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { FormField } from '../../../components/ui/form-field';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateCategory } from '../hooks/useCatalog';

export interface EditCategoryDialogProps {
  category: CategoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryItem[];
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  categories,
}: EditCategoryDialogProps) {
  const { t } = useI18n();
  const updateMutation = useUpdateCategory();

  const [localName, setLocalName] = useState('');
  const [externalCategoryId, setExternalCategoryId] = useState('');
  const [parentId, setParentId] = useState('');
  const [isLeaf, setIsLeaf] = useState(true);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (category && open) {
      setLocalName(category.localName || '');
      setExternalCategoryId(category.externalCategoryId || '');
      setParentId(category.parentId || '');
      setIsLeaf(category.isLeaf);
      setStatus(category.status || 'ACTIVE');
    }
  }, [category, open]);

  if (!category) return null;

  // Chỉ cho phép chọn các danh mục cấp 1 (hoặc không phải chính nó / không phải con của nó) làm danh mục cha
  const parentCandidates = categories.filter(
    (c) => c.id !== category.id && c.parentId !== category.id && c.level === 1,
  );

  const hasChildren = (category.childrenCount || 0) > 0;

  const statusOptions = [
    { value: 'ACTIVE', label: `ACTIVE (${t('status.ACTIVE')})` },
    { value: 'INACTIVE', label: `INACTIVE (${t('status.INACTIVE')})` },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: category.id,
      data: {
        localName: localName.trim(),
        externalCategoryId: externalCategoryId.trim() || undefined,
        parentId: parentId || null,
        isLeaf: hasChildren ? false : isLeaf,
        status,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderEdit className="h-5 w-5 text-foreground dark:text-primary" />
            <span>{t('categories.editModalTitle')}</span>
          </DialogTitle>
          <p className="font-mono text-xs text-muted-foreground">
            cipher: TTP_VN_CAT_ASSET_
            {category.externalCategoryId || category.id.slice(0, 6)}_202405
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField label={t('categories.localNameLabel')} required>
            <Input
              type="text"
              required
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </FormField>

          <FormField label={t('categories.externalIdLabel')}>
            <Input
              type="text"
              placeholder="VD: 607019"
              value={externalCategoryId}
              onChange={(e) => setExternalCategoryId(e.target.value)}
            />
          </FormField>

          <FormField label={t('categories.parentLabel')}>
            <Select
              value={parentId}
              onChange={(e) => {
                const nextParent = e.target.value;
                setParentId(nextParent);
                if (nextParent && !hasChildren) {
                  setIsLeaf(true);
                }
              }}
              placeholder={t('categories.rootOption')}
              options={parentCandidates.map((c) => ({
                value: c.id,
                label: `${c.localName} (id: ${c.externalCategoryId || c.id.slice(0, 6)})`,
              }))}
              disabled={hasChildren}
            />
          </FormField>

          <FormField label={t('categories.statusLabel')}>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')
              }
              options={statusOptions}
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <span className="text-xs font-medium">
                {t('categories.isLeafLabel')}
              </span>
              {hasChildren ? (
                <p className="text-[11px] text-muted-foreground">
                  {t('categories.childrenCountBadge', {
                    count: category.childrenCount,
                  })}
                </p>
              ) : null}
            </div>
            <Switch
              checked={hasChildren ? false : isLeaf}
              disabled={hasChildren}
              onCheckedChange={(checked) => setIsLeaf(checked)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

