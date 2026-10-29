import { isEmpty, trim } from 'lodash';
import { AlertTriangle, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { ProductTagSummary } from '../../../api/types/catalog.types';
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
import { useI18n } from '../../i18n/I18nContext';
import {
  useCreateOrAttachTag,
  useDeleteProductTag,
  useRenameProductTag,
} from '../hooks/useCatalog';

export interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTagDialog({ open, onOpenChange }: CreateTagDialogProps) {
  const { t } = useI18n();
  const createTagMutation = useCreateOrAttachTag();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = trim(name);
    if (isEmpty(cleaned)) return;
    await createTagMutation.mutateAsync({ name: cleaned });
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-foreground dark:text-primary" />
            <span>{t('tags.createModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField label={t('tags.tagNameLabel')} required>
            <Input
              type="text"
              required
              autoFocus
              placeholder={t('tags.inputPlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createTagMutation.isPending || isEmpty(trim(name))}
            >
              <Plus className="h-4 w-4" />
              <span>{t('app.save')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface EditTagDialogProps {
  tag: ProductTagSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTagDialog({ tag, open, onOpenChange }: EditTagDialogProps) {
  const { t } = useI18n();
  const renameTagMutation = useRenameProductTag();
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (tag && open) {
      setNewName(tag.name);
    }
  }, [tag, open]);

  if (!tag) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = trim(newName);
    if (isEmpty(cleaned) || cleaned === tag.name) {
      onOpenChange(false);
      return;
    }
    await renameTagMutation.mutateAsync({
      name: tag.name,
      newName: cleaned,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-foreground dark:text-primary" />
            <span>{t('tags.editModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField label={t('tags.newTagNameLabel')} required>
            <Input
              type="text"
              required
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </FormField>

          <p className="rounded-lg border border-border bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {t('tags.editNotice', { name: tag.name, count: tag.count })}
          </p>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={renameTagMutation.isPending || isEmpty(trim(newName))}
            >
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface DeleteTagDialogProps {
  tag: ProductTagSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTagDialog({
  tag,
  open,
  onOpenChange,
}: DeleteTagDialogProps) {
  const { t } = useI18n();
  const deleteTagMutation = useDeleteProductTag();

  if (!tag) return null;

  const handleConfirmDelete = async () => {
    await deleteTagMutation.mutateAsync(tag.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{t('tags.deleteModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <p className="text-sm font-medium text-foreground">
            {t('tags.deleteConfirmText', { name: tag.name })}
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground dark:text-primary">
                <Tag className="h-3.5 w-3.5" />
                <span>{tag.name}</span>
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              {t('tags.colCount')}:{' '}
              <span className="font-semibold text-foreground">
                {t('tags.productCountUnit', { count: tag.count })}
              </span>
            </p>
          </div>

          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-300">
            {t('tags.deleteNotice', { name: tag.name, count: tag.count })}
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
            disabled={deleteTagMutation.isPending}
            onClick={handleConfirmDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('tags.deleteBtn')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

