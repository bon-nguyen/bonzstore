import { FormEvent, useEffect, useState } from 'react';
import {
  CategoryItem,
  ProductItem,
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
import { useUpdateProduct } from '../hooks/useCatalog';

export interface EditProductDialogProps {
  product: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leafCategories: CategoryItem[];
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  leafCategories,
}: EditProductDialogProps) {
  const { t } = useI18n();
  const updateMutation = useUpdateProduct();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandName, setBrandName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (product && open) {
      setTitle(product.title);
      setCategoryId(product.category?.id || leafCategories[0]?.id || '');
      setBrandName(product.brandName || '');
      setImageUrl(product.thumbnailUrl || '');
      setStatus(product.status);
      setTagsInput((product.tags || []).join(', '));
    }
  }, [product, open, leafCategories]);

  if (!product) return null;

  const statusOptions = [
    { value: 'ACTIVE', label: `${t('products.tabActive')} (ACTIVE)` },
    { value: 'PENDING', label: `${t('products.tabPending')} (PENDING)` },
    { value: 'FAILED', label: `${t('products.tabFailed')} (FAILED)` },
    { value: 'INACTIVE', label: `${t('products.tabInactive')} (INACTIVE)` },
    { value: 'DRAFT', label: `${t('products.tabDraft')} (DRAFT)` },
    { value: 'DELETED', label: `${t('products.tabDeleted')} (DELETED)` },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await updateMutation.mutateAsync({
      id: product.id,
      data: {
        title,
        categoryId: categoryId || undefined,
        brandName: brandName || undefined,
        imageUrl: imageUrl || undefined,
        status,
        tags,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('products.editProductTitle')}</DialogTitle>
          <p className="font-mono text-xs text-muted-foreground">
            ID: {product.externalProductId || product.id} •{' '}
            {product.category?.cipher || 'TTP_VN_CAT_ASSET_202405'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {imageUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
              <img
                src={imageUrl}
                alt={title}
                className="h-14 w-14 rounded-lg border border-border object-cover"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="line-clamp-2 font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {product.skuCount} SKU • Hàng có sẵn: {product.totalStock}
                </p>
              </div>
            </div>
          ) : null}

          <FormField label={t('products.titleLabel')} required>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={t('products.leafCategoryLabel')} required>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={leafCategories.map((c) => ({
                  value: c.id,
                  label: `${c.localName} (#${c.externalCategoryId})`,
                }))}
              />
            </FormField>

            <FormField label={t('products.colStatus')} required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                options={statusOptions}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Thương hiệu (Brand)">
              <Input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </FormField>

            <FormField label="URL Ảnh đại diện">
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label={t('products.tagsLabel')}>
            <Input
              type="text"
              placeholder="VD: Hunter x Hunter, Chibi Q-Ver, Best Seller"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
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
            <Button type="submit" disabled={updateMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

