import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Film,
  GripVertical,
  ImagePlus,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Package,
  Plus,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  useCategories,
  useCreateProduct,
  useProductTags,
} from '../features/catalog/hooks/useCatalog';
import type { ProductStatus, SourcePlatform } from '../api/types/catalog.types';

interface VariationOptionItem {
  id: string;
  value: string;
  imageUrl: string;
}

interface VariationGroup {
  id: string;
  name: string;
  options: VariationOptionItem[];
}

interface SkuRowState {
  key: string;
  optionValues: Array<{ groupName: string; value: string }>;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
  sellerSku: string;
}

const ANIME_IMAGE_PRESETS = [
  {
    label: 'Naruto Chibi Set',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  },
  {
    label: 'Luffy Gear 5',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
  },
  {
    label: 'Gojo Satoru',
    url: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&q=80',
  },
  {
    label: 'Demon Slayer',
    url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80',
  },
];

/**
 * Mẫu 11 biến thể chuẩn theo file `.feature/test.md` (Naruto NRT009)
 */
const TEST_MD_NARUTO_PRESET: Array<{
  value: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
  sellerSku: string;
}> = [
  {
    value: 'Sakura',
    imageUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 7,
    sellerSku: 'NRT009',
  },
  {
    value: 'Naruto',
    imageUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 9,
    sellerSku: 'NRT009',
  },
  {
    value: 'Naruto Rasengan',
    imageUrl:
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&q=80',
    originalPrice: 129000,
    salePrice: 129000,
    stockQuantity: 11,
    sellerSku: 'NRT009',
  },
  {
    value: 'Kakashi',
    imageUrl:
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 10,
    sellerSku: 'NRT009',
  },
  {
    value: 'Minato',
    imageUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 6,
    sellerSku: 'NRT009',
  },
  {
    value: 'Uchiha Sasuke',
    imageUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 2,
    sellerSku: 'NRT009',
  },
  {
    value: 'Uchiha Itachi',
    imageUrl:
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 8,
    sellerSku: 'NRT009',
  },
  {
    value: 'Uchiha Madara',
    imageUrl:
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 1,
    sellerSku: 'NRT009',
  },
  {
    value: 'Hashirama',
    imageUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 2,
    sellerSku: 'NRT009',
  },
  {
    value: '1 Bé Ngẫu Nhiên',
    imageUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80',
    originalPrice: 99000,
    salePrice: 99000,
    stockQuantity: 13,
    sellerSku: 'NRT009',
  },
  {
    value: 'Bộ 9 bé',
    imageUrl:
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&q=80',
    originalPrice: 799000,
    salePrice: 799000,
    stockQuantity: 10,
    sellerSku: 'NRT009',
  },
];

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: existingTags = [] } = useProductTags();
  const createProductMutation = useCreateProduct();

  const leafCategories = useMemo(
    () => categories.filter((c) => c.isLeaf),
    [categories],
  );

  // 1. Thông tin cơ bản
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [title, setTitle] = useState(
    '[Bonzstore] Mô Hình Naruto Bộ 9 Nhân Vật Chibi Q Version Dáng Ngồi Cao 7-8cm - Figure PVC NRT009',
  );
  const [categoryId, setCategoryId] = useState('');
  const [brandName, setBrandName] = useState('BonzStore Anime');
  const [sourcePlatform, setSourcePlatform] =
    useState<SourcePlatform>('TIKTOK_SHOP');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Chibi Q-Ver',
    'Best Seller',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Thuộc tính sản phẩm (Product Attributes)
  const [attributes, setAttributes] = useState<
    Array<{ name: string; value: string }>
  >([
    { name: 'Series Anime', value: 'Naruto Shippuden' },
    { name: 'Chất liệu', value: 'Nhựa PVC / ABS nguyên sinh cao cấp' },
    { name: 'Chiều cao', value: '7cm - 8.5cm' },
    { name: 'Xuất xứ', value: 'Nhật Bản / Trung Quốc (Chính hãng)' },
    { name: 'Đóng gói', value: 'Full Box / Túi OPP chống sốc' },
    { name: 'Độ tuổi khuyến nghị', value: '14 tuổi trở lên' },
  ]);

  // 2. Chi tiết sản phẩm (Mô tả & Video)
  const [descriptionHtml, setDescriptionHtml] = useState(
    `🔥 [Bonzstore] Mô Hình Naruto Bộ 9 Nhân Vật Chibi Q Version Dáng Ngồi Cao 7-8cm - Mã NRT009
• Chất liệu: Nhựa PVC cao cấp, màu sơn sắc nét, an toàn và bền màu theo thời gian.
• Kích thước: Cao 7cm - 8.5cm (tùy nhân vật), thích hợp trưng bày bàn làm việc, góc PC gaming, kệ sách hoặc taplo ô tô.
• Phân loại: Có thể chọn lẻ từng nhân vật yêu thích (Sakura, Naruto, Naruto Rasengan, Kakashi, Minato, Sasuke, Itachi, Madara, Hashirama) hoặc mua nguyên Set Bộ 9 bé giá ưu đãi!`,
  );
  const [videoUrl, setVideoUrl] = useState('');

  // 3. Thông tin bán hàng - Biến thể (#sale_properties) & Danh sách biến thể (#skus)
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([
    {
      id: 'var-group-1',
      name: 'Nhân vật',
      options: TEST_MD_NARUTO_PRESET.map((item, idx) => ({
        id: `opt-${idx + 1}`,
        value: item.value,
        imageUrl: item.imageUrl,
      })),
    },
  ]);

  const [skuRowsMap, setSkuRowsMap] = useState<Record<string, SkuRowState>>(
    () => {
      const initial: Record<string, SkuRowState> = {};
      for (const item of TEST_MD_NARUTO_PRESET) {
        initial[item.value] = {
          key: item.value,
          optionValues: [{ groupName: 'Nhân vật', value: item.value }],
          imageUrl: item.imageUrl,
          originalPrice: item.originalPrice,
          salePrice: item.salePrice,
          stockQuantity: item.stockQuantity,
          sellerSku: item.sellerSku,
        };
      }
      return initial;
    },
  );

  // Batch Edit Bar state (#skus batch_edit)
  const [batchFilterOption, setBatchFilterOption] = useState<string>('ALL');
  const [batchStock, setBatchStock] = useState<string>('');
  const [batchOriginalPrice, setBatchOriginalPrice] = useState<string>('');
  const [batchSalePrice, setBatchSalePrice] = useState<string>('');
  const [batchSellerSku, setBatchSellerSku] = useState<string>('');
  const [isSkuTableFullscreen, setIsSkuTableFullscreen] = useState(false);

  // Editing SKU option image dialog
  const [editingImageForOption, setEditingImageForOption] = useState<{
    groupId: string;
    optionId: string;
    currentUrl: string;
    label: string;
  } | null>(null);

  // 4. Vận chuyển
  const [packageWeight, setPackageWeight] = useState<string>('0.35');
  const [packageLength, setPackageLength] = useState<string>('15');
  const [packageWidth, setPackageWidth] = useState<string>('12');
  const [packageHeight, setPackageHeight] = useState<string>('10');

  // Auto-select first leaf category when categories load
  useEffect(() => {
    if (!categoryId && leafCategories.length > 0) {
      const chibiCat =
        leafCategories.find((c) =>
          c.localName.toLowerCase().includes('chibi'),
        ) || leafCategories[0];
      if (chibiCat) {
        setCategoryId(chibiCat.id);
      }
    }
  }, [leafCategories, categoryId]);

  // Compute Cartesian product of variationGroups -> active SKU rows
  const activeSkuRows = useMemo(() => {
    const validGroups = variationGroups
      .map((g) => ({
        ...g,
        options: g.options.filter((o) => o.value.trim().length > 0),
      }))
      .filter((g) => g.options.length > 0);

    if (validGroups.length === 0) {
      return [];
    }

    let combinations: Array<{
      key: string;
      imageUrl: string;
      optionValues: Array<{ groupName: string; value: string }>;
    }> = [];

    const firstGroup = validGroups[0];
    combinations = firstGroup.options.map((opt) => ({
      key: opt.value.trim(),
      imageUrl: opt.imageUrl,
      optionValues: [
        { groupName: firstGroup.name || 'Nhân vật', value: opt.value.trim() },
      ],
    }));

    for (let i = 1; i < validGroups.length; i++) {
      const nextGroup = validGroups[i];
      const nextCombos: typeof combinations = [];
      for (const prev of combinations) {
        for (const opt of nextGroup.options) {
          const val = opt.value.trim();
          nextCombos.push({
            key: `${prev.key} / ${val}`,
            imageUrl: prev.imageUrl || opt.imageUrl,
            optionValues: [
              ...prev.optionValues,
              { groupName: nextGroup.name || `Biến thể ${i + 1}`, value: val },
            ],
          });
        }
      }
      combinations = nextCombos;
    }

    return combinations.map((combo) => {
      const existing = skuRowsMap[combo.key];
      return {
        key: combo.key,
        optionValues: combo.optionValues,
        imageUrl: combo.imageUrl || existing?.imageUrl || '',
        originalPrice: existing?.originalPrice ?? 99000,
        salePrice: existing?.salePrice ?? existing?.originalPrice ?? 99000,
        stockQuantity: existing?.stockQuantity ?? 10,
        sellerSku: existing?.sellerSku ?? 'NRT009',
      };
    });
  }, [variationGroups, skuRowsMap]);

  const updateSkuRowField = (
    key: string,
    field: keyof SkuRowState,
    value: string | number,
  ) => {
    setSkuRowsMap((prev) => {
      const current = prev[key] || {
        key,
        optionValues: [],
        imageUrl: '',
        originalPrice: 99000,
        salePrice: 99000,
        stockQuantity: 10,
        sellerSku: 'NRT009',
      };
      const updated = {
        ...current,
        [field]: value,
      };
      if (
        field === 'originalPrice' &&
        (current.salePrice === current.originalPrice ||
          current.salePrice > Number(value))
      ) {
        updated.salePrice = Number(value);
      }
      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  // Apply Batch Edit (#skus batch_edit)
  const handleApplyBatchEdit = () => {
    if (
      !batchStock.trim() &&
      !batchOriginalPrice.trim() &&
      !batchSalePrice.trim() &&
      !batchSellerSku.trim()
    ) {
      toast.warning(
        'Vui lòng nhập ít nhất 1 thông số (Số lượng, Giá bán lẻ hoặc SKU) để áp dụng hàng loạt',
      );
      return;
    }

    setSkuRowsMap((prev) => {
      const next = { ...prev };
      let updatedCount = 0;

      for (const row of activeSkuRows) {
        const matchesFilter =
          batchFilterOption === 'ALL' ||
          row.optionValues.some((ov) => ov.value === batchFilterOption);

        if (!matchesFilter) continue;

        const current = next[row.key] || row;
        const newOrig = batchOriginalPrice.trim()
          ? Math.max(0, Number(batchOriginalPrice))
          : current.originalPrice;
        const newSale = batchSalePrice.trim()
          ? Math.max(0, Number(batchSalePrice))
          : batchOriginalPrice.trim()
            ? newOrig
            : current.salePrice;
        const newStock = batchStock.trim()
          ? Math.max(0, Number(batchStock))
          : current.stockQuantity;
        const newSku = batchSellerSku.trim()
          ? batchSellerSku.trim()
          : current.sellerSku;

        next[row.key] = {
          ...current,
          originalPrice: newOrig,
          salePrice: newSale,
          stockQuantity: newStock,
          sellerSku: newSku,
        };
        updatedCount++;
      }

      toast.success(
        `Đã áp dụng chỉnh sửa hàng loạt cho ${updatedCount} biến thể SKU!`,
      );
      return next;
    });
  };

  // Variation group & option handlers
  const handleVariationNameChange = (groupId: string, newName: string) => {
    setVariationGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: newName } : g)),
    );
  };

  const handleOptionValueChange = (
    groupId: string,
    optionId: string,
    newValue: string,
  ) => {
    if (newValue.length > 50) return;
    setVariationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, value: newValue } : o,
              ),
            }
          : g,
      ),
    );
  };

  const handleOptionImageChange = (
    groupId: string,
    optionId: string,
    newUrl: string,
  ) => {
    setVariationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, imageUrl: newUrl } : o,
              ),
            }
          : g,
      ),
    );
  };

  const handleAddOption = (groupId: string) => {
    setVariationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                {
                  id: `opt-${Date.now()}-${g.options.length + 1}`,
                  value: `Phân loại ${g.options.length + 1}`,
                  imageUrl:
                    ANIME_IMAGE_PRESETS[
                      g.options.length % ANIME_IMAGE_PRESETS.length
                    ].url,
                },
              ],
            }
          : g,
      ),
    );
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    setVariationGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.options.length <= 1) {
          toast.warning('Mỗi nhóm biến thể phải có ít nhất 1 tùy chọn');
          return g;
        }
        return {
          ...g,
          options: g.options.filter((o) => o.id !== optionId),
        };
      }),
    );
  };

  const handleAddVariationGroup = () => {
    if (variationGroups.length >= 2) {
      toast.info(
        'TikTok Shop hỗ trợ tối đa 2 cấp biến thể (VD: Nhân vật + Phiên bản)',
      );
      return;
    }
    setVariationGroups((prev) => [
      ...prev,
      {
        id: `var-group-${Date.now()}`,
        name: 'Phiên bản',
        options: [
          {
            id: `opt-v1-${Date.now()}`,
            value: 'Bản Tiêu Chuẩn (Túi OPP)',
            imageUrl: '',
          },
          {
            id: `opt-v2-${Date.now()}`,
            value: 'Bản Full Box + Đế Trưng Bày',
            imageUrl: '',
          },
        ],
      },
    ]);
  };

  const handleRemoveVariationGroup = (groupId: string) => {
    if (variationGroups.length <= 1) {
      toast.warning('Sản phẩm cần ít nhất 1 nhóm biến thể');
      return;
    }
    setVariationGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  // Load 11 Naruto Variations from `.feature/test.md`
  const handleLoadNarutoPreset = () => {
    setTitle(
      '[Bonzstore] Mô Hình Naruto Bộ 9 Nhân Vật Chibi Q Version Dáng Ngồi Cao 7-8cm - Figure PVC NRT009',
    );
    setBrandName('BonzStore Anime');
    setVariationGroups([
      {
        id: 'var-group-1',
        name: 'Nhân vật',
        options: TEST_MD_NARUTO_PRESET.map((item, idx) => ({
          id: `opt-${idx + 1}`,
          value: item.value,
          imageUrl: item.imageUrl,
        })),
      },
    ]);
    const nextMap: Record<string, SkuRowState> = {};
    for (const item of TEST_MD_NARUTO_PRESET) {
      nextMap[item.value] = {
        key: item.value,
        optionValues: [{ groupName: 'Nhân vật', value: item.value }],
        imageUrl: item.imageUrl,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        stockQuantity: item.stockQuantity,
        sellerSku: item.sellerSku,
      };
    }
    setSkuRowsMap(nextMap);
    toast.success(
      'Đã nạp mẫu 11 biến thể Naruto (NRT009) chuẩn theo .feature/test.md!',
    );
  };

  // Image gallery handlers
  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (images.length >= 9) {
      toast.warning('Tối đa 9 hình ảnh sản phẩm (tỷ lệ 1:1)');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Tags handlers
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddCustomTag = () => {
    const t = customTagInput.trim();
    if (!t) return;
    if (!selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTagInput('');
  };

  // Submit handler (Save Draft / Submit Pending / Publish Active)
  const handleSubmitProduct = (targetStatus: ProductStatus) => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập * Tên sản phẩm');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn * Hạng mục ngành hàng lá (202405)');
      return;
    }
    if (activeSkuRows.length === 0) {
      toast.error(
        'Vui lòng thêm ít nhất 1 biến thể sản phẩm trong Danh sách biến thể',
      );
      return;
    }

    const firstRow = activeSkuRows[0];

    createProductMutation.mutate(
      {
        title: title.trim(),
        categoryId,
        brandName: brandName.trim() || 'BonzStore Anime',
        descriptionHtml: descriptionHtml.trim(),
        imageUrl: images[0],
        images,
        videoUrl: videoUrl.trim() || undefined,
        sourcePlatform,
        status: targetStatus,
        tags: selectedTags,
        attributes: attributes.filter((a) => a.name.trim() && a.value.trim()),
        packageWeight: Number(packageWeight) || 0.35,
        sellerSku: firstRow.sellerSku || 'NRT009',
        originalPrice: Number(firstRow.originalPrice) || 99000,
        salePrice:
          Number(firstRow.salePrice || firstRow.originalPrice) || 99000,
        stockQuantity: Number(firstRow.stockQuantity) || 0,
        skus: activeSkuRows.map((row) => ({
          sellerSku: row.sellerSku || 'NRT009',
          originalPrice: Number(row.originalPrice) || 99000,
          salePrice: Number(row.salePrice || row.originalPrice) || 99000,
          stockQuantity: Number(row.stockQuantity) || 0,
          imageUrl: row.imageUrl || undefined,
          salesAttributes: row.optionValues.map((ov) => ({
            name: ov.groupName,
            value_name: ov.value,
            ...(row.imageUrl ? { sku_img: row.imageUrl } : {}),
          })),
        })),
      },
      {
        onSuccess: () => {
          const statusMsg =
            targetStatus === 'DRAFT'
              ? 'Đã lưu sản phẩm vào Bản nháp!'
              : targetStatus === 'PENDING'
                ? 'Đã gửi sản phẩm sang tab Đang xem xét!'
                : `Đã đăng sản phẩm mới với ${activeSkuRows.length} biến thể lên kệ!`;
          toast.success(statusMsg);
          navigate('/products');
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            'Không thể tạo sản phẩm. Vui lòng kiểm tra lại dữ liệu.';
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        },
      },
    );
  };

  // Summary metrics for sticky footer & preview card
  const summaryMetrics = useMemo(() => {
    if (activeSkuRows.length === 0) {
      return { totalStock: 0, minPrice: 0, maxPrice: 0 };
    }
    const prices = activeSkuRows.map((r) => r.salePrice || r.originalPrice);
    const totalStock = activeSkuRows.reduce(
      (sum, r) => sum + (Number(r.stockQuantity) || 0),
      0,
    );
    return {
      totalStock,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [activeSkuRows]);

  const selectedCategoryObj = useMemo(
    () => leafCategories.find((c) => c.id === categoryId),
    [leafCategories, categoryId],
  );

  const availableTagNames = useMemo(() => {
    const set = new Set<string>([
      'Best Seller',
      'Chibi Q-Ver',
      'Hunter x Hunter',
      'One Piece',
      'Jujutsu Kaisen',
      'Pre-order',
      'Limited Edition',
      'Flash Sale',
      ...existingTags.map((t) => t.name),
    ]);
    return Array.from(set);
  }, [existingTags]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Top Page Header */}
      <div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate('/products')}
            className="h-9 w-9 shrink-0 rounded-lg"
            title="Quay lại Tất cả sản phẩm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                Thêm sản phẩm mới
              </h1>
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                TikTok Shop Seller Center 202405
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Thiết lập Thông tin cơ bản, Chi tiết sản phẩm, Biến thể &amp; Danh
              sách SKU đồng bộ trực tiếp lên gian hàng
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadNarutoPreset}
            className="gap-1.5 border-teal-500/30 bg-teal-500/5 text-xs font-medium text-teal-700 hover:bg-teal-500/10 dark:text-teal-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Nạp mẫu 11 biến thể Naruto (test.md)
          </Button>
        </div>
      </div>

      {/* Section Tabs Bar */}
      <div className="sticky top-0 z-20 mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border bg-card/95 p-1.5 shadow-sm backdrop-blur">
        {[
          { id: 'sec-basic', label: 'Thông tin cơ bản', icon: Package },
          { id: 'sec-details', label: 'Chi tiết sản phẩm', icon: Film },
          {
            id: 'sec-sales',
            label: `Thông tin bán hàng (${activeSkuRows.length} SKU)`,
            icon: Layers,
          },
          { id: 'sec-shipping', label: 'Vận chuyển & Đóng gói', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-teal-600" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Main Left Form Column (9 cols) */}
        <div className="space-y-6 xl:col-span-9">
          {/* =========================================================
              SECTION 1: THÔNG TIN CƠ BẢN
          ========================================================= */}
          <section
            id="sec-basic"
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 border-b pb-3">
              <h2 className="text-base font-bold text-foreground">
                Thông tin cơ bản
              </h2>
              <p className="text-xs text-muted-foreground">
                Hình ảnh tỷ lệ 1:1, tên chuẩn SEO, hạng mục lá 202405 và thuộc
                tính sản phẩm
              </p>
            </div>

            <div className="space-y-6">
              {/* * Hình ảnh sản phẩm */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Hình ảnh sản
                    phẩm{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({images.length}/9 ảnh • Khuyến nghị tỷ lệ 1:1, tối thiểu
                      800×800px)
                    </span>
                  </label>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
                  {images.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30"
                    >
                      <img
                        src={url}
                        alt={`Ảnh ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-teal-600/90 py-0.5 text-center text-[10px] font-semibold text-white">
                          Ảnh bìa
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setPreviewImageUrl(url)}
                          className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40"
                          title="Xem ảnh"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="rounded-full bg-white/20 p-1.5 text-rose-300 hover:bg-rose-500 hover:text-white"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {images.length < 9 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextPreset =
                          ANIME_IMAGE_PRESETS[
                            images.length % ANIME_IMAGE_PRESETS.length
                          ].url;
                        setImages((prev) => [...prev, nextPreset]);
                      }}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 text-muted-foreground transition-colors hover:border-teal-500 hover:bg-teal-500/5 hover:text-teal-600"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Thêm ảnh</span>
                    </button>
                  )}
                </div>

                {/* Add custom image URL */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Dán URL hình ảnh sản phẩm (https://...) rồi nhấn Thêm"
                    className="h-8 max-w-md text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="h-8 text-xs"
                  >
                    + Thêm URL ảnh
                  </Button>
                  <div className="flex items-center gap-1">
                    {ANIME_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (images.length < 9) {
                            setImages((prev) => [...prev, preset.url]);
                          }
                        }}
                        className="rounded border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:border-teal-500 hover:text-teal-600"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* * Tên sản phẩm */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  <span className="text-destructive">*</span> Tên sản phẩm
                </label>
                <div className="relative">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 255))}
                    placeholder="[Bonzstore] Mô Hình Naruto Bộ 9 Nhân Vật Chibi Q Version Dáng Ngồi Cao 7-8cm - Figure PVC NRT009"
                    className="pr-16 text-sm"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {title.length}/255
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gợi ý cấu trúc chuẩn TikTok Shop:{' '}
                  <code className="rounded bg-muted px-1 py-0.5">
                    [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật +
                    Kích thước + Mã SKU
                  </code>
                </p>
              </div>

              {/* * Hạng mục & * Thương hiệu */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Hạng mục
                  </label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="Chọn hạng mục ngành hàng lá (is_leaf = true)..."
                    options={leafCategories.map((cat) => ({
                      value: cat.id,
                      label: `${cat.parentName ? `${cat.parentName} > ` : ''}${cat.localName} (#${cat.externalCategoryId || '605015'})`,
                    }))}
                  />
                  {selectedCategoryObj && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Đã uỷ quyền Category Assets 202405 •{' '}
                        <strong className="font-mono">AVAILABLE</strong> (Leaf
                        ID: #{selectedCategoryObj.externalCategoryId || '605015'}
                        )
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Thương hiệu
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="VD: BonzStore Anime, Good Smile Company, Banpresto..."
                    />
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setBrandName(e.target.value);
                      }}
                      placeholder="Chọn nhanh"
                      options={[
                        { value: 'BonzStore Anime', label: 'BonzStore Anime' },
                        {
                          value: 'Good Smile Company',
                          label: 'Good Smile Company',
                        },
                        {
                          value: 'Banpresto / Bandai',
                          label: 'Banpresto / Bandai',
                        },
                        { value: 'Kotobukiya', label: 'Kotobukiya' },
                        { value: 'MegaHouse', label: 'MegaHouse' },
                        { value: 'No Brand', label: 'No Brand' },
                      ]}
                      className="w-[155px] shrink-0 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Thuộc tính (Product Attributes) */}
              <div className="space-y-3 rounded-xl border bg-muted/15 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Thuộc tính</h3>
                    <p className="text-xs text-muted-foreground">
                      Bổ sung đầy đủ thuộc tính giúp tăng khả năng hiển thị khi
                      người mua tìm kiếm trên TikTok Shop
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAttributes((prev) => [
                        ...prev,
                        { name: '', value: '' },
                      ])
                    }
                    className="h-8 gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm thuộc tính
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border bg-background p-2"
                    >
                      <Input
                        value={attr.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttributes((prev) =>
                            prev.map((a, i) =>
                              i === idx ? { ...a, name: val } : a,
                            ),
                          );
                        }}
                        placeholder="Tên thuộc tính (VD: Chất liệu)"
                        className="h-8 w-2/5 text-xs font-medium"
                      />
                      <Input
                        value={attr.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttributes((prev) =>
                            prev.map((a, i) =>
                              i === idx ? { ...a, value: val } : a,
                            ),
                          );
                        }}
                        placeholder="Giá trị (VD: Nhựa PVC cao cấp)"
                        className="h-8 flex-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAttributes((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Xóa thuộc tính"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thẻ phân loại (Tags) & Kênh đồng bộ */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Tag className="h-3.5 w-3.5 text-teal-600" />
                    Thẻ phân loại sản phẩm (Tags)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTagNames.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            active
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex max-w-xs gap-2 pt-1">
                    <Input
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Tạo thêm thẻ mới..."
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomTag}
                      className="h-8 text-xs"
                    >
                      Thêm thẻ
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Nền tảng đồng bộ
                  </label>
                  <Select
                    value={sourcePlatform}
                    onChange={(e) =>
                      setSourcePlatform(e.target.value as SourcePlatform)
                    }
                    options={[
                      { value: 'TIKTOK_SHOP', label: 'TikTok Shop Seller' },
                      { value: 'SHOPEE', label: 'Shopee Mall' },
                      { value: 'LOCAL', label: 'Website Nội bộ (Local)' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 2: CHI TIẾT SẢN PHẨM (* Mô tả & Video)
          ========================================================= */}
          <section
            id="sec-details"
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 border-b pb-3">
              <h2 className="text-base font-bold text-foreground">
                Chi tiết sản phẩm
              </h2>
              <p className="text-xs text-muted-foreground">
                Mô tả chi tiết thông số mô hình và Video quay thực tế sản phẩm
              </p>
            </div>

            <div className="space-y-6">
              {/* * Mô tả */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Mô tả
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDescriptionHtml(
                          (prev) =>
                            `${prev}\n\n✅ CAM KẾT TỪ BONZSTORE ANIME:\n• Hàng mới 100%, kiểm tra kỹ ngoại quan trước khi đóng gói.\n• Bọc xốp nổ 3 lớp chống móp hộp khi vận chuyển.\n• Hỗ trợ đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất.`,
                        )
                      }
                      className="h-7 text-[11px]"
                    >
                      + Chèn cam kết bảo hành BonzStore
                    </Button>
                  </div>
                </div>

                <textarea
                  rows={7}
                  value={descriptionHtml}
                  onChange={(e) => setDescriptionHtml(e.target.value)}
                  placeholder="Nhập mô tả chi tiết sản phẩm, kích thước, chất liệu, quy cách đóng gói..."
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    Khuyến nghị mô tả từ 150 ký tự trở lên kèm gạch đầu dòng rõ
                    ràng.
                  </span>
                  <span>{descriptionHtml.length} ký tự</span>
                </div>
              </div>

              {/* Video */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Video</label>
                <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/15 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                        <Film className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          Video giới thiệu sản phẩm (Tùy chọn)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Tỷ lệ khung hình video phải từ 9:16 đến 16:9. Kích
                          thước file tối đa: 100 MB. Định dạng: MP4, MOV, MKV,
                          AVI
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Dán đường dẫn Video MP4/MOV (https://...) nếu có"
                      className="h-8 text-xs"
                    />
                    {videoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideoUrl('')}
                        className="h-8 text-xs text-destructive"
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 3: THÔNG TIN BÁN HÀNG (#sale_properties & #skus)
              Chuẩn giao diện `.feature/test.md`
          ========================================================= */}
          <section
            id="sec-sales"
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Thông tin bán hàng
                </h2>
                <p className="text-xs text-muted-foreground">
                  Thiết lập nhóm Biến thể (Nhân vật, Phiên bản) và quản lý Danh
                  sách biến thể SKU hàng loạt
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariationGroup}
                disabled={variationGroups.length >= 2}
                className="gap-1.5 border-teal-500/40 text-xs font-semibold text-teal-600 hover:bg-teal-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm biến thể ({variationGroups.length}/2)
              </Button>
            </div>

            {/* Khối Biến thể (#sale_properties) */}
            <div id="sale_properties" className="space-y-5">
              {variationGroups.map((group, groupIdx) => (
                <div
                  key={group.id}
                  className="rounded-xl border bg-muted/20 p-5"
                >
                  <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <div className="flex flex-1 items-center gap-3">
                      <span className="rounded bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        Biến thể #{groupIdx + 1}
                      </span>
                      <div className="flex max-w-sm flex-1 items-center gap-2">
                        <label className="shrink-0 text-xs font-semibold">
                          <span className="text-destructive">*</span> Tên biến
                          thể:
                        </label>
                        <Input
                          value={group.name}
                          onChange={(e) =>
                            handleVariationNameChange(group.id, e.target.value)
                          }
                          placeholder="VD: Nhân vật, Phân loại..."
                          className="h-8 bg-background text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {variationGroups.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariationGroup(group.id)}
                        className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa biến thể
                      </Button>
                    )}
                  </div>

                  {/* * Tùy chọn (Options list with x/50 counter and delete icon like test.md) */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold">
                      <span className="text-destructive">*</span> Tùy chọn (
                      {group.options.length} lựa chọn)
                    </label>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {group.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 shadow-2xs"
                        >
                          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50" />

                          {/* Option thumbnail trigger (for first variation group) */}
                          {groupIdx === 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingImageForOption({
                                  groupId: group.id,
                                  optionId: opt.id,
                                  currentUrl: opt.imageUrl,
                                  label: opt.value,
                                })
                              }
                              className="relative h-8 w-8 shrink-0 overflow-hidden rounded border bg-muted/40 hover:border-teal-500"
                              title="Đổi ảnh cho tùy chọn biến thể này"
                            >
                              {opt.imageUrl ? (
                                <img
                                  src={opt.imageUrl}
                                  alt={opt.value}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImagePlus className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </button>
                          )}

                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={opt.value}
                              maxLength={50}
                              onChange={(e) =>
                                handleOptionValueChange(
                                  group.id,
                                  opt.id,
                                  e.target.value,
                                )
                              }
                              placeholder="Nhập một tùy chọn..."
                              className="w-full bg-transparent pr-11 text-xs font-medium focus:outline-none"
                            />
                            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                              {opt.value.length}/50
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOption(group.id, opt.id)}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Xóa tùy chọn"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(group.id)}
                        className="gap-1.5 border-dashed border-teal-500/50 text-xs font-semibold text-teal-600 hover:bg-teal-500/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm lựa chọn
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* =========================================================
                KHỐI DANH SÁCH BIẾN THỂ (#skus) & BATCH EDIT BAR
                Chuẩn cấu trúc `#skus` từ `.feature/test.md`
            ========================================================= */}
            <div
              id="skus"
              className={
                isSkuTableFullscreen
                  ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-background p-6'
                  : 'mt-7 space-y-3'
              }
            >
              {/* Header & Batch Edit Toolbar */}
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/25 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">Danh sách biến thể</h3>
                    <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {activeSkuRows.length} SKU
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Lựa chọn SKU:{' '}
                      <strong className="text-foreground">
                        {activeSkuRows.length}
                      </strong>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSkuTableFullscreen((prev) => !prev)}
                      className="h-8 w-8"
                      title={
                        isSkuTableFullscreen
                          ? 'Thu nhỏ bảng'
                          : 'Mở rộng toàn màn hình'
                      }
                    >
                      {isSkuTableFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Batch Edit Inputs Row (`product.publish.skus.batch_edit` in test.md) */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
                  {/* Filter selector (`Tất cả` or specific option) */}
                  <Select
                    value={batchFilterOption}
                    onChange={(e) => setBatchFilterOption(e.target.value)}
                    options={[
                      {
                        value: 'ALL',
                        label: `Tất cả (${activeSkuRows.length})`,
                      },
                      ...(variationGroups[0]?.options
                        .filter((o) => o.value.trim())
                        .map((o) => ({
                          value: o.value.trim(),
                          label: o.value.trim(),
                        })) || []),
                    ]}
                    className="h-9 bg-background text-xs"
                  />

                  {/* Batch Retail Price */}
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={batchOriginalPrice}
                      onChange={(e) => setBatchOriginalPrice(e.target.value)}
                      placeholder="Giá bán lẻ (₫)"
                      className="h-9 bg-background pr-6 text-xs"
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      ₫
                    </span>
                  </div>

                  {/* Batch Sale Price */}
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={batchSalePrice}
                      onChange={(e) => setBatchSalePrice(e.target.value)}
                      placeholder="Giá KM (₫)"
                      className="h-9 bg-background pr-6 text-xs"
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      ₫
                    </span>
                  </div>

                  {/* Batch Stock Quantity (`Số lượng`) */}
                  <Input
                    type="number"
                    min={0}
                    value={batchStock}
                    onChange={(e) => setBatchStock(e.target.value)}
                    placeholder="Số lượng tồn kho"
                    className="h-9 bg-background text-xs"
                  />

                  {/* Batch Seller SKU (`SKU người bán`) */}
                  <Input
                    value={batchSellerSku}
                    onChange={(e) => setBatchSellerSku(e.target.value)}
                    placeholder="SKU người bán (VD: NRT009)"
                    className="h-9 bg-background text-xs"
                  />

                  {/* Apply Button (`Áp dụng`) */}
                  <Button
                    type="button"
                    onClick={handleApplyBatchEdit}
                    className="h-9 bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Áp dụng hàng loạt
                  </Button>
                </div>
              </div>

              {/* SKU Table (`#skus table` in test.md) */}
              <div className="overflow-x-auto rounded-xl border bg-background shadow-2xs">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                      <th className="min-w-[230px] px-4 py-3">
                        {variationGroups
                          .map((g) => g.name || 'Biến thể')
                          .join(' / ')}
                      </th>
                      <th className="min-w-[165px] px-3 py-3">
                        <span className="text-destructive">*</span> Giá bán lẻ
                      </th>
                      <th className="min-w-[165px] px-3 py-3">
                        Giá bán / Khuyến mãi
                      </th>
                      <th className="min-w-[140px] px-3 py-3">
                        <span className="text-destructive">*</span> Hàng có sẵn
                      </th>
                      <th className="min-w-[165px] px-3 py-3">SKU người bán</th>
                      <th className="w-[60px] px-3 py-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeSkuRows.map((row) => {
                      const firstOptVal = row.optionValues[0]?.value || row.key;
                      const firstGroup = variationGroups[0];
                      const matchingOpt = firstGroup?.options.find(
                        (o) => o.value.trim() === firstOptVal,
                      );

                      return (
                        <tr
                          key={row.key}
                          className="transition-colors hover:bg-muted/20"
                        >
                          {/* Column 1: 60x60 Image + Option Name (exact replica of _iconUploadContainer_zs0xj_123 in test.md) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
                                {row.imageUrl ? (
                                  <>
                                    <img
                                      src={row.imageUrl}
                                      alt={row.key}
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImageUrl(row.imageUrl)
                                        }
                                        className="rounded p-1 text-white hover:bg-white/20"
                                        title="Xem ảnh"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                      {matchingOpt && firstGroup && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOptionImageChange(
                                              firstGroup.id,
                                              matchingOpt.id,
                                              '',
                                            )
                                          }
                                          className="rounded p-1 text-rose-300 hover:bg-rose-500 hover:text-white"
                                          title="Xóa ảnh"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (matchingOpt && firstGroup) {
                                        setEditingImageForOption({
                                          groupId: firstGroup.id,
                                          optionId: matchingOpt.id,
                                          currentUrl: '',
                                          label: row.key,
                                        });
                                      }
                                    }}
                                    className="flex h-full w-full flex-col items-center justify-center text-muted-foreground hover:text-teal-600"
                                    title="Thêm ảnh biến thể"
                                  >
                                    <ImagePlus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {row.key}
                                </p>
                                {matchingOpt && firstGroup && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingImageForOption({
                                        groupId: firstGroup.id,
                                        optionId: matchingOpt.id,
                                        currentUrl: row.imageUrl,
                                        label: row.key,
                                      })
                                    }
                                    className="text-[11px] text-teal-600 hover:underline dark:text-teal-400"
                                  >
                                    Đổi ảnh
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Column 2: * Giá bán lẻ (₫) */}
                          <td className="px-3 py-3">
                            <div className="relative flex items-center">
                              <span className="pointer-events-none absolute left-2.5 text-xs font-medium text-muted-foreground">
                                ₫
                              </span>
                              <span className="pointer-events-none absolute left-6 h-4 w-px bg-border" />
                              <Input
                                type="number"
                                min={0}
                                value={row.originalPrice}
                                onChange={(e) =>
                                  updateSkuRowField(
                                    row.key,
                                    'originalPrice',
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                className="h-9 pl-8 pr-7 text-xs font-medium"
                              />
                              {row.originalPrice > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSkuRowField(
                                      row.key,
                                      'originalPrice',
                                      0,
                                    )
                                  }
                                  className="absolute right-2 text-muted-foreground/60 hover:text-foreground"
                                  title="Xóa nhanh"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Column 3: Giá bán / KM (₫) */}
                          <td className="px-3 py-3">
                            <div className="relative flex items-center">
                              <span className="pointer-events-none absolute left-2.5 text-xs font-medium text-muted-foreground">
                                ₫
                              </span>
                              <span className="pointer-events-none absolute left-6 h-4 w-px bg-border" />
                              <Input
                                type="number"
                                min={0}
                                value={row.salePrice}
                                onChange={(e) =>
                                  updateSkuRowField(
                                    row.key,
                                    'salePrice',
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                className="h-9 pl-8 text-xs font-semibold text-teal-700 dark:text-teal-400"
                              />
                            </div>
                          </td>

                          {/* Column 4: * Hàng có sẵn (Stock Quantity) */}
                          <td className="px-3 py-3">
                            <div className="relative flex items-center">
                              <Input
                                type="number"
                                min={0}
                                value={row.stockQuantity}
                                onChange={(e) =>
                                  updateSkuRowField(
                                    row.key,
                                    'stockQuantity',
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                className={`h-9 pr-7 text-xs font-semibold ${
                                  row.stockQuantity === 0
                                    ? 'border-rose-400 text-rose-600'
                                    : ''
                                }`}
                              />
                              {row.stockQuantity > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSkuRowField(
                                      row.key,
                                      'stockQuantity',
                                      0,
                                    )
                                  }
                                  className="absolute right-2 text-muted-foreground/60 hover:text-foreground"
                                  title="Đặt về 0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Column 5: SKU người bán (`sellerSku`) */}
                          <td className="px-3 py-3">
                            <Input
                              maxLength={50}
                              value={row.sellerSku}
                              onChange={(e) =>
                                updateSkuRowField(
                                  row.key,
                                  'sellerSku',
                                  e.target.value,
                                )
                              }
                              placeholder="VD: NRT009"
                              className="h-9 font-mono text-xs"
                            />
                          </td>

                          {/* Column 6: Delete SKU Option */}
                          <td className="px-3 py-3 text-center">
                            {matchingOpt && firstGroup && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOption(
                                    firstGroup.id,
                                    matchingOpt.id,
                                  )
                                }
                                className="inline-flex rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title="Xóa dòng biến thể này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 4: VẬN CHUYỂN & ĐÓNG GÓI
          ========================================================= */}
          <section
            id="sec-shipping"
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 border-b pb-3">
              <h2 className="text-base font-bold text-foreground">
                Vận chuyển &amp; Kích thước gói hàng
              </h2>
              <p className="text-xs text-muted-foreground">
                Dùng để tính phí vận chuyển tự động cho đơn vị giao hàng TikTok
                Shop
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">
                  <span className="text-destructive">*</span> Trọng lượng sau
                  đóng gói (kg)
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min={0.01}
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Chiều dài (cm)</label>
                <Input
                  type="number"
                  min={1}
                  value={packageLength}
                  onChange={(e) => setPackageLength(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Chiều rộng (cm)</label>
                <Input
                  type="number"
                  min={1}
                  value={packageWidth}
                  onChange={(e) => setPackageWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Chiều cao (cm)</label>
                <Input
                  type="number"
                  min={1}
                  value={packageHeight}
                  onChange={(e) => setPackageHeight(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Live Mobile Preview Column (3 cols) */}
        <div className="xl:col-span-3">
          <div className="sticky top-16 space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="border-b bg-muted/40 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Xem trước hiển thị TikTok Shop
                </p>
              </div>

              {/* Product Cover Image */}
              <div className="relative aspect-square bg-muted">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Chưa có ảnh bìa
                  </div>
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  1/{Math.max(1, images.length)}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {summaryMetrics.minPrice === summaryMetrics.maxPrice
                      ? `${summaryMetrics.minPrice.toLocaleString('vi-VN')} ₫`
                      : `${summaryMetrics.minPrice.toLocaleString('vi-VN')} ₫ - ${summaryMetrics.maxPrice.toLocaleString('vi-VN')} ₫`}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                    {title || 'Tên sản phẩm sẽ hiển thị tại đây...'}
                  </p>
                </div>

                {/* Variations pill preview */}
                <div className="space-y-1.5 border-t pt-2.5">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {variationGroups[0]?.name || 'Biến thể'} (
                    {activeSkuRows.length} lựa chọn):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeSkuRows.slice(0, 6).map((r) => (
                      <span
                        key={r.key}
                        className="rounded border bg-muted/40 px-2 py-0.5 text-[10px] font-medium"
                      >
                        {r.key}
                      </span>
                    ))}
                    {activeSkuRows.length > 6 && (
                      <span className="rounded border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{activeSkuRows.length - 6} khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Tổng tồn kho:</span>
                    <p className="font-bold text-foreground">
                      {summaryMetrics.totalStock} sản phẩm
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thương hiệu:</span>
                    <p className="truncate font-bold text-foreground">
                      {brandName || 'No Brand'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          STICKY BOTTOM ACTION BAR (Hủy / Lưu bản nháp / Gửi xét duyệt / Đăng sản phẩm)
      ========================================================= */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-6 py-3.5 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>
              Biến thể SKU:{' '}
              <strong className="text-teal-600">{activeSkuRows.length}</strong>
            </span>
            <span className="text-muted-foreground">•</span>
            <span>
              Tổng Hàng có sẵn:{' '}
              <strong className="text-foreground">
                {summaryMetrics.totalStock}
              </strong>
            </span>
            <span className="text-muted-foreground">•</span>
            <span>
              Khoảng giá:{' '}
              <strong className="text-rose-600">
                {summaryMetrics.minPrice.toLocaleString('vi-VN')}₫ –{' '}
                {summaryMetrics.maxPrice.toLocaleString('vi-VN')}₫
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
              disabled={createProductMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmitProduct('DRAFT')}
              disabled={createProductMutation.isPending}
            >
              Lưu bản nháp
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmitProduct('PENDING')}
              disabled={createProductMutation.isPending}
              className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
            >
              Gửi xét duyệt
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmitProduct('ACTIVE')}
              disabled={createProductMutation.isPending}
              className="gap-1.5 bg-teal-600 text-white hover:bg-teal-700"
            >
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Đăng sản phẩm (Trên kệ)
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={Boolean(previewImageUrl)}
        onOpenChange={(open) => !open && setPreviewImageUrl(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xem trước hình ảnh sản phẩm</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <div className="overflow-hidden rounded-xl border">
              <img
                src={previewImageUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Option Image Modal */}
      <Dialog
        open={Boolean(editingImageForOption)}
        onOpenChange={(open) => !open && setEditingImageForOption(null)}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              Ảnh đại diện biến thể: {editingImageForOption?.label}
            </DialogTitle>
          </DialogHeader>
          {editingImageForOption && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">URL Hình ảnh</label>
                <Input
                  value={editingImageForOption.currentUrl}
                  onChange={(e) =>
                    setEditingImageForOption((prev) =>
                      prev ? { ...prev, currentUrl: e.target.value } : null,
                    )
                  }
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  Hoặc chọn nhanh mẫu ảnh Anime:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {ANIME_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setEditingImageForOption((prev) =>
                          prev ? { ...prev, currentUrl: preset.url } : null,
                        )
                      }
                      className="overflow-hidden rounded-lg border p-1 text-center hover:border-teal-500"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="aspect-square w-full rounded object-cover"
                      />
                      <span className="mt-1 block truncate text-[10px]">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingImageForOption(null)}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  onClick={() => {
                    handleOptionImageChange(
                      editingImageForOption.groupId,
                      editingImageForOption.optionId,
                      editingImageForOption.currentUrl.trim(),
                    );
                    setEditingImageForOption(null);
                  }}
                >
                  Lưu ảnh biến thể
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
