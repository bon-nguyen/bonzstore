import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  Sparkles,
  Tag,
  FileText,
  Layers,
  Truck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
  HelpCircle,
  Loader2,
  Eye,
  Package,
  GripVertical,
  Wand2,
  ChevronRight,
  Upload,
  Star,
  FolderTree,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { RichTextEditor } from '../components/ui/rich-text-editor';
import {
  useCategories,
  useCreateProduct,
} from '../features/catalog/hooks/useCatalog';
import {
  TIKTOK_TITLE_FORMULA,
  TIKTOK_AI_RULES_FILE_PATH,
  evaluateProductTitleSeo,
  generateAiProductTitles,
  generateAiProductDescriptionHtml,
  type AiProductContext,
} from '../features/catalog/constants/tiktok-ai-rules';
import {
  productFormSchema,
  DEFAULT_PRODUCT_FORM_VALUES,
  buildSynchronizedSkus,
  type ProductFormValues,
} from '../features/catalog/schemas/product-form.schema';
import { cn, formatCurrencyVND } from '../lib/utils';

type SectionId = 'basic_info' | 'sale_properties' | 'shipping';

const NAV_SECTIONS: {
  id: SectionId;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'basic_info',
    label: 'Thông tin cơ bản',
    subLabel: 'Ảnh, Tên AI, Hạng mục 2 cấp, Thuộc tính & Mô tả',
    icon: FileText,
  },
  {
    id: 'sale_properties',
    label: 'Thông tin bán hàng',
    subLabel: 'Kéo thả Biến thể, Giá bán, Kho & SKU',
    icon: Layers,
  },
  {
    id: 'shipping',
    label: 'Vận chuyển',
    subLabel: 'Trọng lượng & Kích thước đóng gói',
    icon: Truck,
  },
];

// Danh sách thương hiệu Anime / Figure phổ biến
const ANIME_BRAND_OPTIONS = [
  'No Brand (Không có thương hiệu)',
  'Bandai Spirits / Banpresto',
  'Good Smile Company (GSC)',
  'Kotobukiya',
  'MegaHouse',
  'Taito Prize',
  'SEGA Goods',
  'FuRyu',
  'Aniplex+',
  'Max Factory',
  'Kadokawa',
  'NXB Kim Đồng / IPM / Trẻ',
];

// Danh sách thuộc tính đặc trưng ngành hàng Anime & Mô hình trên TikTok Shop
const ANIME_ATTRIBUTE_FIELDS: {
  key: string;
  label: string;
  required?: boolean;
  type: 'select' | 'text';
  placeholder: string;
  options?: string[];
  tooltip?: string;
}[] = [
  {
    key: 'Series Anime',
    label: 'Series Anime / Manga / Game',
    required: true,
    type: 'select',
    placeholder: 'Chọn bộ Anime / Game',
    options: [
      'One Piece (Đảo Hải Tặc)',
      'Jujutsu Kaisen (Chú Thuật Hồi Chiến)',
      'Demon Slayer: Kimetsu no Yaiba (Thanh Gươm Diệt Quỷ)',
      'Dragon Ball Z / Super (7 Viên Ngọc Rồng)',
      'Naruto Shippuden',
      'Chainsaw Man',
      'Mobile Suit Gundam',
      'Spy x Family',
      'Attack on Titan',
      'Genshin Impact / Honkai: Star Rail',
      'Blue Lock',
      'My Hero Academia',
      'Bleach',
      'Khác (Anime / Game tổng hợp)',
    ],
    tooltip: 'Giúp khách hàng tìm kiếm theo bộ phim/truyện yêu thích trên TikTok Shop',
  },
  {
    key: 'Chất liệu',
    label: 'Chất liệu chính',
    required: true,
    type: 'select',
    placeholder: 'Chọn chất liệu',
    options: [
      'Nhựa PVC & ABS cao cấp',
      'Nhựa ABS (Model Kit / Gunpla)',
      'Resin (GK Statue)',
      'Acrylic trong suốt (Standee / Móc khóa)',
      'Vải Bông mềm / PP Cotton (Plushie)',
      'Vải Polyester / Kim tuyến (Cosplay)',
      'Giấy Couche / Giấy Bãi Bằng (Manga / Artbook)',
      'Kim loại / Hợp kim kẽm',
    ],
  },
  {
    key: 'Tỷ lệ (Scale)',
    label: 'Tỷ lệ mô hình (Scale)',
    type: 'select',
    placeholder: 'Chọn tỷ lệ',
    options: [
      'Non-scale (Không chia tỷ lệ)',
      '1/7 Scale',
      '1/8 Scale',
      '1/6 Scale',
      '1/4 Scale',
      '1/12 Scale (Action Figure)',
      'HG 1/144 (Gunpla)',
      'RG 1/144 (Gunpla)',
      'MG 1/100 (Gunpla)',
      'PG 1/60 (Gunpla)',
      'Chibi / Nendoroid (~10cm)',
    ],
  },
  {
    key: 'Chiều cao (cm)',
    label: 'Chiều cao sản phẩm (cm)',
    type: 'text',
    placeholder: 'VD: 24',
    tooltip: 'Chiều cao thực tế tính cả đế (base) bằng centimet (dùng cho công thức tên AI)',
  },
  {
    key: 'Xuất xứ',
    label: 'Xuất xứ (Origin)',
    required: true,
    type: 'select',
    placeholder: 'Chọn xuất xứ',
    options: [
      'Nhật Bản (Japan)',
      'Trung Quốc Đại Lục (Mainland China)',
      'Việt Nam',
      'Hàn Quốc',
      'Đài Loan',
    ],
  },
  {
    key: 'Tình trạng hộp',
    label: 'Quy cách đóng gói / Hộp',
    type: 'select',
    placeholder: 'Chọn quy cách',
    options: [
      'Mới 100% Fullbox nguyên seal',
      'Fullbox (Đã mở kiểm tra phụ kiện)',
      'Nobox (Không kèm hộp màu, bọc chống sốc kỹ)',
      'Blindbox (Hộp mù ngẫu nhiên)',
    ],
  },
  {
    key: 'Độ tuổi khuyến nghị',
    label: 'Độ tuổi sử dụng',
    type: 'select',
    placeholder: 'Chọn độ tuổi',
    options: [
      'Từ 14 tuổi trở lên (14+)',
      'Từ 15 tuổi trở lên (15+ - Sưu tầm)',
      'Từ 8 tuổi trở lên (8+)',
      'Mọi lứa tuổi',
    ],
  },
];

// Kho ảnh mẫu nhanh để demo/chọn nhanh trên giao diện
const SAMPLE_ANIME_IMAGES = [
  {
    label: 'Figure Anime 01',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
  },
  {
    label: 'Gundam Mecha 02',
    url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
  },
  {
    label: 'Collectible Toy 03',
    url: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=800&q=80',
  },
  {
    label: 'Manga Books 04',
    url: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80',
  },
];

