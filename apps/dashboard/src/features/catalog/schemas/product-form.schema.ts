import { z } from 'zod';

/**
 * Schema Biến thể & SKU dùng chung cho trang Thêm mới và Chỉnh sửa sản phẩm
 * Tích hợp react-hook-form + zod để đồng bộ state và tái sử dụng
 */
export const variationOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  imageUrl: z.string().optional(),
});

export const variationGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tên nhóm biến thể không được để trống'),
  options: z.array(variationOptionSchema),
});

export const skuRowSchema = z.object({
  id: z.string(),
  optionCombo: z.array(z.string()),
  price: z
    .string()
    .min(1, 'Vui lòng nhập giá bán')
    .refine((val) => {
      const num = Number(val);
      return Number.isFinite(num) && num >= 1000;
    }, 'Giá bán tối thiểu là 1.000₫'),
  quantity: z
    .string()
    .min(1, 'Vui lòng nhập tồn kho')
    .refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 0;
    }, 'Tồn kho phải là số nguyên ≥ 0'),
  sellerSku: z.string().min(1, 'Vui lòng nhập Mã SKU'),
  weight: z.string().optional().default('500'),
  length: z.string().optional().default('25'),
  width: z.string().optional().default('18'),
  height: z.string().optional().default('15'),
});

export const productFormSchema = z.object({
  images: z
    .array(z.string().min(1))
    .min(1, 'Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm (Ảnh bìa)')
    .max(9, 'Tối đa 9 hình ảnh sản phẩm'),
  title: z
    .string()
    .trim()
    .min(15, 'Tên sản phẩm cần tối thiểu 15 ký tự (khuyến nghị 60–150 ký tự chuẩn SEO)')
    .max(255, 'Tên sản phẩm không vượt quá 255 ký tự'),
  parentCategoryId: z.string().min(1, 'Vui lòng chọn Hạng mục Cha (Cấp 1)'),
  categoryId: z.string().min(1, 'Vui lòng chọn Hạng mục Con (Cấp 2)'),
  brandName: z.string().default('No Brand (Không có thương hiệu)'),
  characterName: z.string().optional().default(''),
  attributes: z.record(z.string(), z.string()).default({}),
  descriptionHtml: z
    .string()
    .refine((html) => {
      const plain = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();
      return plain.length >= 20;
    }, 'Mô tả sản phẩm cần tối thiểu 20 ký tự nội dung thực tế'),
  variationGroups: z.array(variationGroupSchema).min(1),
  skus: z
    .array(skuRowSchema)
    .min(1, 'Sản phẩm phải có ít nhất 1 dòng biến thể SKU'),
  enableSkuDimensions: z.boolean().default(false),
  packageWeight: z
    .string()
    .min(1, 'Vui lòng nhập trọng lượng gói hàng')
    .refine((val) => {
      const num = Number(val);
      return Number.isFinite(num) && num > 0 && num <= 100000;
    }, 'Trọng lượng phải từ 1g đến 100.000g'),
  packageLength: z
    .string()
    .refine((val) => !val || (Number(val) > 0 && Number(val) <= 200), 'Chiều dài hợp lệ 1–200 cm'),
  packageWidth: z
    .string()
    .refine((val) => !val || (Number(val) > 0 && Number(val) <= 200), 'Chiều rộng hợp lệ 1–200 cm'),
  packageHeight: z
    .string()
    .refine((val) => !val || (Number(val) > 0 && Number(val) <= 200), 'Chiều cao hợp lệ 1–200 cm'),
});

export type VariationOptionForm = z.infer<typeof variationOptionSchema>;
export type VariationGroupForm = z.infer<typeof variationGroupSchema>;
export type SkuRowForm = z.infer<typeof skuRowSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;

