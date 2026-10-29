import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  evaluateProductTitleSeo,
  generateAiProductTitles,
  TIKTOK_TITLE_FORMULA,
} from '../constants/tiktok-ai-rules';
import { useCategories, useUpdateProduct } from '../hooks/useCatalog';

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
  const { data: allCategories = [] } = useCategories();

  const [title, setTitle] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandName, setBrandName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [tagsInput, setTagsInput] = useState('');

  const parentCategories = useMemo(
    () => allCategories.filter((c) => c.level === 1 || !c.parentId),
    [allCategories]
  );

  const childCategories = useMemo(() => {
    if (!parentCategoryId) return leafCategories;
    return allCategories.filter((c) => c.parentId === parentCategoryId);
  }, [allCategories, leafCategories, parentCategoryId]);

  useEffect(() => {
    if (product && open) {
      setTitle(product.title);
      const currentLeafId = product.category?.id || leafCategories[0]?.id || '';
      const matchedCat = allCategories.find((c) => c.id === currentLeafId);
      setParentCategoryId(matchedCat?.parentId || parentCategories[0]?.id || '');
      setCategoryId(currentLeafId);
      setBrandName(product.brandName || '');
      setImageUrl(product.thumbnailUrl || '');
      setStatus(product.status);
      setTagsInput((product.tags || []).join(', '));
    }
  }, [product, open, leafCategories, allCategories, parentCategories]);

  const selectedCategory = useMemo(
    () => allCategories.find((c) => c.id === categoryId) || null,
    [allCategories, categoryId]
  );

  const aiContext = useMemo(
    () => ({
      title,
      brandName,
      categoryName: selectedCategory?.localName,
      animeSeries: (product?.tags || [])[0] || 'Anime',
      characterName: product?.skus?.[0]?.salesAttributes?.[0]?.value_name || '',
      primarySku: product?.skus?.[0]?.sellerSku || '',
    }),
    [title, brandName, selectedCategory, product]
  );

  const seoEval = useMemo(
    () => evaluateProductTitleSeo(title, aiContext),
    [title, aiContext]
  );

  if (!product) return null;

  const statusOptions = [
    { value: 'ACTIVE', label: `${t('products.tabActive')} (ACTIVE)` },
    { value: 'PENDING', label: `${t('products.tabPending')} (PENDING)` },
    { value: 'FAILED', label: `${t('products.tabFailed')} (FAILED)` },
    { value: 'INACTIVE', label: `${t('products.tabInactive')} (INACTIVE)` },
    { value: 'DRAFT', label: `${t('products.tabDraft')} (DRAFT)` },
    { value: 'DELETED', label: `${t('products.tabDeleted')} (DELETED)` },
  ];

  const handleApplyAiStandardTitle = () => {
    const candidates = generateAiProductTitles(aiContext);
    if (candidates[0]) {
      setTitle(candidates[0].title);
      toast.success('Đã tối ưu tên sản phẩm chuẩn công thức SEO Website');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Vui lòng chọn Hạng mục Con (Cấp 2)');
      return;
    }
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                {t('products.titleLabel')} <span className="text-destructive">*</span>
              </span>
              <button
                type="button"
                onClick={handleApplyAiStandardTitle}
                className="inline-flex items-center gap-1 rounded-md border border-indigo-700 bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                <Wand2 className="h-3 w-3" />
                AI Chuẩn hóa Tên ({seoEval.score}/100)
              </button>
            </div>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-700 dark:text-primary shrink-0" />
              <span>Công thức: {TIKTOK_TITLE_FORMULA}</span>
            </p>
          </div>

          {/* Hạng mục 2 cấp đồng bộ với trang Tạo sản phẩm */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Bước 1: Hạng mục Cha (Cấp 1)" required>
              <Select
                value={parentCategoryId}
                onChange={(e) => {
                  const nextParent = e.target.value;
                  setParentCategoryId(nextParent);
                  const firstChild = allCategories.find(
                    (c) => c.parentId === nextParent
                  );
                  setCategoryId(firstChild?.id || '');
                }}
                placeholder="-- Chọn Hạng mục Cha --"
                options={parentCategories.map((p) => ({
                  value: p.id,
                  label: p.localName,
                }))}
              />
            </FormField>

            <FormField label="Bước 2: Hạng mục Con (Cấp 2)" required>
              <Select
                value={categoryId}
                disabled={!parentCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="-- Chọn Hạng mục Con --"
                options={childCategories.map((c) => ({
                  value: c.id,
                  label: `${c.localName} (#${c.externalCategoryId})`,
                }))}
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

            <FormField label={t('products.colStatus')} required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                options={statusOptions}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="URL Ảnh đại diện">
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </FormField>

            <FormField label={t('products.tagsLabel')}>
              <Input
                type="text"
                placeholder="VD: Hunter x Hunter, Chibi Q-Ver, Best Seller"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </FormField>
          </div>

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
