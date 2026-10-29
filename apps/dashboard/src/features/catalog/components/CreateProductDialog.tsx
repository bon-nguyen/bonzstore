import { FormEvent, useState } from 'react';
import {
  CategoryItem,
  ProductStatus,
} from '../../../api/types/catalog.types';
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
import { useI18n } from '../../i18n/I18nContext';
import { useCreateProduct } from '../hooks/useCatalog';

export interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leafCategories: CategoryItem[];
}

const INITIAL_PRODUCT_STATE = {
  title: '',
  categoryId: '',
  brandName: 'Good Smile Company',
  sellerSku: 'HXH002-NEW-01',
  originalPrice: 299000,
  salePrice: 224250,
  stockQuantity: 30,
  status: 'ACTIVE' as ProductStatus,
  tagsInput: 'Best Seller, Chibi Q-Ver',
};

export function CreateProductDialog({
  open,
  onOpenChange,
  leafCategories,
}: CreateProductDialogProps) {
  const { t } = useI18n();
  const createMutation = useCreateProduct();
  const [formState, setFormState] = useState(INITIAL_PRODUCT_STATE);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const targetCategoryId = formState.categoryId || leafCategories[0]?.id;
    if (!targetCategoryId) return;

    const tags = formState.tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await createMutation.mutateAsync({
      title: formState.title,
      categoryId: targetCategoryId,
      brandName: formState.brandName,
      sellerSku: formState.sellerSku,
      originalPrice: formState.originalPrice,
      salePrice: formState.salePrice,
      stockQuantity: formState.stockQuantity,
      status: formState.status,
      tags,
    });
    onOpenChange(false);
    setFormState(INITIAL_PRODUCT_STATE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('products.addBtn')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label={t('products.titleLabel')} required>
            <Input
              type="text"
              required
              placeholder="VD: [Bonzstore] Mô Hình Hunter x Hunter Bộ 8 Nhân Vật Chibi HXH002"
              value={formState.title}
              onChange={(e) =>
                setFormState({ ...formState, title: e.target.value })
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={t('products.leafCategoryLabel')} required>
              <Select
                value={formState.categoryId || leafCategories[0]?.id || ''}
                onChange={(e) =>
                  setFormState({ ...formState, categoryId: e.target.value })
                }
                options={leafCategories.map((c) => ({
                  value: c.id,
                  label: `${c.localName} (#${c.externalCategoryId})`,
                }))}
              />
            </FormField>

            <FormField label={t('products.colStatus')} required>
              <Select
                value={formState.status}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    status: e.target.value as ProductStatus,
                  })
                }
                options={[
                  { value: 'ACTIVE', label: t('products.tabActive') },
                  { value: 'PENDING', label: t('products.tabPending') },
                  { value: 'DRAFT', label: t('products.tabDraft') },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('products.sellerSkuLabel')} required>
              <Input
                type="text"
                required
                value={formState.sellerSku}
                onChange={(e) =>
                  setFormState({ ...formState, sellerSku: e.target.value })
                }
              />
            </FormField>

            <FormField label={t('products.stockLabel')} required>
              <Input
                type="number"
                required
                value={formState.stockQuantity}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    stockQuantity: Number(e.target.value),
                  })
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('products.originalPriceLabel')} required>
              <Input
                type="number"
                required
                value={formState.originalPrice}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    originalPrice: Number(e.target.value),
                  })
                }
              />
            </FormField>

            <FormField label={t('products.salePriceLabel')} required>
              <Input
                type="number"
                required
                value={formState.salePrice}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    salePrice: Number(e.target.value),
                  })
                }
              />
            </FormField>
          </div>

          <FormField label={t('products.tagsLabel')}>
            <Input
              type="text"
              value={formState.tagsInput}
              onChange={(e) =>
                setFormState({ ...formState, tagsInput: e.target.value })
              }
            />
          </FormField>

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