export function CreateProductPage() {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const createProductMutation = useCreateProduct();

  // ─── 1. Quản lý Form & Validation với react-hook-form + zod ───
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: DEFAULT_PRODUCT_FORM_VALUES,
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isDirty },
  } = form;

  const images = watch('images');
  const title = watch('title');
  const parentCategoryId = watch('parentCategoryId');
  const categoryId = watch('categoryId');
  const brandName = watch('brandName');
  const characterName = watch('characterName');
  const attributes = watch('attributes');
  const descriptionHtml = watch('descriptionHtml');
  const variationGroups = watch('variationGroups');
  const skus = watch('skus');
  const packageWeight = watch('packageWeight');
  const packageLength = watch('packageLength');
  const packageWidth = watch('packageWidth');
  const packageHeight = watch('packageHeight');

  // Navigation & Section Tracking
  const [activeSection, setActiveSection] = useState<SectionId>('basic_info');

  // Refs cho upload ảnh từ máy tính
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);

  // State kéo thả sắp xếp thứ tự ảnh sản phẩm
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);

  // State kéo thả sắp xếp thứ tự Option Biến thể & Dòng SKU
  const [draggedOption, setDraggedOption] = useState<{
    groupId: string;
    index: number;
  } | null>(null);
  const [dragOverOption, setDragOverOption] = useState<{
    groupId: string;
    index: number;
  } | null>(null);

  const [draggedSkuIdx, setDraggedSkuIdx] = useState<number | null>(null);
  const [dragOverSkuIdx, setDragOverSkuIdx] = useState<number | null>(null);

  // Modals quản lý ảnh
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  const [editingImageForOption, setEditingImageForOption] = useState<{
    groupId: string;
    optionId: string;
  } | null>(null);
  const [optionImageUrlInput, setOptionImageUrlInput] = useState('');

  // Panel AI Gợi ý Tên & Mô tả
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showAiRulesDialog, setShowAiRulesDialog] = useState(false);

  // Thiết lập hàng loạt (Batch Apply) cho bảng SKU
  const [batchPrice, setBatchPrice] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchSkuPrefix, setBatchSkuPrefix] = useState('');

  // Cảnh báo rời trang khi có thay đổi chưa lưu ("Changes you made may not be saved.")
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [unsavedDialogState, setUnsavedDialogState] = useState<{
    open: boolean;
    targetPath: string | null;
  }>({ open: false, targetPath: null });

  const hasUnsavedChanges = isDirty && !isSubmittedSuccess && !createProductMutation.isPending;

  // ─── 7. Cảnh báo khi tắt trình duyệt / reload hoặc bấm Back ───
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = 'Changes you made may not be saved.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Chặn nút Back của trình duyệt (popstate) khi form đang dirty
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    window.history.pushState({ bonzCreateProductGuard: true }, '', window.location.href);

    const handlePopState = () => {
      setUnsavedDialogState({
        open: true,
        targetPath: '/products',
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleSafeNavigate = useCallback(
    (targetPath: string) => {
      if (hasUnsavedChanges) {
        setUnsavedDialogState({ open: true, targetPath });
      } else {
        navigate(targetPath);
      }
    },
    [hasUnsavedChanges, navigate]
  );

  // ─── 4. Phân cấp Hạng mục 2 bước: Hạng mục Cha (Cấp 1) -> Hạng mục Con (Cấp 2) ───
  const parentCategories = useMemo(
    () => categories.filter((c) => c.level === 1 || !c.parentId),
    [categories]
  );

  const childCategoriesOfSelectedParent = useMemo(() => {
    if (!parentCategoryId) return [];
    return categories.filter((c) => c.parentId === parentCategoryId);
  }, [categories, parentCategoryId]);

  const selectedParentCategory = useMemo(
    () => parentCategories.find((c) => c.id === parentCategoryId) || null,
    [parentCategories, parentCategoryId]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) || null,
    [categories, categoryId]
  );

  // Tự động chọn Hạng mục Cha & Hạng mục Con mặc định lần đầu khi tải xong danh mục
  useEffect(() => {
    if (categories.length > 0 && !parentCategoryId && !categoryId) {
      const defaultParent =
        parentCategories.find((p) => p.localName.toLowerCase().includes('mô hình')) ||
        parentCategories[0];
      if (defaultParent) {
        const firstChild = categories.find((c) => c.parentId === defaultParent.id);
        setValue('parentCategoryId', defaultParent.id, { shouldDirty: false });
        if (firstChild) {
          setValue('categoryId', firstChild.id, { shouldDirty: false });
        }
      }
    }
  }, [categories, parentCategories, parentCategoryId, categoryId, setValue]);

  const handleSelectParentCategory = (nextParentId: string) => {
    setValue('parentCategoryId', nextParentId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    // Reset hạng mục con để bắt buộc người dùng chọn Bước 2 thuộc Hạng mục Cha mới
    setValue('categoryId', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectChildCategory = (nextChildId: string) => {
    setValue('categoryId', nextChildId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ─── 3. Ngữ cảnh AI & Đánh giá SEO Tiêu đề theo thời gian thực ───
  const aiContext: AiProductContext = useMemo(
    () => ({
      title,
      brandName,
      parentCategoryName: selectedParentCategory?.localName,
      categoryName: selectedCategory?.localName,
      animeSeries: attributes['Series Anime'],
      characterName:
        characterName ||
        variationGroups[0]?.options.find((o) => o.value.trim())?.value ||
        '',
      material: attributes['Chất liệu'],
      scale: attributes['Tỷ lệ (Scale)'],
      heightCm: attributes['Chiều cao (cm)'],
      origin: attributes['Xuất xứ'],
      condition: attributes['Tình trạng hộp'],
      ageWarning: attributes['Độ tuổi khuyến nghị'],
      primarySku: skus[0]?.sellerSku || '',
      variantNames: variationGroups
        .flatMap((g) => g.options.map((o) => o.value.trim()))
        .filter(Boolean),
      packageWeightGrams: packageWeight,
      packageDimensions: `${packageLength}x${packageWidth}x${packageHeight} cm`,
    }),
    [
      title,
      brandName,
      selectedParentCategory,
      selectedCategory,
      attributes,
      characterName,
      variationGroups,
      skus,
      packageWeight,
      packageLength,
      packageWidth,
      packageHeight,
    ]
  );

  const titleSeoEvaluation = useMemo(
    () => evaluateProductTitleSeo(title, aiContext),
    [title, aiContext]
  );

  const aiTitleCandidates = useMemo(
    () => generateAiProductTitles(aiContext),
    [aiContext]
  );

  const handleApplyAiTitle = (candidateTitle: string) => {
    setValue('title', candidateTitle, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success('Đã áp dụng tên sản phẩm chuẩn công thức AI TikTok Shop');
  };

  const handleGenerateAiDescription = () => {
    const generatedHtml = generateAiProductDescriptionHtml(aiContext);
    setValue('descriptionHtml', generatedHtml, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success('AI đã tạo mô tả sản phẩm chuẩn TikTok Shop từ thông số của bạn!');
  };

  // ─── 2. Hoàn thiện thao tác Thêm ảnh (Tải file từ máy, Kéo thả file, URL, Kéo thả đổi vị trí, Đặt làm bìa) ───
  const readFilesAsDataUrls = async (fileList: FileList | File[]): Promise<string[]> => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) {
      toast.error('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WEBP)');
      return [];
    }

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          if (file.size > 8 * 1024 * 1024) {
            toast.warning(`Ảnh "${file.name}" lớn hơn 8MB, đã bỏ qua.`);
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
          reader.readAsDataURL(file);
        })
    );

    const results = await Promise.all(readers);
    return results.filter(Boolean);
  };

  const handleUploadLocalImages = async (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = 9 - images.length;
    if (remainingSlots <= 0) {
      toast.warning('Tối đa 9 ảnh sản phẩm theo chuẩn TikTok Shop');
      return;
    }

    const dataUrls = await readFilesAsDataUrls(fileList);
    if (dataUrls.length === 0) return;

    const nextImages = [...images];
    let addedCount = 0;
    for (const url of dataUrls) {
      if (nextImages.length >= 9) break;
      if (!nextImages.includes(url)) {
        nextImages.push(url);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });
      toast.success(`Đã tải lên ${addedCount} hình ảnh sản phẩm`);
    }
  };

  const handleAddImageUrl = (urlToAdd?: string) => {
    const target = (urlToAdd ?? newImageUrl).trim();
    if (!target) return;
    if (images.length >= 9) {
      toast.warning('Tối đa 9 ảnh sản phẩm theo chuẩn TikTok Shop');
      return;
    }
    if (images.includes(target)) {
      toast.info('Ảnh này đã có trong danh sách');
      return;
    }
    setValue('images', [...images, target], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setNewImageUrl('');
    toast.success('Đã thêm hình ảnh sản phẩm');
  };

  const handleRemoveImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
  };

  const handleSetCoverImage = (idx: number) => {
    if (idx === 0 || idx < 0 || idx >= images.length) return;
    const next = [...images];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
    toast.success('Đã đặt ảnh này làm Ảnh bìa chính');
  };

  const handleReorderImages = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const next = [...images];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
  };

  // Upload ảnh từ máy cho từng Option biến thể
  const handleUploadVariantOptionFile = async (fileList: FileList | null) => {
    if (!fileList || !editingImageForOption) return;
    const urls = await readFilesAsDataUrls(fileList);
    if (urls[0]) {
      setOptionImageUrlInput(urls[0]);
      toast.success('Đã tải ảnh cho phân loại biến thể');
    }
  };

  // ─── 6. Quản lý Biến thể & Kéo thả thay đổi thứ tự Index Biến thể / SKU ───
  const syncVariationGroupsAndSkus = (nextGroups: ProductFormValues['variationGroups']) => {
    setValue('variationGroups', nextGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const nextSkus = buildSynchronizedSkus(nextGroups, skus);
    setValue('skus', nextSkus, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleAddVariationGroup = () => {
    if (variationGroups.length >= 2) {
      toast.info('TikTok Shop hỗ trợ tối đa 2 cấp nhóm biến thể (VD: Nhân vật & Quy cách hộp)');
      return;
    }
    const nextGroups = [
      ...variationGroups,
      {
        id: `var-${Date.now()}`,
        name: variationGroups.length === 0 ? 'Nhân vật / Phiên bản' : 'Quy cách hộp',
        options: [
          { id: `opt-${Date.now()}-1`, value: 'Fullbox Mới 100%', imageUrl: '' },
          { id: `opt-${Date.now()}-2`, value: '', imageUrl: '' },
        ],
      },
    ];
    syncVariationGroupsAndSkus(nextGroups);
  };

  const handleRemoveVariationGroup = (groupId: string) => {
    const nextGroups = variationGroups.filter((g) => g.id !== groupId);
    syncVariationGroupsAndSkus(nextGroups);
  };

  const handleUpdateGroupName = (groupId: string, name: string) => {
    const nextGroups = variationGroups.map((g) => (g.id === groupId ? { ...g, name } : g));
    syncVariationGroupsAndSkus(nextGroups);
  };

  const handleUpdateOptionValue = (groupId: string, optionId: string, value: string) => {
    const nextGroups = variationGroups.map((g) => {
      if (g.id !== groupId) return g;
      const updatedOptions = g.options.map((o) =>
        o.id === optionId ? { ...o, value } : o
      );
      const lastOpt = updatedOptions[updatedOptions.length - 1];
      if (lastOpt && lastOpt.value.trim() !== '') {
        updatedOptions.push({
          id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          value: '',
          imageUrl: '',
        });
      }
      return { ...g, options: updatedOptions };
    });
    syncVariationGroupsAndSkus(nextGroups);
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    const nextGroups = variationGroups.map((g) => {
      if (g.id !== groupId) return g;
      const filtered = g.options.filter((o) => o.id !== optionId);
      if (filtered.length === 0) {
        filtered.push({ id: `opt-${Date.now()}`, value: '', imageUrl: '' });
      }
      return { ...g, options: filtered };
    });
    syncVariationGroupsAndSkus(nextGroups);
  };

  // Kéo thả hoặc bấm nút Lên/Xuống để đổi thứ tự index của Option trong nhóm biến thể
  const handleMoveVariationOption = (
    groupId: string,
    fromIdx: number,
    toIdx: number
  ) => {
    const group = variationGroups.find((g) => g.id === groupId);
    if (!group) return;
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= group.options.length ||
      toIdx >= group.options.length
    ) {
      return;
    }

    const nextGroups = variationGroups.map((g) => {
      if (g.id !== groupId) return g;
      const reordered = [...g.options];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      return { ...g, options: reordered };
    });

    syncVariationGroupsAndSkus(nextGroups);
    toast.success(`Đã cập nhật thứ tự phân loại #${toIdx + 1}`);
  };

  // Kéo thả hoặc bấm nút Lên/Xuống để đổi thứ tự index của dòng SKU trong bảng
  const handleMoveSkuRow = (fromIdx: number, toIdx: number) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= skus.length ||
      toIdx >= skus.length
    ) {
      return;
    }
    const nextSkus = [...skus];
    const [moved] = nextSkus.splice(fromIdx, 1);
    nextSkus.splice(toIdx, 0, moved);
    setValue('skus', nextSkus, { shouldDirty: true, shouldValidate: true });
    toast.success(`Đã di chuyển dòng biến thể sang vị trí #${toIdx + 1}`);
  };

  const handleSaveOptionImage = () => {
    if (!editingImageForOption) return;
    const { groupId, optionId } = editingImageForOption;
    const nextGroups = variationGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            options: g.options.map((o) =>
              o.id === optionId ? { ...o, imageUrl: optionImageUrlInput.trim() } : o
            ),
          }
        : g
    );
    setValue('variationGroups', nextGroups, { shouldDirty: true });
    setEditingImageForOption(null);
    setOptionImageUrlInput('');
  };

  const handleApplyBatchSkus = () => {
    const nextSkus = skus.map((sku, idx) => ({
      ...sku,
      price: batchPrice.trim() !== '' ? batchPrice.trim() : sku.price,
      quantity: batchQuantity.trim() !== '' ? batchQuantity.trim() : sku.quantity,
      sellerSku:
        batchSkuPrefix.trim() !== ''
          ? `${batchSkuPrefix.trim()}-${String(idx + 1).padStart(2, '0')}`
          : sku.sellerSku,
    }));
    setValue('skus', nextSkus, { shouldDirty: true, shouldValidate: true });
    toast.success(`Đã áp dụng hàng loạt cho ${skus.length} dòng biến thể SKU`);
  };

  const handleUpdateSkuField = (
    skuId: string,
    field: 'price' | 'quantity' | 'sellerSku',
    value: string
  ) => {
    const nextSkus = skus.map((s) => (s.id === skuId ? { ...s, [field]: value } : s));
    setValue('skus', nextSkus, { shouldDirty: true, shouldValidate: true });
  };

  // Scroll spy tới section
  const scrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Đánh giá hoàn thành từng phần
  const sectionStatus = useMemo(() => {
    const basicOk =
      images.length > 0 &&
      title.trim().length >= 15 &&
      Boolean(parentCategoryId) &&
      Boolean(categoryId) &&
      !errors.images &&
      !errors.title &&
      !errors.parentCategoryId &&
      !errors.categoryId &&
      !errors.descriptionHtml;

    const saleOk =
      skus.length > 0 &&
      !errors.skus &&
      skus.every(
        (s) =>
          Number(s.price) >= 1000 &&
          Number(s.quantity) >= 0 &&
          s.sellerSku.trim().length > 0
      );

    const shippingOk =
      Number(packageWeight) > 0 &&
      !errors.packageWeight &&
      !errors.packageLength &&
      !errors.packageWidth &&
      !errors.packageHeight;

    return {
      basic_info: basicOk,
      sale_properties: saleOk,
      shipping: shippingOk,
    };
  }, [
    images.length,
    title,
    parentCategoryId,
    categoryId,
    skus,
    packageWeight,
    errors,
  ]);

  const totalInventory = useMemo(
    () => skus.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0),
    [skus]
  );

  const minPrice = useMemo(() => {
    const prices = skus.map((s) => Number(s.price) || 0).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [skus]);

  // ─── Submit Form Tạo sản phẩm ───
  const submitProductWithMode = async (mode: 'publish' | 'draft') => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Vui lòng kiểm tra lại các trường báo đỏ chưa hợp lệ trên biểu mẫu.');
      return;
    }

    const values = form.getValues();
    const primarySku = values.skus[0];

    createProductMutation.mutate(
      {
        title: values.title.trim(),
        categoryId: values.categoryId,
        brandName: values.brandName,
        descriptionHtml: values.descriptionHtml.trim(),
        imageUrl: values.images[0],
        images: values.images,
        sellerSku: primarySku.sellerSku.trim() || `FIG-${Date.now()}`,
        originalPrice: Number(primarySku.price),
        salePrice: Number(primarySku.price),
        stockQuantity: totalInventory,
        sourcePlatform: 'TIKTOK_SHOP',
        status: mode === 'publish' ? 'ACTIVE' : 'DRAFT',
        packageWeight: Number(values.packageWeight) || 500,
        attributes: Object.entries(values.attributes)
          .filter(([, v]) => Boolean(v))
          .map(([name, value]) => ({ name, value })),
        skus: values.skus.map((s) => ({
          sellerSku: s.sellerSku.trim(),
          originalPrice: Number(s.price),
          salePrice: Number(s.price),
          stockQuantity: Number(s.quantity),
          salesAttributes: s.optionCombo.map((val, idx) => ({
            name: values.variationGroups[idx]?.name || `Nhóm ${idx + 1}`,
            value_name: val,
          })),
        })),
      },
      {
        onSuccess: () => {
          setIsSubmittedSuccess(true);
          reset(values);
          navigate('/products');
        },
      }
    );
  };

  const activeVariationGroups = useMemo(
    () =>
      variationGroups
        .map((g) => ({
          ...g,
          validOptions: g.options.filter((o) => o.value.trim() !== ''),
        }))
        .filter((g) => g.name.trim() !== '' && g.validOptions.length > 0),
    [variationGroups]
  );

  return (
    <div className="min-h-full pb-28">
      {/* Hidden File Inputs cho Upload từ máy tính */}
      <input
        ref={mainFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleUploadLocalImages(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={variantFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleUploadVariantOptionFile(e.target.files);
          e.target.value = '';
        }}
      />

      {/* ─── TOP HEADER BAR (Sticky) ─── */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => handleSafeNavigate('/products')}
              title="Quay lại danh sách sản phẩm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => handleSafeNavigate('/products')}
                  className="hover:text-foreground transition-colors"
                >
                  Quản lý sản phẩm
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">Thêm sản phẩm mới</span>
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h1 className="text-lg font-bold tracking-tight">Thêm sản phẩm mới</h1>
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                  TikTok Shop Seller Standard
                </span>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Chưa lưu thay đổi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thanh chỉ báo tiến độ 3 bước + Điểm SEO AI */}
          <div className="hidden md:flex items-center gap-5 text-xs">
            {NAV_SECTIONS.map((sec, idx) => {
              const done = sectionStatus[sec.id];
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    activeSection === sec.id
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                      done
                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                        : activeSection === sec.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? '✓' : idx + 1}
                  </span>
                  <span>{sec.label}</span>
                </button>
              );
            })}

            <div className="h-4 w-px bg-border" />

            <button
              type="button"
              onClick={() => setShowAiRulesDialog(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 font-medium transition-colors"
              title="Xem quy tắc AI đặt tên chuẩn TikTok Shop"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Điểm SEO AI: {titleSeoEvaluation.score}/100</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN 3-COLUMN TIKTOK SHOP LAYOUT ─── */}
      <form
        onSubmit={handleSubmit(() => submitProductWithMode('publish'))}
        className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* 1. LEFT SIDEBAR NAVIGATION (2 cols) */}
        <aside className="hidden lg:block lg:col-span-2 sticky top-24 space-y-3">
          <div className="rounded-xl border border-border bg-card p-2 shadow-sm space-y-1">
            {NAV_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              const isDone = sectionStatus[sec.id];
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-2.5 group',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                      : 'hover:bg-muted/60 text-foreground/80'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs leading-tight truncate">{sec.label}</span>
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                      {sec.subLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Gợi ý chất lượng chuẩn TikTok Shop */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Chuẩn SEO TikTok</span>
              </div>
              <span
                className={cn(
                  'text-[11px] font-bold px-1.5 py-0.5 rounded',
                  titleSeoEvaluation.score >= 80
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : titleSeoEvaluation.score >= 50
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'bg-destructive/15 text-destructive'
                )}
              >
                {titleSeoEvaluation.score}/100
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className={images.length >= 3 ? 'text-emerald-500' : 'text-amber-500'}>
                  ●
                </span>
                <span>Đăng từ 3–9 ảnh vuông (1:1), kéo thả ảnh đẹp nhất làm Ảnh bìa.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  className={
                    titleSeoEvaluation.score >= 80 ? 'text-emerald-500' : 'text-amber-500'
                  }
                >
                  ●
                </span>
                <span>
                  Tên theo công thức: <strong>[Thương hiệu] + Loại + Series + Nhân vật + Size + SKU</strong>.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  className={
                    parentCategoryId && categoryId ? 'text-emerald-500' : 'text-amber-500'
                  }
                >
                  ●
                </span>
                <span>Chọn đúng Hạng mục Cha (Cấp 1) trước rồi tới Hạng mục Con (Cấp 2).</span>
              </li>
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-7 text-[11px] gap-1"
              onClick={() => setShowAiRulesDialog(true)}
            >
              <BookOpen className="h-3 w-3 text-primary" />
              Xem File Quy tắc AI
            </Button>
          </div>
        </aside>

        {/* 2. CENTER FORM CONTENT (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ════════════════════════════════════════════════════════════════
              SECTION 1: THÔNG TIN CƠ BẢN (#basic_info)
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="basic_info"
            onMouseEnter={() => setActiveSection('basic_info')}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Thông tin cơ bản</span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                    Basic Information
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hình ảnh sản phẩm, tên chuẩn công thức AI TikTok Shop, hạng mục 2 cấp và thông số kỹ thuật
                </p>
              </div>
              {sectionStatus.basic_info && (
                <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Đã hoàn tất
                </span>
              )}
            </div>

            <div className="p-6 space-y-7">
              {/* 1.1 HÌNH ẢNH SẢN PHẨM (Tối đa 9 ảnh 1:1 - Hỗ trợ Upload File, Kéo thả file, Kéo thả đổi vị trí, Đặt làm bìa) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="text-destructive">*</span>
                    <span>Hình ảnh sản phẩm</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({images.length}/9 ảnh)
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => mainFileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      Tải ảnh từ máy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => setImageModalOpen(true)}
                    >
                      <ImagePlus className="h-3.5 w-3.5 text-primary" />
                      Dán URL / Ảnh mẫu
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Kéo thả tệp ảnh trực tiếp từ máy tính vào khung bên dưới, hoặc{' '}
                  <strong>kéo thả các ô ảnh để đổi thứ tự</strong> (ô đầu tiên là{' '}
                  <span className="text-primary font-medium">Ảnh bìa</span>).
                </p>

                {/* Grid 9 ô ảnh kiểu TikTok Shop Seller Center + Vùng kéo thả file */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.types.includes('Files')) {
                      setIsDraggingOverDropzone(true);
                    }
                  }}
                  onDragLeave={() => setIsDraggingOverDropzone(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverDropzone(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleUploadLocalImages(e.dataTransfer.files);
                    }
                  }}
                  className={cn(
                    'grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1 p-3 rounded-xl border-2 border-dashed transition-all',
                    isDraggingOverDropzone
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : errors.images
                      ? 'border-destructive/60 bg-destructive/5'
                      : 'border-border/70 bg-muted/10'
                  )}
                >
                  {images.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl.slice(0, 40)}-${idx}`}
                      draggable
                      onDragStart={(e) => {
                        setDraggedImageIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedImageIdx !== null && draggedImageIdx !== idx) {
                          setDragOverImageIdx(idx);
                        }
                      }}
                      onDragLeave={() => setDragOverImageIdx(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedImageIdx !== null && draggedImageIdx !== idx) {
                          handleReorderImages(draggedImageIdx, idx);
                        }
                        setDraggedImageIdx(null);
                        setDragOverImageIdx(null);
                      }}
                      onDragEnd={() => {
                        setDraggedImageIdx(null);
                        setDragOverImageIdx(null);
                      }}
                      className={cn(
                        'group relative aspect-square rounded-xl border overflow-hidden bg-background transition-all cursor-grab active:cursor-grabbing',
                        idx === 0
                          ? 'ring-2 ring-primary border-primary'
                          : 'border-border hover:border-primary/50',
                        dragOverImageIdx === idx && 'scale-105 ring-2 ring-amber-500 border-amber-500'
                      )}
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh sản phẩm ${idx + 1}`}
                        className="h-full w-full object-cover pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/400x400/1e1e2e/FFF?text=Anime+Figure';
                        }}
                      />

                      {/* Badge số thứ tự góc trên trái */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-bold">
                        #{idx + 1}
                      </span>

                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[10px] font-semibold text-center py-0.5">
                          ★ Ảnh bìa chính
                        </span>
                      )}

                      {/* Hover actions: Xem lớn, Đặt làm bìa, Xóa */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewLightboxUrl(imgUrl)}
                            className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                            title="Xem phóng to"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="h-7 w-7 rounded-full bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center transition-colors"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(idx)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white text-[10px] font-semibold transition-colors"
                          >
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Đặt làm bìa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Nút Thêm ảnh mới */}
                  {images.length < 9 && (
                    <div className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-background/80 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 p-2 text-muted-foreground transition-all">
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors w-full flex-1"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-[11px] font-semibold text-center">
                          {images.length === 0 ? 'Tải ảnh bìa' : '+ Tải ảnh máy'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="text-[10px] text-primary hover:underline border-t border-border/60 pt-1 w-full text-center"
                      >
                        hoặc URL / Mẫu
                      </button>
                    </div>
                  )}
                </div>

                {errors.images && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* 1.2 TÊN SẢN PHẨM + TRỢ LÝ AI CHUẨN TIKTOK SHOP */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="product-title" className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Tên sản phẩm
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiRulesDialog(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      Quy tắc AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiPanel((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-primary/15 via-violet-500/15 to-fuchsia-500/15 text-primary hover:from-primary/25 hover:to-fuchsia-500/25 border border-primary/30 transition-all"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      {showAiPanel ? 'Ẩn Trợ lý AI' : '✨ Mở AI Gợi ý Tên'}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="product-title"
                    value={title}
                    maxLength={255}
                    onChange={(e) =>
                      setValue('title', e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder="VD: [Good Smile Company] Mô hình Figure PVC Jujutsu Kaisen Gojo Satoru Shibuya Ver. Cao 24cm - SKU FIG-JJK-GOJO-01"
                    className={cn(
                      'pr-20 h-11 text-sm',
                      errors.title && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono',
                      title.length > 0 && title.length < 25
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {title.length}/255
                  </span>
                </div>

                {errors.title && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.title.message}
                  </p>
                )}

                {/* Thanh kiểm tra 6 thành phần trong công thức chuẩn TikTok Shop */}
                <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold">
                        Công thức chuẩn TikTok Shop:{' '}
                        <code className="text-primary font-mono text-[11px]">
                          {TIKTOK_TITLE_FORMULA}
                        </code>
                      </span>
                    </div>
                    <span
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-[11px] font-semibold',
                        titleSeoEvaluation.score >= 85
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                          : titleSeoEvaluation.score >= 60
                          ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      Điểm SEO: {titleSeoEvaluation.score}/100 ({titleSeoEvaluation.levelLabel})
                    </span>
                  </div>

                  {/* 6 huy hiệu thành phần */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {titleSeoEvaluation.segments.map((seg, idx) => (
                      <div key={seg.key} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!seg.matched) {
                              const nextTitle = `${title.trim()} ${seg.placeholder}`.trim();
                              setValue('title', nextTitle, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              toast.info(`Đã chèn nhanh ${seg.label}: "${seg.placeholder}"`);
                            }
                          }}
                          title={
                            seg.matched
                              ? `Đã có ${seg.label}`
                              : `Nhấn để chèn nhanh ${seg.label} (${seg.placeholder}) vào tên sản phẩm`
                          }
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all',
                            seg.matched
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer'
                          )}
                        >
                          {seg.matched ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Plus className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                          <span>{seg.label}</span>
                        </button>
                        {idx < titleSeoEvaluation.segments.length - 1 && (
                          <span className="text-muted-foreground/50 text-xs font-bold">+</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bảng mở rộng AI Gợi ý Tên sản phẩm tự động */}
                  {showAiPanel && (
                    <div className="pt-2 border-t border-border/60 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">
                            Nhân vật / Phiên bản chính (để AI ghép vào tên)
                          </label>
                          <Input
                            value={characterName || ''}
                            onChange={(e) =>
                              setValue('characterName', e.target.value, {
                                shouldDirty: true,
                              })
                            }
                            placeholder="VD: Gojo Satoru Shibuya Ver."
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5"
                            onClick={() =>
                              handleApplyAiTitle(aiTitleCandidates[0].title)
                            }
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Tự động ghép Tên chuẩn Công thức 100%
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Gợi ý từ AI (tự động đồng bộ theo Thương hiệu, Hạng mục, Series Anime, Nhân vật, Chiều cao & SKU):
                        </p>
                        <div className="space-y-1.5">
                          {aiTitleCandidates.map((cand) => (
                            <div
                              key={cand.id}
                              className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-background/90 hover:border-primary/40 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                                  {cand.styleLabel}
                                </span>
                                <p className="text-xs font-medium text-foreground truncate">
                                  {cand.title}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs shrink-0 gap-1"
                                onClick={() => handleApplyAiTitle(cand.title)}
                              >
                                <Wand2 className="h-3 w-3 text-primary" />
                                Áp dụng
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 1.3 HẠNG MỤC SẢN PHẨM (CASCADING 2 CẤP: HẠNG MỤC CHA -> HẠNG MỤC CON) & THƯƠNG HIỆU */}
              <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold">
                      <span className="text-destructive">*</span> Hạng mục sản phẩm (Chọn theo 2 cấp: Cha → Con)
                    </label>
                  </div>
                  {selectedParentCategory && selectedCategory && (
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {selectedParentCategory.localName} › {selectedCategory.localName} (#
                      {selectedCategory.externalCategoryId})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BƯỚC 1: Chọn Hạng mục Cha (Level 1) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        1
                      </span>
                      <span>Bước 1: Hạng mục Cha (Cấp 1)</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={parentCategoryId}
                      disabled={isCategoriesLoading}
                      onChange={(e) => handleSelectParentCategory(e.target.value)}
                      placeholder={
                        isCategoriesLoading
                          ? 'Đang tải danh mục...'
                          : '-- Chọn Hạng mục Cha (Cấp 1) --'
                      }
                      options={parentCategories.map((parent) => ({
                        value: parent.id,
                        label: `${parent.localName} (${parent.childrenCount} hạng mục con)`,
                      }))}
                      className={cn(
                        'h-10 bg-background',
                        errors.parentCategoryId && 'border-destructive'
                      )}
                    />
                    {errors.parentCategoryId && (
                      <p className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.parentCategoryId.message}
                      </p>
                    )}
                  </div>

                  {/* BƯỚC 2: Chọn Hạng mục Con (Level 2 / Leaf Category) — Chỉ mở khi đã chọn Bước 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                          parentCategoryId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        2
                      </span>
                      <span>Bước 2: Hạng mục Con (Cấp 2 - Leaf)</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={categoryId}
                      disabled={
                        !parentCategoryId || childCategoriesOfSelectedParent.length === 0
                      }
                      onChange={(e) => handleSelectChildCategory(e.target.value)}
                      placeholder={
                        !parentCategoryId
                          ? 'Vui lòng chọn Hạng mục Cha ở Bước 1 trước'
                          : `-- Chọn Hạng mục Con thuộc ${selectedParentCategory?.localName || ''} --`
                      }
                      options={childCategoriesOfSelectedParent.map((child) => ({
                        value: child.id,
                        label: `${child.localName} (#${child.externalCategoryId || 'Leaf'})`,
                      }))}
                      className={cn(
                        'h-10 bg-background',
                        errors.categoryId && 'border-destructive'
                      )}
                    />
                    {errors.categoryId ? (
                      <p className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.categoryId.message}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        {parentCategoryId
                          ? `Có ${childCategoriesOfSelectedParent.length} hạng mục con khả dụng trong "${selectedParentCategory?.localName}".`
                          : 'Thao tác chọn Hạng mục Cha trước để mở khóa danh sách Hạng mục Con.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thương hiệu (Brand) */}
                <div className="pt-2 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <span>Thương hiệu (Brand)</span>
                      <span
                        title="Dùng cho thành phần [Thương hiệu] ở đầu tên sản phẩm chuẩn TikTok Shop"
                        className="text-muted-foreground cursor-help"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </label>
                    <Select
                      value={brandName}
                      onChange={(e) =>
                        setValue('brandName', e.target.value, { shouldDirty: true })
                      }
                      options={ANIME_BRAND_OPTIONS.map((b) => ({
                        value: b,
                        label: b,
                      }))}
                      className="h-10 bg-background"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Thương hiệu sẽ tự động được đưa vào thành phần{' '}
                    <code className="text-primary font-semibold">[Thương hiệu]</code> ở đầu tên sản
                    phẩm khi sử dụng AI Gợi ý.
                  </p>
                </div>
              </div>

              {/* 1.4 THUỘC TÍNH SẢN PHẨM (Product Attributes chuẩn TikTok Shop) */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Thuộc tính sản phẩm (Product Attributes)</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Điền đầy đủ thuộc tính giúp tăng khả năng hiển thị tự nhiên trên TikTok Shop và giúp AI viết tên/mô tả chính xác
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {Object.values(attributes).filter(Boolean).length}/
                    {ANIME_ATTRIBUTE_FIELDS.length} đã điền
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/70">
                  {ANIME_ATTRIBUTE_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        {field.required && <span className="text-destructive">*</span>}
                        <span>{field.label}</span>
                        {field.tooltip && (
                          <span
                            title={field.tooltip}
                            className="text-muted-foreground cursor-help"
                          >
                            <Info className="h-3 w-3" />
                          </span>
                        )}
                      </label>
                      {field.type === 'select' && field.options ? (
                        <Select
                          value={attributes[field.key] || ''}
                          onChange={(e) =>
                            setValue(
                              'attributes',
                              { ...attributes, [field.key]: e.target.value },
                              { shouldDirty: true }
                            )
                          }
                          placeholder={field.placeholder}
                          options={field.options.map((opt) => ({
                            value: opt,
                            label: opt,
                          }))}
                          className="h-9 text-xs bg-background"
                        />
                      ) : (
                        <Input
                          value={attributes[field.key] || ''}
                          onChange={(e) =>
                            setValue(
                              'attributes',
                              {
                                ...attributes,
                                [field.key]: e.target.value,
                              },
                              { shouldDirty: true }
                            )
                          }
                          placeholder={field.placeholder}
                          className="h-9 text-xs bg-background"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.5 MÔ TẢ SẢN PHẨM (Tích hợp Rich Text Editor + AI Viết mô tả) */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Mô tả sản phẩm (Rich Text Editor)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Hỗ trợ định dạng văn bản, chèn bảng thông số & AI viết bài tự động
                  </span>
                </div>

                <RichTextEditor
                  value={descriptionHtml}
                  onChange={(nextHtml) =>
                    setValue('descriptionHtml', nextHtml, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  onGenerateAiDescription={handleGenerateAiDescription}
                  error={errors.descriptionHtml?.message}
                />

                {errors.descriptionHtml && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.descriptionHtml.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 2: THÔNG TIN BÁN HÀNG (#sale_properties & #skus)
              Hỗ trợ kéo thả thay đổi thứ tự index biến thể & dòng SKU
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="sale_properties"
            onMouseEnter={() => setActiveSection('sale_properties')}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Thông tin bán hàng</span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                    Sales Information & Variations
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kéo thả hoặc bấm mũi tên để thay đổi thứ tự index biến thể. Bảng SKU bên dưới sẽ tự động đồng bộ.
                </p>
              </div>
              {sectionStatus.sale_properties && (
                <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  {skus.length} SKU hợp lệ
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* 2.1 DANH SÁCH NHÓM BIẾN THỂ (Kéo thả thay đổi thứ tự Index Option) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold">
                      Phân loại biến thể (Variations)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Kéo biểu tượng <GripVertical className="inline h-3.5 w-3.5" /> hoặc bấm nút Lên/Xuống để đổi thứ tự index phân loại
                    </p>
                  </div>
                  {variationGroups.length < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariationGroup}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm nhóm biến thể ({variationGroups.length}/2)
                    </Button>
                  )}
                </div>

                {variationGroups.map((group, groupIdx) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <span className="rounded bg-secondary px-2 py-1 text-xs font-semibold shrink-0">
                          Nhóm {groupIdx + 1}
                        </span>
                        <Input
                          value={group.name}
                          onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                          placeholder="Tên nhóm (VD: Nhân vật / Phiên bản, Kích thước)"
                          className="h-9 text-xs font-medium bg-background"
                        />
                      </div>

                      {variationGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariationGroup(group.id)}
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Xóa nhóm
                        </Button>
                      )}
                    </div>

                    {/* Các giá trị tùy chọn trong nhóm — hỗ trợ Kéo thả (Drag & Drop) + Nút Lên/Xuống */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Giá trị tùy chọn (Kéo thả dòng để đổi thứ tự Index #1, #2...; nhập giá trị để tự động mở thêm ô mới)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {group.options.map((opt, optIdx) => {
                          const isDraggingThis =
                            draggedOption?.groupId === group.id &&
                            draggedOption?.index === optIdx;
                          const isDragOverThis =
                            dragOverOption?.groupId === group.id &&
                            dragOverOption?.index === optIdx;

                          return (
                            <div
                              key={opt.id}
                              draggable
                              onDragStart={(e) => {
                                setDraggedOption({ groupId: group.id, index: optIdx });
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (
                                  draggedOption &&
                                  draggedOption.groupId === group.id &&
                                  draggedOption.index !== optIdx
                                ) {
                                  setDragOverOption({ groupId: group.id, index: optIdx });
                                }
                              }}
                              onDragLeave={() => setDragOverOption(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (
                                  draggedOption &&
                                  draggedOption.groupId === group.id &&
                                  draggedOption.index !== optIdx
                                ) {
                                  handleMoveVariationOption(
                                    group.id,
                                    draggedOption.index,
                                    optIdx
                                  );
                                }
                                setDraggedOption(null);
                                setDragOverOption(null);
                              }}
                              onDragEnd={() => {
                                setDraggedOption(null);
                                setDragOverOption(null);
                              }}
                              className={cn(
                                'flex items-center gap-1.5 bg-background p-2 rounded-lg border transition-all',
                                isDraggingThis && 'opacity-50 border-dashed border-primary',
                                isDragOverThis
                                  ? 'border-primary ring-2 ring-primary/25 bg-primary/5'
                                  : 'border-border'
                              )}
                            >
                              <div
                                className="flex items-center gap-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                                title="Kéo thả để thay đổi thứ tự index biến thể"
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                  #{optIdx + 1}
                                </span>
                              </div>

                              {/* Cho phép gắn ảnh minh họa cho Nhóm biến thể 1 */}
                              {groupIdx === 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingImageForOption({
                                      groupId: group.id,
                                      optionId: opt.id,
                                    });
                                    setOptionImageUrlInput(opt.imageUrl || '');
                                  }}
                                  className={cn(
                                    'h-8 w-8 rounded-md border flex items-center justify-center shrink-0 overflow-hidden transition-colors',
                                    opt.imageUrl
                                      ? 'border-primary'
                                      : 'border-dashed border-border hover:border-primary/60 text-muted-foreground'
                                  )}
                                  title="Thêm ảnh cho phân loại này"
                                >
                                  {opt.imageUrl ? (
                                    <img
                                      src={opt.imageUrl}
                                      alt={opt.value}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <ImagePlus className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}

                              <Input
                                value={opt.value}
                                onChange={(e) =>
                                  handleUpdateOptionValue(group.id, opt.id, e.target.value)
                                }
                                placeholder={
                                  optIdx === 0
                                    ? 'VD: Luffy Gear 5 (Fullbox)'
                                    : 'Nhập thêm phân loại...'
                                }
                                className="h-8 text-xs border-0 shadow-none focus-visible:ring-0 px-1.5"
                              />

                              {/* Nút di chuyển Lên / Xuống */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={optIdx === 0}
                                  onClick={() =>
                                    handleMoveVariationOption(group.id, optIdx, optIdx - 1)
                                  }
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                                  title="Đưa lên trên"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={optIdx === group.options.length - 1}
                                  onClick={() =>
                                    handleMoveVariationOption(group.id, optIdx, optIdx + 1)
                                  }
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                                  title="Đưa xuống dưới"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>

                              {(group.options.length > 1 || opt.value.trim() !== '') && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(group.id, opt.id)}
                                  className="text-muted-foreground hover:text-destructive p-1 transition-colors shrink-0"
                                  title="Xóa tùy chọn"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2.2 DANH SÁCH BIẾN THỂ & THIẾT LẬP HÀNG LOẠT (#skus) — Hỗ trợ Kéo thả đổi thứ tự Index dòng SKU */}
              <div id="skus" className="space-y-3 pt-4 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Danh sách biến thể (Variation List / SKUs)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Có thể kéo thả từng dòng SKU hoặc dùng nút mũi tên để sắp xếp thứ tự Index (#1 là SKU chính).
                    </p>
                  </div>

                  {/* Thanh công cụ Thiết lập hàng loạt (Batch Edit) */}
                  <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border">
                    <Input
                      type="number"
                      min={0}
                      value={batchPrice}
                      onChange={(e) => setBatchPrice(e.target.value)}
                      placeholder="Giá bán chung (₫)"
                      className="h-8 w-36 text-xs bg-background"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(e.target.value)}
                      placeholder="Tồn kho chung"
                      className="h-8 w-28 text-xs bg-background"
                    />
                    <Input
                      value={batchSkuPrefix}
                      onChange={(e) => setBatchSkuPrefix(e.target.value)}
                      placeholder="Tiền tố SKU (VD: FIG-OP)"
                      className="h-8 w-36 text-xs bg-background font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleApplyBatchSkus}
                      className="h-8 text-xs font-semibold"
                    >
                      Áp dụng hàng loạt
                    </Button>
                  </div>
                </div>

                {/* Bảng SKU hỗ trợ kéo thả sắp xếp */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-left text-xs font-semibold text-muted-foreground">
                          <th className="py-2.5 px-3 w-[88px]">Index</th>
                          {activeVariationGroups.length > 0 ? (
                            activeVariationGroups.map((g) => (
                              <th key={g.id} className="py-2.5 px-3">
                                {g.name}
                              </th>
                            ))
                          ) : (
                            <th className="py-2.5 px-3">Phân loại</th>
                          )}
                          <th className="py-2.5 px-3 w-[180px]">
                            <span className="text-destructive">*</span> Giá bán lẻ (₫)
                          </th>
                          <th className="py-2.5 px-3 w-[140px]">
                            <span className="text-destructive">*</span> Số lượng kho
                          </th>
                          <th className="py-2.5 px-3 w-[200px]">
                            <span className="text-destructive">*</span> Seller SKU
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {skus.map((sku, idx) => {
                          const skuError = errors.skus?.[idx];
                          return (
                            <tr
                              key={sku.id}
                              draggable
                              onDragStart={(e) => {
                                setDraggedSkuIdx(idx);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedSkuIdx !== null && draggedSkuIdx !== idx) {
                                  setDragOverSkuIdx(idx);
                                }
                              }}
                              onDragLeave={() => setDragOverSkuIdx(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedSkuIdx !== null && draggedSkuIdx !== idx) {
                                  handleMoveSkuRow(draggedSkuIdx, idx);
                                }
                                setDraggedSkuIdx(null);
                                setDragOverSkuIdx(null);
                              }}
                              onDragEnd={() => {
                                setDraggedSkuIdx(null);
                                setDragOverSkuIdx(null);
                              }}
                              className={cn(
                                'hover:bg-muted/20 transition-colors',
                                draggedSkuIdx === idx && 'opacity-50 bg-muted/40',
                                dragOverSkuIdx === idx &&
                                  'bg-primary/10 ring-1 ring-inset ring-primary'
                              )}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1">
                                  <span
                                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                    title="Kéo thả để đổi vị trí dòng SKU"
                                  >
                                    <GripVertical className="h-3.5 w-3.5" />
                                  </span>
                                  <span
                                    className={cn(
                                      'rounded px-1.5 py-0.5 text-[10px] font-mono font-bold',
                                      idx === 0
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-border bg-muted text-foreground'
                                    )}
                                  >
                                    #{idx + 1}
                                  </span>
                                  <div className="flex flex-col">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveSkuRow(idx, idx - 1)}
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                      title="Đưa dòng SKU lên"
                                    >
                                      <ArrowUp className="h-2.5 w-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === skus.length - 1}
                                      onClick={() => handleMoveSkuRow(idx, idx + 1)}
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                      title="Đưa dòng SKU xuống"
                                    >
                                      <ArrowDown className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {sku.optionCombo.map((val, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-3 font-medium text-xs">
                                  {val}
                                </td>
                              ))}

                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    ₫
                                  </span>
                                  <Input
                                    type="number"
                                    min={1000}
                                    step={1000}
                                    value={sku.price}
                                    onChange={(e) =>
                                      handleUpdateSkuField(sku.id, 'price', e.target.value)
                                    }
                                    className={cn(
                                      'h-8 pl-6 text-xs',
                                      skuError?.price && 'border-destructive'
                                    )}
                                  />
                                </div>
                                {skuError?.price && (
                                  <span className="text-[10px] text-destructive block mt-0.5">
                                    {skuError.price.message}
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3">
                                <Input
                                  type="number"
                                  min={0}
                                  value={sku.quantity}
                                  onChange={(e) =>
                                    handleUpdateSkuField(sku.id, 'quantity', e.target.value)
                                  }
                                  className={cn(
                                    'h-8 text-xs',
                                    skuError?.quantity && 'border-destructive'
                                  )}
                                />
                                {skuError?.quantity && (
                                  <span className="text-[10px] text-destructive block mt-0.5">
                                    {skuError.quantity.message}
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3">
                                <Input
                                  value={sku.sellerSku}
                                  onChange={(e) =>
                                    handleUpdateSkuField(
                                      sku.id,
                                      'sellerSku',
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  placeholder="Mã SKU"
                                  className={cn(
                                    'h-8 text-xs font-mono',
                                    skuError?.sellerSku && 'border-destructive'
                                  )}
                                />
                                {skuError?.sellerSku && (
                                  <span className="text-[10px] text-destructive block mt-0.5">
                                    {skuError.sellerSku.message}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 3: VẬN CHUYỂN (#shipping)
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="shipping"
            onMouseEnter={() => setActiveSection('shipping')}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Vận chuyển</span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                    Shipping & Package Weight
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cung cấp trọng lượng và kích thước sau đóng gói để TikTok Shop tính phí vận chuyển chính xác
                </p>
              </div>
              {sectionStatus.shipping && (
                <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Hợp lệ
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Trọng lượng gói hàng */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">
                    <span className="text-destructive">*</span> Trọng lượng sau đóng gói (Gram)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={10}
                      step={50}
                      value={packageWeight}
                      onChange={(e) =>
                        setValue('packageWeight', e.target.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="VD: 500"
                      className={cn(
                        'h-10 pr-14',
                        errors.packageWeight && 'border-destructive'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      gram
                    </span>
                  </div>
                  {errors.packageWeight ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.packageWeight.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Tương đương{' '}
                      <strong>
                        {((Number(packageWeight) || 0) / 1000).toFixed(2)} kg
                      </strong>{' '}
                      (Bao gồm hộp mô hình + xốp chống sốc + thùng carton).
                    </p>
                  )}
                </div>

                {/* Kích thước kiện hàng */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">
                    Kích thước kiện hàng (Dài × Rộng × Cao)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={packageLength}
                        onChange={(e) =>
                          setValue('packageLength', e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Dài"
                        className="h-10 pr-8 text-xs"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={packageWidth}
                        onChange={(e) =>
                          setValue('packageWidth', e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Rộng"
                        className="h-10 pr-8 text-xs"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={packageHeight}
                        onChange={(e) =>
                          setValue('packageHeight', e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Cao"
                        className="h-10 pr-8 text-xs"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        cm
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Trọng lượng quy đổi thể tích:{' '}
                    <strong>
                      {(
                        ((Number(packageLength) || 0) *
                          (Number(packageWidth) || 0) *
                          (Number(packageHeight) || 0)) /
                        6000
                      ).toFixed(2)}{' '}
                      kg
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 3. RIGHT LIVE PREVIEW PANEL (3 cols - Sticky giống TikTok Shop Seller Center) */}
        <aside className="lg:col-span-3 sticky top-24 space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>Xem trước hiển thị TikTok Shop</span>
              </div>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Mobile View
              </span>
            </div>

            {/* Khung giả lập màn hình điện thoại TikTok Shop */}
            <div className="p-4 bg-muted/20">
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden max-w-[300px] mx-auto">
                {/* Ảnh bìa sản phẩm */}
                <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Package className="h-10 w-10 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Chưa có ảnh bìa</p>
                    </div>
                  )}
                  {images.length > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      1/{images.length}
                    </span>
                  )}
                </div>

                {/* Thông tin giá & tiêu đề trên App */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                      {minPrice > 0 ? formatCurrencyVND(minPrice) : '0 ₫'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Kho: {totalInventory}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Mall
                    </span>
                    {selectedCategory && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                        {selectedParentCategory
                          ? `${selectedParentCategory.localName} › ${selectedCategory.localName}`
                          : selectedCategory.localName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold leading-snug line-clamp-2 min-h-[32px]">
                    {title.trim() ||
                      '[Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU'}
                  </p>

                  {/* Preview phân loại */}
                  {skus.length > 0 && (
                    <div className="pt-2 border-t border-border/70">
                      <p className="text-[10px] text-muted-foreground mb-1.5">
                        Có {skus.length} phân loại biến thể (Index #1 → #{skus.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {skus.slice(0, 4).map((s, idx) => (
                          <span
                            key={s.id}
                            className="text-[10px] px-2 py-0.5 rounded border border-border bg-muted/40 truncate max-w-[125px]"
                          >
                            #{idx + 1} {s.optionCombo.join(' / ')}
                          </span>
                        ))}
                        {skus.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                            +{skus.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Điểm SEO tiêu đề */}
                  <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Điểm chuẩn công thức AI:</span>
                    <span
                      className={cn(
                        'font-bold',
                        titleSeoEvaluation.score >= 85
                          ? 'text-emerald-600'
                          : titleSeoEvaluation.score >= 60
                          ? 'text-amber-600'
                          : 'text-destructive'
                      )}
                    >
                      {titleSeoEvaluation.score}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* ─── STICKY BOTTOM ACTION BAR (Giống TikTok Shop Seller Center) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border px-6 py-3.5 shadow-lg">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {Object.values(sectionStatus).every(Boolean) ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Tất cả thông tin bắt buộc đã hợp lệ. Sẵn sàng đăng sản phẩm!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                Vui lòng điền đủ Ảnh, Tên sản phẩm, Hạng mục Cha & Con, Mô tả và Giá SKU.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                reset(DEFAULT_PRODUCT_FORM_VALUES);
                toast.info('Đã khôi phục dữ liệu mặc định của biểu mẫu');
              }}
              disabled={createProductMutation.isPending}
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSafeNavigate('/products')}
              disabled={createProductMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => submitProductWithMode('draft')}
              disabled={createProductMutation.isPending}
            >
              Lưu bản nháp
            </Button>
            <Button
              type="button"
              onClick={() => submitProductWithMode('publish')}
              disabled={createProductMutation.isPending}
              className="min-w-[160px] gap-2 shadow-sm"
            >
              {createProductMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Đăng sản phẩm
            </Button>
          </div>
        </div>
      </div>

      {/* ─── DIALOG 1: THÊM HÌNH ẢNH SẢN PHẨM (Tải từ máy / URL / Ảnh mẫu) ─── */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Thêm hình ảnh sản phẩm ({images.length}/9)
            </DialogTitle>
            <DialogDescription>
              Tải tệp ảnh từ máy tính, dán đường dẫn URL hoặc chọn nhanh từ thư viện mẫu Anime Figure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Tải ảnh trực tiếp từ máy tính */}
            <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-center space-y-2">
              <Upload className="h-6 w-6 text-primary mx-auto" />
              <div className="text-xs font-medium">
                Chọn nhiều ảnh từ máy tính của bạn (JPG, PNG, WEBP - Tối đa 8MB/ảnh)
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => mainFileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Chọn tệp ảnh từ máy tính
              </Button>
            </div>

            {/* Nhập URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">
                Hoặc dán đường dẫn hình ảnh (Image URL)
              </label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => handleAddImageUrl()}
                  disabled={!newImageUrl.trim()}
                >
                  Thêm URL
                </Button>
              </div>
            </div>

            {/* Chọn nhanh ảnh mẫu */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Hoặc chọn nhanh ảnh mẫu Anime / Mô hình:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {SAMPLE_ANIME_IMAGES.map((sample) => {
                  const alreadyAdded = images.includes(sample.url);
                  return (
                    <button
                      key={sample.url}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddImageUrl(sample.url)}
                      className={cn(
                        'group relative aspect-square rounded-lg border overflow-hidden text-left transition-all',
                        alreadyAdded
                          ? 'opacity-40 cursor-not-allowed border-border'
                          : 'hover:border-primary hover:ring-2 hover:ring-primary/20'
                      )}
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/65 text-white text-[10px] px-1.5 py-0.5 truncate">
                        {alreadyAdded ? 'Đã thêm' : sample.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 2: GẮN ẢNH CHO PHÂN LOẠI BIẾN THỂ ─── */}
      <Dialog
        open={!!editingImageForOption}
        onOpenChange={(open) => !open && setEditingImageForOption(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Ảnh minh họa phân loại biến thể</DialogTitle>
            <DialogDescription>
              Khi khách hàng bấm chọn phân loại này trên TikTok Shop, ảnh tương ứng sẽ hiển thị.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Tải ảnh từ máy hoặc nhập URL</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => variantFileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 text-primary" />
                Tải từ máy
              </Button>
            </div>
            <Input
              value={optionImageUrlInput}
              onChange={(e) => setOptionImageUrlInput(e.target.value)}
              placeholder="https://..."
            />
            {optionImageUrlInput.trim() && (
              <div className="h-28 w-28 rounded-lg border border-border overflow-hidden mx-auto">
                <img
                  src={optionImageUrlInput}
                  alt="Option preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {SAMPLE_ANIME_IMAGES.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => setOptionImageUrlInput(sample.url)}
                  className="aspect-square rounded-md border border-border overflow-hidden hover:border-primary"
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingImageForOption(null)}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleSaveOptionImage}>
              Lưu ảnh phân loại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 3: LIGHTBOX XEM ẢNH LỚN ─── */}
      <Dialog
        open={!!previewLightboxUrl}
        onOpenChange={(open) => !open && setPreviewLightboxUrl(null)}
      >
        <DialogContent className="sm:max-w-[560px] p-2">
          {previewLightboxUrl && (
            <img
              src={previewLightboxUrl}
              alt="Xem trước ảnh sản phẩm"
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 4: FILE QUY TẮC AI CHUẨN TIKTOK SHOP ─── */}
      <Dialog open={showAiRulesDialog} onOpenChange={setShowAiRulesDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quy tắc AI Đặt tên & Nội dung chuẩn TikTok Shop
            </DialogTitle>
            <DialogDescription>
              Tài liệu quy tắc AI được lưu tại{' '}
              <code className="text-primary font-mono text-xs">
                {TIKTOK_AI_RULES_FILE_PATH}
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="font-bold text-primary mb-1">
                Công thức chuẩn 6 thành phần bắt buộc:
              </div>
              <code className="text-xs font-mono font-bold block">
                {TIKTOK_TITLE_FORMULA}
              </code>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Chi tiết từng thành phần cho AI hiểu:</h4>
              <ul className="space-y-1.5 list-disc pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">1. [Thương hiệu]:</strong> Đặt trong ngoặc vuông ở đầu tên (VD:{' '}
                  <code>[Good Smile Company]</code>, <code>[Bandai Spirits]</code>).
                </li>
                <li>
                  <strong className="text-foreground">2. Loại mô hình:</strong> Từ khóa danh mục chính (VD:{' '}
                  <code>Mô hình Figure PVC</code>, <code>Mô hình Nendoroid</code>,{' '}
                  <code>Mô hình lắp ráp Gunpla</code>).
                </li>
                <li>
                  <strong className="text-foreground">3. Series Anime:</strong> Tên bộ Anime / Manga / Game (VD:{' '}
                  <code>Jujutsu Kaisen</code>, <code>One Piece</code>).
                </li>
                <li>
                  <strong className="text-foreground">4. Nhân vật:</strong> Tên nhân vật kèm phiên bản (VD:{' '}
                  <code>Gojo Satoru Shibuya Ver.</code>).
                </li>
                <li>
                  <strong className="text-foreground">5. Kích thước:</strong> Chiều cao hoặc tỷ lệ kèm đơn vị (VD:{' '}
                  <code>Cao 24cm</code>, <code>1/7 Scale</code>).
                </li>
                <li>
                  <strong className="text-foreground">6. Mã SKU:</strong> Mã định danh kho đặt ở cuối (VD:{' '}
                  <code>SKU FIG-JJK-GOJO-01</code>).
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                handleApplyAiTitle(aiTitleCandidates[0].title);
                setShowAiRulesDialog(false);
              }}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Áp dụng ngay công thức cho sản phẩm này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 5: CẢNH BÁO RỜI TRANG KHI CHƯA LƯU ("Changes you made may not be saved.") ─── */}
      <Dialog
        open={unsavedDialogState.open}
        onOpenChange={(open) =>
          !open && setUnsavedDialogState({ open: false, targetPath: null })
        }
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Changes you made may not be saved.
            </DialogTitle>
            <DialogDescription className="pt-1">
              Bạn đang có các thay đổi chưa được lưu trên biểu mẫu tạo sản phẩm. Nếu rời khỏi trang lúc này, toàn bộ dữ liệu vừa nhập sẽ bị mất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnsavedDialogState({ open: false, targetPath: null })}
            >
              Ở lại trang tiếp tục chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const target = unsavedDialogState.targetPath || '/products';
                setUnsavedDialogState({ open: false, targetPath: null });
                setIsSubmittedSuccess(true);
                navigate(target);
              }}
            >
              Rời trang & Hủy thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateProductPage;
