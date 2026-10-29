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
  Maximize2,
  Minimize2,
  CheckSquare,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
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
import { useI18n } from '../features/i18n/I18nContext';
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
    subLabel: 'Kéo thả Biến thể, Giá bán, Kho & Kích thước SKU',
    icon: Layers,
  },
  {
    id: 'shipping',
    label: 'Vận chuyển',
    subLabel: 'Trọng lượng, Chiều dài, Chiều rộng & Chiều cao',
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

// Danh sách thuộc tính đặc trưng ngành hàng Anime & Mô hình trên Website
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
    tooltip: 'Giúp khách hàng lọc và tìm kiếm theo bộ phim/truyện yêu thích trên Website',
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
  const { t } = useI18n();
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
  const enableSkuDimensions = watch('enableSkuDimensions');
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

  // Lựa chọn SKU & Phóng to toàn màn hình bảng SKU
  const [skuFilterOption, setSkuFilterOption] = useState<string>('ALL');
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [isSkuTableFullscreen, setIsSkuTableFullscreen] = useState(false);

  // Thiết lập hàng loạt (Batch Apply) cho bảng SKU
  const [batchPrice, setBatchPrice] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchSkuPrefix, setBatchSkuPrefix] = useState('');
  const [batchWeight, setBatchWeight] = useState('');
  const [batchLength, setBatchLength] = useState('');
  const [batchWidth, setBatchWidth] = useState('');
  const [batchHeight, setBatchHeight] = useState('');

  // Đóng chế độ Fullscreen bảng SKU khi nhấn phím ESC
  useEffect(() => {
    if (!isSkuTableFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSkuTableFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSkuTableFullscreen]);

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
      const message = t('products.unsavedTitle');
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, t]);

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
    toast.success('Đã áp dụng tên sản phẩm chuẩn công thức SEO Website');
  };

  const handleGenerateAiDescription = () => {
    const generatedHtml = generateAiProductDescriptionHtml(aiContext);
    setValue('descriptionHtml', generatedHtml, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success('AI đã tạo mô tả sản phẩm chuẩn SEO từ thông số của bạn!');
  };

  // ─── 2. Hoàn thiện thao tác Thêm ảnh ───
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
      toast.warning('Tối đa 9 ảnh sản phẩm');
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
      toast.warning('Tối đa 9 ảnh sản phẩm');
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
      toast.info('Hỗ trợ tối đa 2 cấp nhóm biến thể (VD: Nhân vật & Quy cách hộp)');
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

  // Danh sách tùy chọn cho nút "Lựa chọn SKU"
  const skuSelectionFilterOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: 'ALL', label: `Lựa chọn SKU: Tất cả (${skus.length} SKU)` },
    ];
    if (selectedSkuIds.length > 0) {
      opts.push({
        value: 'SELECTED_ONLY',
        label: `Các SKU đang tích chọn (${selectedSkuIds.length} SKU)`,
      });
    }
    for (const group of variationGroups) {
      for (const opt of group.options) {
        const val = opt.value.trim();
        if (val) {
          opts.push({
            value: `OPT:${val}`,
            label: `Theo ${group.name}: ${val}`,
          });
        }
      }
    }
    return opts;
  }, [skus.length, selectedSkuIds.length, variationGroups]);

  // Lọc danh sách SKU hiển thị theo nút "Lựa chọn SKU"
  const visibleSkusWithIndex = useMemo(() => {
    return skus
      .map((sku, originalIdx) => ({ sku, originalIdx }))
      .filter(({ sku }) => {
        if (skuFilterOption === 'ALL') return true;
        if (skuFilterOption === 'SELECTED_ONLY') {
          return selectedSkuIds.includes(sku.id);
        }
        if (skuFilterOption.startsWith('OPT:')) {
          const targetVal = skuFilterOption.slice(4);
          return sku.optionCombo.includes(targetVal);
        }
        return true;
      });
  }, [skus, skuFilterOption, selectedSkuIds]);

  const handleToggleSelectAllSkus = () => {
    const visibleIds = visibleSkusWithIndex.map((item) => item.sku.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedSkuIds.includes(id));

    if (allVisibleSelected) {
      setSelectedSkuIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedSkuIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectSingleSku = (skuId: string) => {
    setSelectedSkuIds((prev) =>
      prev.includes(skuId) ? prev.filter((id) => id !== skuId) : [...prev, skuId]
    );
  };

  const handleApplyBatchSkus = () => {
    const targetIds =
      selectedSkuIds.length > 0
        ? selectedSkuIds
        : visibleSkusWithIndex.map((item) => item.sku.id);

    const nextSkus = skus.map((sku, idx) => {
      if (!targetIds.includes(sku.id)) return sku;
      return {
        ...sku,
        price: batchPrice.trim() !== '' ? batchPrice.trim() : sku.price,
        quantity: batchQuantity.trim() !== '' ? batchQuantity.trim() : sku.quantity,
        sellerSku:
          batchSkuPrefix.trim() !== ''
            ? `${batchSkuPrefix.trim()}-${String(idx + 1).padStart(2, '0')}`
            : sku.sellerSku,
        weight:
          enableSkuDimensions && batchWeight.trim() !== ''
            ? batchWeight.trim()
            : sku.weight,
        length:
          enableSkuDimensions && batchLength.trim() !== ''
            ? batchLength.trim()
            : sku.length,
        width:
          enableSkuDimensions && batchWidth.trim() !== ''
            ? batchWidth.trim()
            : sku.width,
        height:
          enableSkuDimensions && batchHeight.trim() !== ''
            ? batchHeight.trim()
            : sku.height,
      };
    });
    setValue('skus', nextSkus, { shouldDirty: true, shouldValidate: true });
    toast.success(`Đã áp dụng hàng loạt cho ${targetIds.length} dòng biến thể SKU`);
  };

  const handleUpdateSkuField = (
    skuId: string,
    field: 'price' | 'quantity' | 'sellerSku' | 'weight' | 'length' | 'width' | 'height',
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
        sourcePlatform: 'LOCAL',
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

  // Tìm ảnh phân loại của dòng SKU (từ nhóm biến thể 1)
  const getOptionImageForSku = (optionCombo: string[]) => {
    const firstVal = optionCombo[0];
    if (!firstVal || !variationGroups[0]) return null;
    const foundOpt = variationGroups[0].options.find(
      (o) => o.value.trim() === firstVal
    );
    return foundOpt ? { groupId: variationGroups[0].id, opt: foundOpt } : null;
  };

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
      <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3.5 shadow-sm">
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
                  className="hover:text-foreground transition-colors font-medium"
                >
                  Quản lý sản phẩm
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-semibold">Thêm sản phẩm mới</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                <h1 className="text-lg font-bold tracking-tight">Thêm sản phẩm mới</h1>
                {/* Badge Website nổi bật, màu đậm rõ nét */}
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
                  BonzStore Website Standard
                </span>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
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
                      ? 'text-teal-800 dark:text-primary font-bold'
                      : 'text-muted-foreground hover:text-foreground font-medium'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                      done
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : activeSection === sec.id
                        ? 'bg-teal-700 text-white dark:bg-primary dark:text-primary-foreground shadow-sm'
                        : 'bg-muted text-foreground'
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-sm transition-colors"
              title="Xem quy tắc AI đặt tên chuẩn SEO Website"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Điểm SEO AI: {titleSeoEvaluation.score}/100</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN 3-COLUMN LAYOUT ─── */}
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
                      ? 'bg-teal-600/15 text-teal-900 dark:bg-primary/15 dark:text-primary font-bold border-l-4 border-teal-700 dark:border-primary'
                      : 'hover:bg-muted/60 text-foreground/85 font-medium'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      isActive ? 'text-teal-700 dark:text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs leading-tight truncate">{sec.label}</span>
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
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

          {/* Gợi ý chất lượng chuẩn SEO Website */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-primary">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-primary" />
                <span>Chuẩn SEO Website</span>
              </div>
              <span
                className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded text-white',
                  titleSeoEvaluation.score >= 80
                    ? 'bg-emerald-600'
                    : titleSeoEvaluation.score >= 50
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                )}
              >
                {titleSeoEvaluation.score}/100
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className={images.length >= 3 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  ●
                </span>
                <span>Đăng từ 3–9 ảnh vuông (1:1), kéo thả ảnh đẹp nhất làm Ảnh bìa.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  className={
                    titleSeoEvaluation.score >= 80 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'
                  }
                >
                  ●
                </span>
                <span>
                  Tên theo công thức: <strong className="text-foreground">[Thương hiệu] + Loại + Series + Nhân vật + Size + SKU</strong>.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  className={
                    parentCategoryId && categoryId ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'
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
              className="w-full h-7 text-[11px] font-semibold gap-1 border-teal-600/30 text-teal-800 dark:text-primary hover:bg-teal-500/10"
              onClick={() => setShowAiRulesDialog(true)}
            >
              <BookOpen className="h-3 w-3 text-teal-700 dark:text-primary" />
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
            <div className="border-b border-border bg-muted/40 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Thông tin cơ bản</span>
                  <span className="rounded-md bg-teal-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
                    Basic Information
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hình ảnh sản phẩm, tên chuẩn công thức AI SEO, hạng mục 2 cấp và thông số kỹ thuật trên Website
                </p>
              </div>
              {sectionStatus.basic_info && (
                <span className="rounded-md px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  ✓ Đã hoàn tất
                </span>
              )}
            </div>

            <div className="p-6 space-y-7">
              {/* 1.1 HÌNH ẢNH SẢN PHẨM (Tối đa 9 ảnh 1:1) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <span className="text-destructive">*</span>
                    <span>Hình ảnh sản phẩm</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-semibold text-white dark:bg-secondary dark:text-foreground">
                      {images.length}/9 ảnh
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5 border-teal-600/40 text-teal-800 dark:text-primary hover:bg-teal-500/10"
                      onClick={() => mainFileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 text-teal-700 dark:text-primary" />
                      Tải ảnh từ máy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5"
                      onClick={() => setImageModalOpen(true)}
                    >
                      <ImagePlus className="h-3.5 w-3.5 text-indigo-600 dark:text-primary" />
                      Dán URL / Ảnh mẫu
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Kéo thả tệp ảnh trực tiếp từ máy tính vào khung bên dưới, hoặc{' '}
                  <strong className="text-foreground">kéo thả các ô ảnh để đổi thứ tự</strong> (ô đầu tiên là{' '}
                  <span className="inline-flex items-center rounded bg-teal-700 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    ★ Ảnh bìa
                  </span>
                  ).
                </p>

                {/* Grid 9 ô ảnh + Vùng kéo thả file */}
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
                      ? 'border-teal-600 bg-teal-500/10 ring-2 ring-teal-500/20'
                      : errors.images
                      ? 'border-destructive/60 bg-destructive/5'
                      : 'border-border/80 bg-muted/15'
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
                          ? 'ring-2 ring-teal-600 border-teal-600'
                          : 'border-border hover:border-teal-600/60',
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
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                        #{idx + 1}
                      </span>

                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-teal-700 text-white text-[10px] font-bold text-center py-0.5">
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
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors"
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
                    <div className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-teal-600 bg-background/80 hover:bg-teal-500/5 flex flex-col items-center justify-center gap-1.5 p-2 text-muted-foreground transition-all">
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-1 hover:text-teal-700 dark:hover:text-primary transition-colors w-full flex-1"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-[11px] font-bold text-center">
                          {images.length === 0 ? 'Tải ảnh bìa' : '+ Tải ảnh máy'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="text-[10px] font-semibold text-teal-700 dark:text-primary hover:underline border-t border-border/60 pt-1 w-full text-center"
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

              {/* 1.2 TÊN SẢN PHẨM + TRỢ LÝ AI CHUẨN SEO WEBSITE */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="product-title" className="text-sm font-bold text-foreground">
                    <span className="text-destructive">*</span> Tên sản phẩm
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiRulesDialog(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-600/30 transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      Quy tắc AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiPanel((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
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
                      'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold',
                      title.length > 0 && title.length < 25
                        ? 'text-amber-600'
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

                {/* Thanh kiểm tra 6 thành phần trong công thức chuẩn SEO */}
                <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-background to-teal-500/5 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-primary shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        Công thức chuẩn SEO Website:{' '}
                        <code className="rounded bg-indigo-600/10 border border-indigo-600/25 px-1.5 py-0.5 text-indigo-800 dark:text-primary font-mono text-[11px] font-bold">
                          {TIKTOK_TITLE_FORMULA}
                        </code>
                      </span>
                    </div>
                    <span
                      className={cn(
                        'rounded-md px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm',
                        titleSeoEvaluation.score >= 85
                          ? 'bg-emerald-600'
                          : titleSeoEvaluation.score >= 60
                          ? 'bg-amber-600'
                          : 'bg-slate-700'
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
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all',
                            seg.matched
                              ? 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-600/40'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-600/40 hover:bg-amber-500/25 cursor-pointer'
                          )}
                        >
                          {seg.matched ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Plus className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <span>{seg.label}</span>
                        </button>
                        {idx < titleSeoEvaluation.segments.length - 1 && (
                          <span className="text-muted-foreground text-xs font-bold">+</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bảng mở rộng AI Gợi ý Tên sản phẩm tự động */}
                  {showAiPanel && (
                    <div className="pt-2.5 border-t border-border/60 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">
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
                            className="w-full h-8 text-xs font-bold gap-1.5 bg-teal-700 text-white hover:bg-teal-800 dark:bg-primary dark:text-primary-foreground"
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
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Gợi ý từ AI (tự động đồng bộ theo Thương hiệu, Hạng mục, Series Anime, Nhân vật, Chiều cao & SKU):
                        </p>
                        <div className="space-y-1.5">
                          {aiTitleCandidates.map((cand) => (
                            <div
                              key={cand.id}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-background hover:border-teal-600/50 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="inline-block rounded bg-indigo-600/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-0.5">
                                  {cand.styleLabel}
                                </span>
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {cand.title}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs font-bold shrink-0 gap-1 bg-teal-700 text-white hover:bg-teal-800 dark:bg-primary dark:text-primary-foreground"
                                onClick={() => handleApplyAiTitle(cand.title)}
                              >
                                <Wand2 className="h-3 w-3" />
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
                    <FolderTree className="h-4 w-4 text-teal-700 dark:text-primary" />
                    <label className="text-sm font-bold text-foreground">
                      <span className="text-destructive">*</span> Hạng mục sản phẩm (Chọn theo 2 cấp: Cha → Con)
                    </label>
                  </div>
                  {selectedParentCategory && selectedCategory && (
                    <span className="rounded-md px-2.5 py-0.5 text-[11px] font-bold bg-teal-700 text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
                      {selectedParentCategory.localName} › {selectedCategory.localName} (#
                      {selectedCategory.externalCategoryId})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BƯỚC 1: Chọn Hạng mục Cha (Level 1) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-teal-700 text-white text-[10px] font-bold">
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
                        'h-10 bg-background font-medium',
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

                  {/* BƯỚC 2: Chọn Hạng mục Con (Level 2 / Leaf Category) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                          parentCategoryId
                            ? 'bg-teal-700 text-white'
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
                        'h-10 bg-background font-medium',
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
                    <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <span>Thương hiệu (Brand)</span>
                      <span
                        title="Dùng cho thành phần [Thương hiệu] ở đầu tên sản phẩm"
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
                      className="h-10 bg-background font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Thương hiệu sẽ tự động được đưa vào thành phần{' '}
                    <code className="rounded bg-teal-600/15 px-1.5 py-0.5 text-teal-800 dark:text-primary font-bold">
                      [Thương hiệu]
                    </code>{' '}
                    ở đầu tên sản phẩm khi sử dụng AI Gợi ý.
                  </p>
                </div>
              </div>

              {/* 1.4 THUỘC TÍNH SẢN PHẨM (Product Attributes) */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                      <Tag className="h-4 w-4 text-teal-700 dark:text-primary" />
                      <span>Thuộc tính sản phẩm (Product Attributes)</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Điền đầy đủ thuộc tính giúp khách hàng lọc sản phẩm dễ dàng trên Website và giúp AI viết tên/mô tả chính xác
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono font-bold text-white dark:bg-secondary dark:text-foreground">
                    {Object.values(attributes).filter(Boolean).length}/
                    {ANIME_ATTRIBUTE_FIELDS.length} đã điền
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/70">
                  {ANIME_ATTRIBUTE_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-semibold flex items-center gap-1 text-foreground">
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
                  <label className="text-sm font-bold text-foreground">
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
              - Ảnh biến thể kích thước lớn (56x56px)
              - Nút Lựa chọn SKU & Nút Zoom Full Màn Hình
              - Toggle Trọng lượng & Kích thước riêng cho từng SKU (Dài, Rộng, Cao)
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="sale_properties"
            onMouseEnter={() => setActiveSection('sale_properties')}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="border-b border-border bg-muted/40 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Thông tin bán hàng</span>
                  <span className="rounded-md bg-teal-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
                    Sales Information & Variations
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kéo thả hoặc bấm mũi tên để thay đổi thứ tự index biến thể. Bảng SKU bên dưới sẽ tự động đồng bộ.
                </p>
              </div>
              {sectionStatus.sale_properties && (
                <span className="rounded-md px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  {skus.length} SKU hợp lệ
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* 2.1 DANH SÁCH NHÓM BIẾN THỂ (Ảnh phân loại kích thước lớn h-14 w-14 = 56x56px) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-foreground">
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
                      className="h-8 text-xs font-semibold gap-1.5 border-teal-600/40 text-teal-800 dark:text-primary hover:bg-teal-500/10"
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
                        <span className="rounded-md bg-teal-700 px-2.5 py-1 text-xs font-bold text-white shrink-0 dark:bg-primary dark:text-primary-foreground">
                          Nhóm {groupIdx + 1}
                        </span>
                        <Input
                          value={group.name}
                          onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                          placeholder="Tên nhóm (VD: Nhân vật / Phiên bản, Kích thước)"
                          className="h-9 text-xs font-semibold bg-background"
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

                    {/* Các giá trị tùy chọn trong nhóm — Ảnh lớn 56x56px (h-14 w-14) + Kéo thả + Nút Lên/Xuống */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Giá trị tùy chọn (Bấm vào ô ảnh lớn để tải ảnh minh họa cho từng phân loại; kéo thả để đổi Index #1, #2...)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                'flex items-center gap-2.5 bg-background p-2.5 rounded-xl border transition-all shadow-xs',
                                isDraggingThis && 'opacity-50 border-dashed border-teal-600',
                                isDragOverThis
                                  ? 'border-teal-600 ring-2 ring-teal-600/25 bg-teal-500/5'
                                  : 'border-border hover:border-teal-600/40'
                              )}
                            >
                              <div
                                className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                                title="Kéo thả để thay đổi thứ tự index biến thể"
                              >
                                <GripVertical className="h-4 w-4" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white dark:bg-muted dark:text-foreground">
                                  #{optIdx + 1}
                                </span>
                              </div>

                              {/* Ô ảnh phân loại biến thể kích thước lớn (h-14 w-14 = 56x56px) */}
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
                                    'group/img relative h-14 w-14 rounded-lg border-2 flex flex-col items-center justify-center shrink-0 overflow-hidden transition-all',
                                    opt.imageUrl
                                      ? 'border-teal-600 shadow-xs'
                                      : 'border-dashed border-border hover:border-teal-600 bg-muted/20 text-muted-foreground hover:text-teal-700'
                                  )}
                                  title="Bấm để thêm hoặc đổi ảnh cho phân loại này"
                                >
                                  {opt.imageUrl ? (
                                    <>
                                      <img
                                        src={opt.imageUrl}
                                        alt={opt.value}
                                        className="h-full w-full object-cover"
                                      />
                                      <span className="absolute inset-0 bg-black/55 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                                        Đổi ảnh
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <ImagePlus className="h-5 w-5" />
                                      <span className="text-[9px] font-semibold mt-0.5">
                                        Thêm ảnh
                                      </span>
                                    </>
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
                                className="h-10 text-xs font-medium bg-muted/30 px-2.5 flex-1"
                              />

                              {/* Nút di chuyển Lên / Xuống */}
                              <div className="flex flex-col items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={optIdx === 0}
                                  onClick={() =>
                                    handleMoveVariationOption(group.id, optIdx, optIdx - 1)
                                  }
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                                  title="Đưa lên trên"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
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
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {(group.options.length > 1 || opt.value.trim() !== '') && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(group.id, opt.id)}
                                  className="text-muted-foreground hover:text-destructive p-1.5 transition-colors shrink-0"
                                  title="Xóa tùy chọn"
                                >
                                  <Trash2 className="h-4 w-4" />
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

              {/* 2.2 DANH SÁCH BIẾN THỂ & THIẾT LẬP HÀNG LOẠT (#skus)
                  Có:
                  1. Nút Lựa chọn SKU (Filter + Checkbox chọn SKU)
                  2. Nút Zoom Full Màn Hình (Phóng to / Thu nhỏ)
                  3. Toggle "Trọng lượng và kích thước SKU" (Thêm Chiều dài, Chiều rộng, Chiều cao)
              */}
              <div
                id="skus"
                className={cn(
                  'space-y-4 pt-4 border-t border-border transition-all',
                  isSkuTableFullscreen &&
                    'fixed inset-3 z-50 m-0 flex flex-col rounded-2xl border-2 border-teal-600 bg-card p-6 shadow-2xl overflow-hidden'
                )}
              >
                {/* Header của Danh sách biến thể */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        Danh sách biến thể (Variation List / SKUs)
                      </h3>
                      <span className="rounded-md bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-primary dark:text-primary-foreground">
                        {visibleSkusWithIndex.length}/{skus.length} SKU
                      </span>
                      {selectedSkuIds.length > 0 && (
                        <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Đã chọn {selectedSkuIds.length} SKU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lựa chọn SKU cần chỉnh sửa, bật Trọng lượng & Kích thước từng SKU hoặc phóng to toàn màn hình để thao tác nhanh.
                    </p>
                  </div>

                  {/* Nhóm 2 nút bắt buộc: (1) Lựa chọn SKU + (2) Nút Zoom Full Màn Hình + Toggle Trọng lượng & Kích thước SKU */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Công tắc bật/tắt Trọng lượng và kích thước SKU */}
                    <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold cursor-pointer hover:border-teal-600/50">
                      <Ruler className="h-3.5 w-3.5 text-teal-700 dark:text-primary" />
                      <span>Trọng lượng & kích thước SKU</span>
                      <Switch
                        checked={enableSkuDimensions}
                        onCheckedChange={(checked) => {
                          setValue('enableSkuDimensions', checked, { shouldDirty: true });
                          if (checked) {
                            toast.info(
                              'Đã bật nhập Trọng lượng, Chiều dài, Chiều rộng, Chiều cao cho từng SKU'
                            );
                          }
                        }}
                      />
                    </label>

                    {/* NÚT 1: Lựa chọn SKU */}
                    <div className="flex items-center gap-1.5">
                      <Select
                        value={skuFilterOption}
                        onChange={(e) => setSkuFilterOption(e.target.value)}
                        options={skuSelectionFilterOptions}
                        className="h-9 min-w-[210px] text-xs font-semibold border-teal-600/40 bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleSelectAllSkus}
                        className="h-9 text-xs font-semibold gap-1.5"
                        title="Chọn hoặc bỏ chọn tất cả dòng SKU đang hiển thị"
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-teal-700 dark:text-primary" />
                        <span>
                          {selectedSkuIds.length === visibleSkusWithIndex.length &&
                          visibleSkusWithIndex.length > 0
                            ? 'Bỏ chọn SKU'
                            : 'Chọn tất cả SKU'}
                        </span>
                      </Button>
                    </div>

                    {/* NÚT 2: Zoom Full Màn Hình */}
                    <Button
                      type="button"
                      variant={isSkuTableFullscreen ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsSkuTableFullscreen((prev) => !prev)}
                      className={cn(
                        'h-9 text-xs font-bold gap-1.5',
                        isSkuTableFullscreen
                          ? 'bg-teal-700 text-white hover:bg-teal-800'
                          : 'border-indigo-600/40 text-indigo-700 dark:text-primary hover:bg-indigo-500/10'
                      )}
                      title="Phóng to toàn màn hình bảng biến thể để tiện chỉnh sửa"
                    >
                      {isSkuTableFullscreen ? (
                        <>
                          <Minimize2 className="h-3.5 w-3.5" />
                          <span>Thu nhỏ màn hình (ESC)</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span>Zoom Full Màn Hình</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Thanh công cụ Thiết lập hàng loạt (Batch Edit) */}
                <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-3 rounded-xl border border-border">
                  <span className="text-xs font-bold text-foreground mr-1">
                    Chỉnh sửa hàng loạt:
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={batchPrice}
                    onChange={(e) => setBatchPrice(e.target.value)}
                    placeholder="Giá bán (₫)"
                    className="h-8 w-32 text-xs bg-background"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(e.target.value)}
                    placeholder="Tồn kho"
                    className="h-8 w-24 text-xs bg-background"
                  />
                  <Input
                    value={batchSkuPrefix}
                    onChange={(e) => setBatchSkuPrefix(e.target.value)}
                    placeholder="Tiền tố SKU (VD: FIG-OP)"
                    className="h-8 w-36 text-xs bg-background font-mono"
                  />

                  {enableSkuDimensions && (
                    <>
                      <Input
                        type="number"
                        min={1}
                        value={batchWeight}
                        onChange={(e) => setBatchWeight(e.target.value)}
                        placeholder="Nặng (g)"
                        className="h-8 w-24 text-xs bg-background"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={batchLength}
                        onChange={(e) => setBatchLength(e.target.value)}
                        placeholder="Dài (cm)"
                        className="h-8 w-24 text-xs bg-background"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={batchWidth}
                        onChange={(e) => setBatchWidth(e.target.value)}
                        placeholder="Rộng (cm)"
                        className="h-8 w-24 text-xs bg-background"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={batchHeight}
                        onChange={(e) => setBatchHeight(e.target.value)}
                        placeholder="Cao (cm)"
                        className="h-8 w-24 text-xs bg-background"
                      />
                    </>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyBatchSkus}
                    className="h-8 text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 dark:bg-primary dark:text-primary-foreground ml-auto"
                  >
                    Áp dụng hàng loạt ({selectedSkuIds.length > 0 ? selectedSkuIds.length : visibleSkusWithIndex.length} SKU)
                  </Button>
                </div>

                {/* Bảng SKU hỗ trợ kéo thả sắp xếp + Kích thước ảnh lớn + Trọng lượng/Kích thước kiện hàng */}
                <div
                  className={cn(
                    'rounded-xl border border-border overflow-hidden bg-background',
                    isSkuTableFullscreen && 'flex-1 overflow-y-auto'
                  )}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border text-left text-xs font-bold text-foreground">
                          <th className="py-3 px-3 w-[42px] text-center">
                            <input
                              type="checkbox"
                              checked={
                                visibleSkusWithIndex.length > 0 &&
                                visibleSkusWithIndex.every(({ sku }) =>
                                  selectedSkuIds.includes(sku.id)
                                )
                              }
                              onChange={handleToggleSelectAllSkus}
                              className="h-4 w-4 rounded border-border accent-teal-700 cursor-pointer"
                              title="Chọn tất cả SKU"
                            />
                          </th>
                          <th className="py-3 px-3 w-[88px]">Index</th>
                          {activeVariationGroups.length > 0 ? (
                            activeVariationGroups.map((g) => (
                              <th key={g.id} className="py-3 px-3 min-w-[180px]">
                                {g.name}
                              </th>
                            ))
                          ) : (
                            <th className="py-3 px-3 min-w-[180px]">Phân loại</th>
                          )}
                          <th className="py-3 px-3 w-[160px]">
                            <span className="text-destructive">*</span> Giá bán lẻ (₫)
                          </th>
                          <th className="py-3 px-3 w-[120px]">
                            <span className="text-destructive">*</span> Tồn kho
                          </th>
                          <th className="py-3 px-3 w-[170px]">
                            <span className="text-destructive">*</span> Mã SKU
                          </th>
                          {enableSkuDimensions && (
                            <>
                              <th className="py-3 px-3 w-[130px]">
                                <span className="text-destructive">*</span> Trọng lượng (g)
                              </th>
                              <th className="py-3 px-3 min-w-[260px]">
                                Kích thước kiện hàng: Dài × Rộng × Cao (cm)
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {visibleSkusWithIndex.map(({ sku, originalIdx }) => {
                          const skuError = errors.skus?.[originalIdx];
                          const isSelected = selectedSkuIds.includes(sku.id);
                          const matchedOptionImg = getOptionImageForSku(sku.optionCombo);

                          return (
                            <tr
                              key={sku.id}
                              draggable
                              onDragStart={(e) => {
                                setDraggedSkuIdx(originalIdx);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (
                                  draggedSkuIdx !== null &&
                                  draggedSkuIdx !== originalIdx
                                ) {
                                  setDragOverSkuIdx(originalIdx);
                                }
                              }}
                              onDragLeave={() => setDragOverSkuIdx(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (
                                  draggedSkuIdx !== null &&
                                  draggedSkuIdx !== originalIdx
                                ) {
                                  handleMoveSkuRow(draggedSkuIdx, originalIdx);
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
                                isSelected && 'bg-teal-500/5',
                                draggedSkuIdx === originalIdx && 'opacity-50 bg-muted/40',
                                dragOverSkuIdx === originalIdx &&
                                  'bg-teal-500/10 ring-1 ring-inset ring-teal-600'
                              )}
                            >
                              {/* Checkbox chọn dòng SKU */}
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectSingleSku(sku.id)}
                                  className="h-4 w-4 rounded border-border accent-teal-700 cursor-pointer"
                                />
                              </td>

                              {/* Thứ tự Index + Kéo thả */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  <span
                                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                    title="Kéo thả để đổi vị trí dòng SKU"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </span>
                                  <span
                                    className={cn(
                                      'rounded px-1.5 py-0.5 text-[10px] font-mono font-bold',
                                      originalIdx === 0
                                        ? 'bg-teal-700 text-white dark:bg-primary dark:text-primary-foreground'
                                        : 'border border-border bg-muted text-foreground'
                                    )}
                                  >
                                    #{originalIdx + 1}
                                  </span>
                                  <div className="flex flex-col">
                                    <button
                                      type="button"
                                      disabled={originalIdx === 0}
                                      onClick={() =>
                                        handleMoveSkuRow(originalIdx, originalIdx - 1)
                                      }
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                      title="Đưa dòng SKU lên"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={originalIdx === skus.length - 1}
                                      onClick={() =>
                                        handleMoveSkuRow(originalIdx, originalIdx + 1)
                                      }
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                      title="Đưa dòng SKU xuống"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Tên phân loại kèm ảnh thumbnail lớn h-12 w-12 (48x48px) ở cột đầu tiên */}
                              {sku.optionCombo.map((val, cIdx) => (
                                <td key={cIdx} className="py-3 px-3 font-semibold text-xs">
                                  {cIdx === 0 && matchedOptionImg ? (
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingImageForOption({
                                            groupId: matchedOptionImg.groupId,
                                            optionId: matchedOptionImg.opt.id,
                                          });
                                          setOptionImageUrlInput(
                                            matchedOptionImg.opt.imageUrl || ''
                                          );
                                        }}
                                        className="h-12 w-12 rounded-lg border border-border overflow-hidden shrink-0 bg-muted/30 flex items-center justify-center hover:border-teal-600 transition-colors"
                                        title="Bấm để đổi ảnh biến thể"
                                      >
                                        {matchedOptionImg.opt.imageUrl ? (
                                          <img
                                            src={matchedOptionImg.opt.imageUrl}
                                            alt={val}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </button>
                                      <span>{val}</span>
                                    </div>
                                  ) : (
                                    val
                                  )}
                                </td>
                              ))}

                              {/* Giá bán */}
                              <td className="py-3 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
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
                                      'h-9 pl-6 text-xs font-semibold',
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

                              {/* Tồn kho */}
                              <td className="py-3 px-3">
                                <Input
                                  type="number"
                                  min={0}
                                  value={sku.quantity}
                                  onChange={(e) =>
                                    handleUpdateSkuField(sku.id, 'quantity', e.target.value)
                                  }
                                  className={cn(
                                    'h-9 text-xs font-semibold',
                                    skuError?.quantity && 'border-destructive'
                                  )}
                                />
                                {skuError?.quantity && (
                                  <span className="text-[10px] text-destructive block mt-0.5">
                                    {skuError.quantity.message}
                                  </span>
                                )}
                              </td>

                              {/* Seller SKU */}
                              <td className="py-3 px-3">
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
                                    'h-9 text-xs font-mono font-semibold',
                                    skuError?.sellerSku && 'border-destructive'
                                  )}
                                />
                                {skuError?.sellerSku && (
                                  <span className="text-[10px] text-destructive block mt-0.5">
                                    {skuError.sellerSku.message}
                                  </span>
                                )}
                              </td>

                              {/* Trọng lượng & Kích thước riêng cho từng SKU (Dài, Rộng, Cao) */}
                              {enableSkuDimensions && (
                                <>
                                  <td className="py-3 px-3">
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        min={1}
                                        value={sku.weight || '500'}
                                        onChange={(e) =>
                                          handleUpdateSkuField(
                                            sku.id,
                                            'weight',
                                            e.target.value
                                          )
                                        }
                                        className="h-9 pr-6 text-xs"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                        g
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="grid grid-cols-3 gap-1.5">
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          min={1}
                                          value={sku.length || '25'}
                                          onChange={(e) =>
                                            handleUpdateSkuField(
                                              sku.id,
                                              'length',
                                              e.target.value
                                            )
                                          }
                                          placeholder="Dài"
                                          title="Chiều dài kiện hàng (cm)"
                                          className="h-9 pr-6 text-xs"
                                        />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">
                                          D
                                        </span>
                                      </div>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          min={1}
                                          value={sku.width || '18'}
                                          onChange={(e) =>
                                            handleUpdateSkuField(
                                              sku.id,
                                              'width',
                                              e.target.value
                                            )
                                          }
                                          placeholder="Rộng"
                                          title="Chiều rộng kiện hàng (cm)"
                                          className="h-9 pr-6 text-xs"
                                        />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">
                                          R
                                        </span>
                                      </div>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          min={1}
                                          value={sku.height || '15'}
                                          onChange={(e) =>
                                            handleUpdateSkuField(
                                              sku.id,
                                              'height',
                                              e.target.value
                                            )
                                          }
                                          placeholder="Cao"
                                          title="Chiều cao kiện hàng (cm)"
                                          className="h-9 pr-6 text-xs"
                                        />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">
                                          C
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                </>
                              )}
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
              Hiển thị rõ Trọng lượng, Chiều dài kiện hàng, Chiều rộng kiện hàng, Chiều cao kiện hàng
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="shipping"
            onMouseEnter={() => setActiveSection('shipping')}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="border-b border-border bg-muted/40 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Vận chuyển & Kích thước kiện hàng</span>
                  <span className="rounded-md bg-teal-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
                    Shipping & Package Dimensions
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cung cấp trọng lượng, chiều dài, chiều rộng và chiều cao kiện hàng sau đóng gói
                </p>
              </div>
              {sectionStatus.shipping && (
                <span className="rounded-md px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  ✓ Hợp lệ
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Toggle Trọng lượng và kích thước theo từng SKU */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-600/30 bg-teal-500/5 p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Ruler className="h-4 w-4 text-teal-700 dark:text-primary" />
                    <span>Trọng lượng và kích thước theo từng biến thể SKU</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Khi bật tùy chọn này, bạn có thể nhập riêng Trọng lượng, Chiều dài, Chiều rộng và Chiều cao cho từng dòng SKU ở bảng trên.
                  </p>
                </div>
                <Switch
                  checked={enableSkuDimensions}
                  onCheckedChange={(checked) =>
                    setValue('enableSkuDimensions', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Trọng lượng gói hàng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    <span className="text-destructive">*</span> Trọng lượng kiện hàng (Gram)
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
                        'h-10 pr-14 font-semibold',
                        errors.packageWeight && 'border-destructive'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      gram
                    </span>
                  </div>
                  {errors.packageWeight ? (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.packageWeight.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Quy đổi: <strong>{((Number(packageWeight) || 0) / 1000).toFixed(2)} kg</strong>
                    </p>
                  )}
                </div>

                {/* 2. Chiều dài kiện hàng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    <span className="text-destructive">*</span> Chiều dài kiện hàng (cm)
                  </label>
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
                      placeholder="Chiều dài"
                      className={cn(
                        'h-10 pr-10 font-semibold',
                        errors.packageLength && 'border-destructive'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Chiều dài hộp đóng gói</p>
                </div>

                {/* 3. Chiều rộng kiện hàng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    <span className="text-destructive">*</span> Chiều rộng kiện hàng (cm)
                  </label>
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
                      placeholder="Chiều rộng"
                      className={cn(
                        'h-10 pr-10 font-semibold',
                        errors.packageWidth && 'border-destructive'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Chiều rộng hộp đóng gói</p>
                </div>

                {/* 4. Chiều cao kiện hàng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    <span className="text-destructive">*</span> Chiều cao kiện hàng (cm)
                  </label>
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
                      placeholder="Chiều cao"
                      className={cn(
                        'h-10 pr-10 font-semibold',
                        errors.packageHeight && 'border-destructive'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Chiều cao hộp đóng gói</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  Kích thước tổng thể kiện hàng:{' '}
                  <strong className="text-foreground">
                    Dài {packageLength || 0}cm × Rộng {packageWidth || 0}cm × Cao {packageHeight || 0}cm
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  Trọng lượng quy đổi thể tích:{' '}
                  <strong className="text-teal-700 dark:text-primary">
                    {(
                      ((Number(packageLength) || 0) *
                        (Number(packageWidth) || 0) *
                        (Number(packageHeight) || 0)) /
                      6000
                    ).toFixed(2)}{' '}
                    kg
                  </strong>
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 3. RIGHT LIVE PREVIEW PANEL (3 cols - Sticky) */}
        <aside className="lg:col-span-3 sticky top-24 space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Eye className="h-3.5 w-3.5 text-teal-700 dark:text-primary" />
                <span>Xem trước hiển thị Website</span>
              </div>
              <span className="rounded-md bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-primary dark:text-primary-foreground">
                Storefront View
              </span>
            </div>

            {/* Khung giả lập hiển thị sản phẩm trên Website */}
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
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      1/{images.length}
                    </span>
                  )}
                </div>

                {/* Thông tin giá & tiêu đề trên Website */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                      {minPrice > 0 ? formatCurrencyVND(minPrice) : '0 ₫'}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Kho: {totalInventory}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-teal-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Chính Hãng
                    </span>
                    {selectedCategory && (
                      <span className="text-[10px] bg-slate-800 text-white dark:bg-secondary dark:text-foreground px-2 py-0.5 rounded font-semibold">
                        {selectedParentCategory
                          ? `${selectedParentCategory.localName} › ${selectedCategory.localName}`
                          : selectedCategory.localName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold leading-snug line-clamp-2 min-h-[32px] text-foreground">
                    {title.trim() ||
                      '[Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU'}
                  </p>

                  {/* Preview phân loại */}
                  {skus.length > 0 && (
                    <div className="pt-2 border-t border-border/70">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">
                        Có {skus.length} phân loại biến thể (Index #1 → #{skus.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {skus.slice(0, 4).map((s, idx) => (
                          <span
                            key={s.id}
                            className="text-[10px] font-medium px-2 py-0.5 rounded border border-border bg-muted/50 truncate max-w-[125px]"
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
                    <span className="text-muted-foreground font-medium">Điểm chuẩn công thức AI:</span>
                    <span
                      className={cn(
                        'font-bold px-1.5 py-0.5 rounded text-white',
                        titleSeoEvaluation.score >= 85
                          ? 'bg-emerald-600'
                          : titleSeoEvaluation.score >= 60
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
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

      {/* ─── STICKY BOTTOM ACTION BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border px-6 py-3.5 shadow-lg">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {Object.values(sectionStatus).every(Boolean) ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Tất cả thông tin bắt buộc đã hợp lệ. Sẵn sàng đăng sản phẩm lên Website!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
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
              className="min-w-[160px] gap-2 shadow-sm font-bold"
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
              <ImagePlus className="h-5 w-5 text-teal-700 dark:text-primary" />
              Thêm hình ảnh sản phẩm ({images.length}/9)
            </DialogTitle>
            <DialogDescription>
              Tải tệp ảnh từ máy tính, dán đường dẫn URL hoặc chọn nhanh từ thư viện mẫu Anime Figure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Tải ảnh trực tiếp từ máy tính */}
            <div className="rounded-xl border-2 border-dashed border-teal-600/40 bg-teal-500/5 p-4 text-center space-y-2">
              <Upload className="h-6 w-6 text-teal-700 dark:text-primary mx-auto" />
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
                          : 'hover:border-teal-600 hover:ring-2 hover:ring-teal-600/20'
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
              Khi khách hàng bấm chọn phân loại này trên Website, ảnh tương ứng sẽ hiển thị.
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
                <Upload className="h-3 w-3 text-teal-700 dark:text-primary" />
                Tải từ máy
              </Button>
            </div>
            <Input
              value={optionImageUrlInput}
              onChange={(e) => setOptionImageUrlInput(e.target.value)}
              placeholder="https://..."
            />
            {optionImageUrlInput.trim() && (
              <div className="h-36 w-36 rounded-xl border-2 border-teal-600 overflow-hidden mx-auto shadow-sm">
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
                  className="aspect-square rounded-md border border-border overflow-hidden hover:border-teal-600"
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

      {/* ─── DIALOG 4: FILE QUY TẮC AI CHUẨN SEO WEBSITE ─── */}
      <Dialog open={showAiRulesDialog} onOpenChange={setShowAiRulesDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-primary" />
              Quy tắc AI Đặt tên & Nội dung chuẩn SEO Website
            </DialogTitle>
            <DialogDescription>
              Tài liệu quy tắc AI được lưu tại{' '}
              <code className="text-teal-700 dark:text-primary font-mono text-xs font-bold">
                {TIKTOK_AI_RULES_FILE_PATH}
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-lg bg-teal-600/10 border border-teal-600/30">
              <div className="font-bold text-teal-800 dark:text-primary mb-1">
                Công thức chuẩn 6 thành phần bắt buộc:
              </div>
              <code className="text-xs font-mono font-bold block text-foreground">
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
              className="gap-1.5 bg-teal-700 text-white hover:bg-teal-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Áp dụng ngay công thức cho sản phẩm này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 5: CẢNH BÁO RỜI TRANG KHI CHƯA LƯU ─── */}
      <Dialog
        open={unsavedDialogState.open}
        onOpenChange={(open) =>
          !open && setUnsavedDialogState({ open: false, targetPath: null })
        }
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 leading-snug">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{t('products.unsavedTitle')}</span>
            </DialogTitle>
            <DialogDescription className="pt-1 leading-relaxed">
              {t('products.unsavedDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 px-3 text-xs sm:text-sm font-semibold whitespace-normal text-center"
              onClick={() => setUnsavedDialogState({ open: false, targetPath: null })}
            >
              {t('products.unsavedStayBtn')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full h-10 px-3 text-xs sm:text-sm font-semibold whitespace-normal text-center"
              onClick={() => {
                const target = unsavedDialogState.targetPath || '/products';
                setUnsavedDialogState({ open: false, targetPath: null });
                setIsSubmittedSuccess(true);
                navigate(target);
              }}
            >
              {t('products.unsavedLeaveBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateProductPage;
