import { FolderTree } from 'lucide-react';
import { FormEvent, useState } from 'react';
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
import { useCreateCategory } from '../hooks/useCatalog';

export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryItem[];
}

const INITIAL_CATEGORY_STATE = {
  localName: '',
  externalCategoryId: '',
  parentId: '',
  isLeaf: true,
};

export function CreateCategoryDialog({
  open,
  onOpenChange,
  categories,
}: CreateCategoryDialogProps) {
  const { t } = useI18n();
  const createMutation = useCreateCategory();
  const [formState, setFormState] = useState(INITIAL_CATEGORY_STATE);

  const parentCandidates = categories.filter((c) => !c.isLeaf);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      localName: formState.localName,
      externalCategoryId: formState.externalCategoryId || undefined,
      parentId: formState.parentId || undefined,
      isLeaf: formState.isLeaf,
    });
    onOpenChange(false);
    setFormState(INITIAL_CATEGORY_STATE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-foreground dark:text-primary" />
            <span>{t('categories.addBtn')}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label={t('categories.localNameLabel')} required>
            <Input
              type="text"
              required
              placeholder="VD: Mô hình Nendoroid / Gunpla"
              value={formState.localName}
              onChange={(e) =>
                setFormState({ ...formState, localName: e.target.value })
              }
            />
          </FormField>

          <FormField label={t('categories.externalIdLabel')}>
            <Input
              type="text"
              placeholder="VD: 605088"
              value={formState.externalCategoryId}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  externalCategoryId: e.target.value,
                })
              }
            />
          </FormField>

          <FormField label={t('categories.parentLabel')}>
            <Select
              value={formState.parentId}
              onChange={(e) =>
                setFormState({ ...formState, parentId: e.target.value })
              }
              placeholder={t('categories.rootOption')}
              options={parentCandidates.map((c) => ({
                value: c.id,
                label: `${c.localName} (${c.externalCategoryId})`,
              }))}
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-xs font-medium">
              {t('categories.isLeafLabel')}
            </span>
            <Switch
              checked={formState.isLeaf}
              onCheckedChange={(checked) =>
                setFormState({ ...formState, isLeaf: checked })
              }
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
            <Button type="submit" disabled={createMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