export const DEFAULT_PRODUCT_ATTRIBUTES: Record<string, string> = {
  'Series Anime': 'Jujutsu Kaisen (Chú Thuật Hồi Chiến)',
  'Chất liệu': 'Nhựa PVC & ABS cao cấp',
  'Tỷ lệ (Scale)': '1/7 Scale',
  'Chiều cao (cm)': '24',
  'Xuất xứ': 'Nhật Bản (Japan)',
  'Tình trạng hộp': 'Mới 100% Fullbox nguyên seal',
  'Độ tuổi khuyến nghị': 'Từ 14 tuổi trở lên (14+)',
};

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80'],
  title: '',
  parentCategoryId: '',
  categoryId: '',
  brandName: 'Good Smile Company (GSC)',
  characterName: 'Gojo Satoru Shibuya Ver.',
  attributes: { ...DEFAULT_PRODUCT_ATTRIBUTES },
  descriptionHtml: `<h2>Mô tả sản phẩm</h2>
<p><strong>Cam kết tại BonzStore Website:</strong></p>
<ul>
  <li>Sản phẩm mô hình Anime chính hãng được kiểm tra kỹ ngoại quan trước khi đóng gói.</li>
  <li>Đóng gói chống sốc 3 lớp (Bọc xốp nổ + Hộp carton cứng cáp).</li>
  <li>Hỗ trợ đổi trả nếu có lỗi từ nhà sản xuất (Vui lòng quay video mở hộp).</li>
</ul>`,
  variationGroups: [
    {
      id: 'var-1',
      name: 'Nhân vật / Phiên bản',
      options: [
        {
          id: 'opt-1',
          value: 'Gojo Satoru (Bản Tiêu Chuẩn)',
          imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
        },
        { id: 'opt-2', value: '', imageUrl: '' },
      ],
    },
  ],
  skus: [
    {
      id: 'sku-0',
      optionCombo: ['Gojo Satoru (Bản Tiêu Chuẩn)'],
      price: '450000',
      quantity: '25',
      sellerSku: 'FIG-JJK-GOJO-01',
      weight: '500',
      length: '25',
      width: '18',
      height: '15',
    },
  ],
  enableSkuDimensions: false,
  packageWeight: '500',
  packageLength: '25',
  packageWidth: '18',
  packageHeight: '15',
};

/**
 * Hàm đồng bộ tự động danh sách dòng SKU khi thay đổi hoặc kéo thả thứ tự Variation Groups
 */
export function buildSynchronizedSkus(
  groups: VariationGroupForm[],
  prevSkus: SkuRowForm[]
): SkuRowForm[] {
  const activeGroups = groups
    .map((g) => ({
      ...g,
      validOptions: g.options.filter((o) => o.value.trim() !== ''),
    }))
    .filter((g) => g.name.trim() !== '' && g.validOptions.length > 0);

  if (activeGroups.length === 0) {
    return [
      {
        id: 'sku-default',
        optionCombo: ['Mặc định'],
        price: prevSkus[0]?.price || '450000',
        quantity: prevSkus[0]?.quantity || '20',
        sellerSku: prevSkus[0]?.sellerSku || 'SKU-DEFAULT-01',
        weight: prevSkus[0]?.weight || '500',
        length: prevSkus[0]?.length || '25',
        width: prevSkus[0]?.width || '18',
        height: prevSkus[0]?.height || '15',
      },
    ];
  }

  let combos: string[][] = [[]];
  for (const group of activeGroups) {
    const nextCombos: string[][] = [];
    for (const combo of combos) {
      for (const opt of group.validOptions) {
        nextCombos.push([...combo, opt.value.trim()]);
      }
    }
    combos = nextCombos;
  }

  return combos.map((combo, idx) => {
    const key = combo.join(' / ');
    const existing = prevSkus.find((s) => s.optionCombo.join(' / ') === key);
    return {
      id: existing?.id || `sku-${idx}-${Date.now()}`,
      optionCombo: combo,
      price: existing?.price ?? prevSkus[0]?.price ?? '450000',
      quantity: existing?.quantity ?? prevSkus[0]?.quantity ?? '20',
      sellerSku:
        existing?.sellerSku ||
        `FIG-${combo
          .map((c) =>
            c
              .replace(/[^a-zA-Z0-9]/g, '')
              .toUpperCase()
              .slice(0, 4)
          )
          .join('-')}-${String(idx + 1).padStart(2, '0')}`,
      weight: existing?.weight ?? prevSkus[0]?.weight ?? '500',
      length: existing?.length ?? prevSkus[0]?.length ?? '25',
      width: existing?.width ?? prevSkus[0]?.width ?? '18',
      height: existing?.height ?? prevSkus[0]?.height ?? '15',
    };
  });
}
