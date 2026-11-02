import { webApiClient } from './api-client';

export interface StorefrontSku {
  id: string;
  skuCode: string;
  label: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface StorefrontProduct {
  id: string;
  code: string;
  name: string;
  series: string;
  category: string;
  brand: string;
  scaleOrHeight?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  isPreOrder?: boolean;
  depositAmount?: number;
  releaseWindow?: string;
  preorderEndsAt?: string;
  badge?: string;
  evidenceStamp?: string;
  trainCarNo?: string;
  rating: number;
  soldCount: number;
  images: string[];
  skus: StorefrontSku[];
  description: string;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  jpTitle: string;
  slug: string;
  productCount: number;
  accentColor: string;
  tapeAngle: string;
  badge: string;
  coverImage: string;
}

export interface VideoReviewItem {
  id: string;
  title: string;
  series: string;
  duration: string;
  views: string;
  reviewer: string;
  reelCode: string;
  thumbnail: string;
  productName: string;
  productPrice: number;
}

export interface BlogArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishedAt: string;
  excerpt: string;
  coverImage: string;
  featured?: boolean;
}

export interface TreasureMapChapter {
  id: string;
  chapterNo: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  color: string;
}

export interface SeoFaqItem {
  question: string;
  answer: string;
  category: 'Chính hãng & Kiểm định' | 'Pre-Order & Đặt cọc' | 'Vận chuyển & Bảo hiểm hộp';
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bonzstore.vn';

export const STOREFRONT_SEO_FAQS: SeoFaqItem[] = [
  {
    category: 'Chính hãng & Kiểm định',
    question:
      'Làm sao để kiểm tra Figure Anime tại BonzStore là hàng chính hãng Nhật Bản 100%?',
    answer:
      'Toàn bộ mô hình Figure PVC, Scale 1/7, Nendoroid và Prize Figure tại BonzStore đều nhập khẩu chính ngạch từ Good Smile Company, Kotobukiya, Bandai Tamashii, MegaHouse và Sega. Mỗi hộp đều có tem chống giả hologram (Tem Vàng Toei / Kadokawa / Kodansha), mã JAN barcode 45/49 chuẩn Nhật và được bảo hành hoàn tiền 200% nếu phát hiện hàng giả.',
  },
  {
    category: 'Pre-Order & Đặt cọc',
    question:
      'Chính sách đặt trước (Pre-Order) Figure giới hạn tại BonzStore hoạt động như thế nào?',
    answer:
      'Khách hàng chỉ cần đặt cọc giữ suất từ 400.000₫ – 800.000₫ qua Cuốn Nhật Ký Pre-Order. Giá bán được cam kết cố định như lúc đặt cọc, miễn phí nâng cấp gói bảo hiểm hộp Box-Care và cập nhật tiến độ sản xuất tại xưởng Nhật qua thư hàng không Airmail.',
  },
  {
    category: 'Vận chuyển & Bảo hiểm hộp',
    question:
      'Đơn hàng bao nhiêu thì được Freeship và gói bảo hiểm hộp Box-Care gồm những gì?',
    answer:
      'Mọi đơn hàng từ 500.000₫ trở lên đều được Miễn Phí Vận Chuyển (Freeship toàn quốc). Hàng có sẵn tại Ga Tàu Tốc Hành Bonz Express hỗ trợ giao hỏa tốc 2 giờ nội thành, bọc chống sốc 3 lớp kèm nẹp góc xốp 8 cạnh bảo vệ hộp sưu tầm vuông vức 100%.',
  },
  {
    category: 'Chính hãng & Kiểm định',
    question:
      'Công thức đặt tên sản phẩm chuẩn SEO 6 thành phần của BonzStore giúp người mua tra cứu như thế nào?',
    answer:
      'Mỗi sản phẩm tại BonzStore đều chuẩn hóa theo công thức 6 thành phần: [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU. Nhờ đó người sưu tầm, Google Shopping, ChatGPT Search và Gemini có thể đối chiếu chính xác hãng sản xuất, tỷ lệ chiều cao (cm/scale) và mã SKU kho.',
  },
];

export const TREASURE_MAP_CHAPTERS: TreasureMapChapter[] = [
  {
    id: 'nk-hero-24h',
    chapterNo: 'CH.01',
    title: 'Khung Cửa Sổ Khoang Tàu Bay',
    subtitle: 'Bầu trời 24H & Polaroid khoang hạng nhất',
    icon: '✈️',
    badge: 'Cất cánh',
    color: '#FFB5C2',
  },
  {
    id: 'section-magic-chalkboard',
    chapterNo: 'CH.02',
    title: 'Bảng Phấn Lớp Học Phép Thuật',
    subtitle: 'Danh mục Anime & Series nổi bật',
    icon: '🏫',
    badge: '8 Học viện',
    color: '#B8F2E6',
  },
  {
    id: 'section-train-station',
    chapterNo: 'CH.03',
    title: 'Ga Tàu Tốc Hành Bonz Express',
    subtitle: 'Hàng sẵn giao ngay trong 2 giờ',
    icon: '🚂',
    badge: 'In-Stock',
    color: '#A2D2FF',
  },
  {
    id: 'section-conan-spotlight',
    chapterNo: 'CH.04',
    title: 'Hồ Sơ Thám Tử Tuyệt Mật',
    subtitle: 'Radar quét manh mối CASE NK-4869',
    icon: '🕵️',
    badge: 'Confidential',
    color: '#FFF3B0',
  },
  {
    id: 'section-flash-sale',
    chapterNo: 'CH.05',
    title: 'Quầy Xổ Số Lễ Hội Trên Mây',
    subtitle: 'Flash Sale vé số khuyết lỗ giảm tới 40%',
    icon: '🎟️',
    badge: 'Deal Nóng',
    color: '#FF8DA1',
  },
  {
    id: 'section-preorder-diary',
    chapterNo: 'CH.06',
    title: 'Cuốn Nhật Ký Pre-Order & Bút Máy',
    subtitle: 'Sổ lò xo đặt trước & Vé giữ chỗ Pop-Art',
    icon: '✒️',
    badge: 'Pre-Order',
    color: '#DCD3FF',
  },
  {
    id: 'section-video-billboard',
    chapterNo: 'CH.07',
    title: 'Bảng Gỗ Quảng Cáo Trên Mây',
    subtitle: 'Unbox thực tế trên cuộn phim 35mm',
    icon: '🎞️',
    badge: 'Unbox 4K',
    color: '#FFE5B4',
  },
  {
    id: 'section-evidence-hot',
    chapterNo: 'CH.08',
    title: 'Tủ Kính Trưng Bày Bảo Tàng',
    subtitle: 'Top Best-Sellers trên bệ gỗ spotlight',
    icon: '🏛️',
    badge: 'Museum Hot',
    color: '#B8F2E6',
  },
  {
    id: 'section-banner-group',
    chapterNo: 'CH.09',
    title: 'Câu Lạc Bộ Phi Hành Gia Kawaii',
    subtitle: 'Đặc quyền tích điểm & bảo hiểm hộp',
    icon: '👑',
    badge: 'VIP Club',
    color: '#FFB5C2',
  },
  {
    id: 'section-home-blog',
    chapterNo: 'CH.10',
    title: 'Tạp Chí Khinh Khí Cầu',
    subtitle: 'BonzStore Times — Tin tức Figure & Lịch phát hành',
    icon: '🎈',
    badge: 'Báo Mới',
    color: '#A2D2FF',
  },
  {
    id: 'section-landing-footer',
    chapterNo: 'CH.11',
    title: 'Bến Đỗ Hạ Cánh Đảo Nổi',
    subtitle: 'Thư hàng không Airmail & Bảng phấn thống kê',
    icon: '🏝️',
    badge: 'Hạ cánh',
    color: '#FFF3B0',
  },
];

export const FALLBACK_CATEGORIES: StorefrontCategory[] = [
  {
    id: 'cat-bluelock',
    name: 'Blue Lock',
    jpTitle: 'ブルーロック',
    slug: 'blue-lock',
    productCount: 48,
    accentColor: '#A2D2FF',
    tapeAngle: '-2.5deg',
    badge: 'HOT STRIKER',
    coverImage:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-jjk',
    name: 'Jujutsu Kaisen',
    jpTitle: '呪術廻戦',
    slug: 'jujutsu-kaisen',
    productCount: 74,
    accentColor: '#DCD3FF',
    tapeAngle: '2deg',
    badge: 'SHIBUYA ARC',
    coverImage:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-conan',
    name: 'Detective Conan',
    jpTitle: '名探偵コナン',
    slug: 'detective-conan',
    productCount: 62,
    accentColor: '#FFF3B0',
    tapeAngle: '-1.8deg',
    badge: 'CASE 4869',
    coverImage:
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-frieren',
    name: 'Sousou no Frieren',
    jpTitle: '葬送のフリーレン',
    slug: 'frieren',
    productCount: 39,
    accentColor: '#B8F2E6',
    tapeAngle: '2.4deg',
    badge: 'MAGE PARTY',
    coverImage:
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-kny',
    name: 'Kimetsu no Yaiba',
    jpTitle: '鬼滅の刃',
    slug: 'demon-slayer',
    productCount: 85,
    accentColor: '#FFB5C2',
    tapeAngle: '-2deg',
    badge: 'HASHIRA',
    coverImage:
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-sakamoto',
    name: 'Sakamoto Days',
    jpTitle: 'サカモトデイズ',
    slug: 'sakamoto-days',
    productCount: 31,
    accentColor: '#FFF3B0',
    tapeAngle: '1.6deg',
    badge: 'ORDER HITMAN',
    coverImage:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-spyxfamily',
    name: 'Spy × Family',
    jpTitle: 'スパイファミリー',
    slug: 'spy-x-family',
    productCount: 53,
    accentColor: '#B8F2E6',
    tapeAngle: '-2.2deg',
    badge: 'EDEN STELLA',
    coverImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-windbreaker',
    name: 'Wind Breaker',
    jpTitle: 'ウィンドブレイカー',
    slug: 'wind-breaker',
    productCount: 29,
    accentColor: '#A2D2FF',
    tapeAngle: '2.1deg',
    badge: 'BOFURIN',
    coverImage:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Chuẩn hóa theo quy tắc 6 thành phần từ .agents/rules/tiktok-product-ai-rules.md:
 * [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU
 */
export const FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'nk-prod-01',
    code: 'NK-EXP-01',
    name: '[Good Smile Company] Mô hình Nendoroid Blue Lock Isagi Yoichi & Bachira Meguru Cao 10cm - SKU NK-EXP-01',
    series: 'Blue Lock',
    category: 'Mô hình Nendoroid',
    brand: 'Good Smile Company',
    scaleOrHeight: 'Cao 10cm',
    price: 1190000,
    originalPrice: 1450000,
    discountPercent: 18,
    stock: 14,
    badge: 'TOA ĐẦU TÀU',
    trainCarNo: 'CAR-01',
    evidenceStamp: 'VERIFIED · NK',
    rating: 4.9,
    soldCount: 312,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-01-a', skuCode: 'BL-ISAGI-STD', label: 'Bản Tiêu Chuẩn (Full Box)', price: 1190000, originalPrice: 1450000, stock: 9 },
      { id: 'sku-01-b', skuCode: 'BL-ISAGI-DX', label: 'Bản Deluxe + Đế Sân Cỏ', price: 1390000, originalPrice: 1650000, stock: 5 },
    ],
    description: 'Bộ đôi tiền đạo Blue Lock chính hãng Good Smile Company cao 10cm, chất liệu PVC & ABS cao cấp kèm phụ kiện bóng lửa và hiệu ứng mảnh ghép Egoist.',
  },
  {
    id: 'nk-prod-02',
    code: 'NK-EXP-02',
    name: '[MAPPA × Shibuya Scramble] Mô hình Scale Figure 1/7 Jujutsu Kaisen Gojo Satoru Shibuya Ver. Cao 25cm - SKU NK-EXP-02',
    series: 'Jujutsu Kaisen',
    category: 'Scale Figure 1/7',
    brand: 'MAPPA × Shibuya Scramble',
    scaleOrHeight: 'Tỷ lệ 1/7 (25cm)',
    price: 4650000,
    originalPrice: 5200000,
    discountPercent: 11,
    stock: 6,
    badge: 'LIMITED 1/7',
    trainCarNo: 'CAR-02',
    evidenceStamp: 'CONFIDENTIAL',
    rating: 5.0,
    soldCount: 198,
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-02-a', skuCode: 'JJK-GOJO-17', label: 'Bản Shibuya Scramble', price: 4650000, originalPrice: 5200000, stock: 4 },
      { id: 'sku-02-b', skuCode: 'JJK-GOJO-LED', label: 'Kèm Hộp Kính LED Vô Lượng Không Xứ', price: 5150000, originalPrice: 5800000, stock: 2 },
    ],
    description: 'Mô hình tĩnh tỷ lệ 1/7 cao 25cm tái hiện khoảnh khắc Gojo Satoru tháo băng mắt tại biến cố Shibuya với hiệu ứng năng lượng trong suốt.',
  },
  {
    id: 'nk-prod-03',
    code: 'NK-CASE-4869-A',
    name: '[Kotobukiya] Mô hình Figure PVC Detective Conan Edogawa Conan & Kaitou Kid Moonlight Ver. Cao 21cm - SKU NK-CASE-4869-A',
    series: 'Detective Conan',
    category: 'Diorama Collection',
    brand: 'Kotobukiya',
    scaleOrHeight: 'Cao 21cm',
    price: 2350000,
    originalPrice: 2790000,
    discountPercent: 16,
    stock: 11,
    badge: 'CASE #4869',
    trainCarNo: 'CAR-03',
    evidenceStamp: 'TOP SECRET · 4869',
    rating: 4.95,
    soldCount: 264,
    images: [
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-03-a', skuCode: 'DC-CONAN-KID', label: 'Set Đôi Conan + Kid + Thẻ Ký Tên', price: 2350000, originalPrice: 2790000, stock: 8 },
      { id: 'sku-03-b', skuCode: 'DC-KID-SOLO', label: 'Riêng Kaitou Kid Áo Choàng Trắng', price: 1290000, originalPrice: 1490000, stock: 3 },
    ],
    description: 'Tang vật số #4869-A: Bộ sa bàn cuộc đối đầu dưới ánh trăng giữa Thám tử lừng danh Conan và Siêu đạo chích Kid 1412 cao 21cm.',
  },
  {
    id: 'nk-prod-04',
    code: 'NK-EXP-04',
    name: '[Sega Plaza] Mô hình Figure PVC Sousou no Frieren Frieren & Fern Teatime Ver. Cao 18cm - SKU NK-EXP-04',
    series: 'Sousou no Frieren',
    category: 'Prize & Luminary',
    brand: 'Sega Plaza',
    scaleOrHeight: 'Cao 18cm',
    price: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    stock: 22,
    badge: 'BEST GIFT',
    trainCarNo: 'CAR-04',
    evidenceStamp: 'VERIFIED · NK',
    rating: 4.9,
    soldCount: 418,
    images: [
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-04-a', skuCode: 'FR-TEATIME-SET', label: 'Combo Frieren + Fern Bàn Trà', price: 680000, originalPrice: 850000, stock: 15 },
      { id: 'sku-04-b', skuCode: 'FR-MIMIC-BOX', label: 'Bản Kèm Rương Quái Vật Mimic', price: 820000, originalPrice: 990000, stock: 7 },
    ],
    description: 'Khoảnh khắc thưởng trà bình yên của pháp sư Frieren và cô học trò Fern cao 18cm với tông màu pastel dịu mắt.',
  },
  {
    id: 'nk-prod-05',
    code: 'NK-SALE-05',
    name: '[Bandai Tamashii] Mô hình Figuarts ZERO Kimetsu no Yaiba Kamado Tanjiro Hinokami Kagura Cao 19cm - SKU NK-SALE-05',
    series: 'Kimetsu no Yaiba',
    category: 'Figuarts ZERO',
    brand: 'Bandai Tamashii',
    scaleOrHeight: 'Cao 19cm',
    price: 1590000,
    originalPrice: 2450000,
    discountPercent: 35,
    stock: 8,
    badge: 'FLASH -35%',
    trainCarNo: 'CAR-05',
    evidenceStamp: 'EVIDENCE #05',
    rating: 4.85,
    soldCount: 529,
    images: [
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-05-a', skuCode: 'KNY-TANJIRO-FZ', label: 'Hàng Sẵn Nguyên Seal Tem Vàng', price: 1590000, originalPrice: 2450000, stock: 8 },
    ],
    description: 'Vũ điệu Hỏa Thần Hinokami Kagura cao 19cm với hiệu ứng lửa bán trong suốt bắt sáng cực đẹp dưới ánh đèn bàn học.',
  },
  {
    id: 'nk-prod-06',
    code: 'NK-PRE-06',
    name: '[MegaHouse] Mô hình Figure PVC Sakamoto Days Sakamoto Taro & Shin Asakura Store Ver. Cao 22cm - SKU NK-PRE-06',
    series: 'Sakamoto Days',
    category: 'Pre-Order Vé Giữ Chỗ',
    brand: 'MegaHouse',
    scaleOrHeight: 'Cao 22cm',
    price: 2150000,
    originalPrice: 2500000,
    discountPercent: 14,
    stock: 19,
    isPreOrder: true,
    depositAmount: 500000,
    releaseWindow: 'Quý 4 / 2026',
    preorderEndsAt: '2026-12-31T23:59:59Z',
    badge: 'CỌC 500K',
    trainCarNo: 'CAR-06',
    evidenceStamp: 'PRE-ORDER · VIP',
    rating: 4.95,
    soldCount: 142,
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-06-a', skuCode: 'SKM-DEPOSIT', label: 'Vé Cọc Trước (500.000₫)', price: 500000, originalPrice: 500000, stock: 12 },
      { id: 'sku-06-b', skuCode: 'SKM-FULLPAY', label: 'Thanh Toán Đủ (Giảm thêm 150K + Freeship)', price: 2000000, originalPrice: 2500000, stock: 7 },
    ],
    description: 'Đặt trước chính hãng MegaHouse cao 22cm: Ông chủ tiệm tạp hóa Sakamoto cùng quầy mì ly và súng bắn kẹo cao su.',
  },
  {
    id: 'nk-prod-07',
    code: 'NK-PRE-07',
    name: '[Union Creative] Mô hình Scale Figure 1/7 Detective Conan Haibara Ai APTX-4869 Lab Ver. Cao 23cm - SKU NK-PRE-07',
    series: 'Detective Conan',
    category: 'Pre-Order Vé Giữ Chỗ',
    brand: 'Union Creative',
    scaleOrHeight: 'Tỷ lệ 1/7 (23cm)',
    price: 3290000,
    originalPrice: 3790000,
    discountPercent: 13,
    stock: 9,
    isPreOrder: true,
    depositAmount: 800000,
    releaseWindow: 'Tháng 12 / 2026',
    preorderEndsAt: '2026-12-20T23:59:59Z',
    badge: 'SẮP ĐÓNG ORDER',
    trainCarNo: 'CAR-07',
    evidenceStamp: 'APTX-4869',
    rating: 5.0,
    soldCount: 215,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-07-a', skuCode: 'DC-HAIBARA-DEP', label: 'Vé Cọc Giữ Suất (800.000₫)', price: 800000, originalPrice: 800000, stock: 6 },
      { id: 'sku-07-b', skuCode: 'DC-HAIBARA-FULL', label: 'Thanh Toán Trọn Gói (Kèm móc khóa APTX)', price: 3290000, originalPrice: 3790000, stock: 3 },
    ],
    description: 'Phiên bản giới hạn Haibara Ai tỷ lệ 1/7 cao 23cm khoác áo blouse trắng phòng thí nghiệm kèm viên thuốc APTX-4869 mạ ánh kim.',
  },
  {
    id: 'nk-prod-08',
    code: 'NK-PRE-08',
    name: '[F:NEX × FuRyu] Mô hình Figure PVC Spy × Family Anya Forger & Bond Secret Agent Ver. Cao 17cm - SKU NK-PRE-08',
    series: 'Spy × Family',
    category: 'Pre-Order Vé Giữ Chỗ',
    brand: 'F:NEX × FuRyu',
    scaleOrHeight: 'Cao 17cm',
    price: 1890000,
    originalPrice: 2290000,
    discountPercent: 17,
    stock: 16,
    isPreOrder: true,
    depositAmount: 400000,
    releaseWindow: 'Quý 1 / 2027',
    preorderEndsAt: '2026-12-28T23:59:59Z',
    badge: 'WAKU WAKU!',
    trainCarNo: 'CAR-08',
    evidenceStamp: 'OPERATION STRIX',
    rating: 4.9,
    soldCount: 387,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=700&q=80',
    ],
    skus: [
      { id: 'sku-08-a', skuCode: 'SXF-ANYA-DEP', label: 'Vé Cọc Trước (400.000₫)', price: 400000, originalPrice: 400000, stock: 10 },
      { id: 'sku-08-b', skuCode: 'SXF-ANYA-FULL', label: 'Trọn Bộ + Gói Đậu Phộng Quà Tặng', price: 1890000, originalPrice: 2290000, stock: 6 },
    ],
    description: 'Anya cưỡi chú chó tiên tri Bond cao 17cm trên thảm đỏ học viện Eden kèm 3 biểu cảm khuôn mặt có thể thay thế.',
  },
];

export const FALLBACK_VIDEO_REVIEWS: VideoReviewItem[] = [
  {
    id: 'vid-01',
    title: 'Unbox Gojo Satoru 1/7 Shibuya Scramble dưới đèn chiều hoàng hôn',
    series: 'Jujutsu Kaisen',
    duration: '03:42',
    views: '42.8K lượt xem',
    reviewer: '@MioFigureLab',
    reelCode: 'KODAK-35MM · #01',
    thumbnail:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
    productName: 'Scale Figure Gojo Satoru 1/7',
    productPrice: 4650000,
  },
  {
    id: 'vid-02',
    title: 'Soi chi tiết bộ đôi Isagi & Bachira Nendoroid — Đáng tiền từng khớp nối!',
    series: 'Blue Lock',
    duration: '02:18',
    views: '29.4K lượt xem',
    reviewer: '@KawaiiUnboxVN',
    reelCode: 'FUJI-400 · #02',
    thumbnail:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
    productName: 'Nendoroid Isagi & Bachira Set',
    productPrice: 1190000,
  },
  {
    id: 'vid-03',
    title: 'Mở hộp Tang vật #4869: Diorama Conan đối đầu Kid dưới trăng rằm',
    series: 'Detective Conan',
    duration: '04:15',
    views: '58.1K lượt xem',
    reviewer: '@HeijiCollector',
    reelCode: 'ILFORD-HP5 · #03',
    thumbnail:
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=700&q=80',
    productName: 'Conan & Kaitou Kid Diorama',
    productPrice: 2350000,
  },
];

export const FALLBACK_BLOG_ARTICLES: BlogArticleItem[] = [
  {
    id: 'blog-featured',
    title: 'Cẩm Nang Phân Biệt Figure Chính Hãng Nhật Bản (Tem Vàng Toei, Good Smile & Kotobukiya) Năm 2026',
    category: 'CẨM NANG SƯU TẦM',
    readTime: '6 phút đọc',
    publishedAt: 'Hôm nay · Khoang Báo Khinh Khí Cầu',
    excerpt:
      'Làm sao để kiểm tra tem hologram, mã serie dưới đế figure và độ sắc nét của lớp sơn PVC trước khi nhận hàng? Cùng cơ trưởng BonzStore điểm qua 5 dấu hiệu vàng bảo vệ tủ kính của bạn.',
    coverImage:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80',
    featured: true,
  },
  {
    id: 'blog-02',
    title: 'Lịch Phát Hành Figure Quý 4/2026: Tâm Điểm Blue Lock Season 2 & Conan Movie 28',
    category: 'LỊCH PHÁT HÀNH',
    readTime: '4 phút đọc',
    publishedAt: '2 ngày trước',
    excerpt:
      'Tổng hợp các mẫu Scale Figure và Nendoroid chuẩn bị mở cổng Pre-Order với ưu đãi cọc sớm tại BonzStore.',
    coverImage:
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'blog-03',
    title: 'Bí Quyết Vệ Sinh & Chống Ẩm Cho Tủ Kính Trưng Bày Figure Trong Mùa Mưa',
    category: 'CHĂM SÓC FIGURE',
    readTime: '5 phút đọc',
    publishedAt: '5 ngày trước',
    excerpt:
      'Sử dụng cọ lông mềm, hạt hút ẩm đổi màu và đèn LED không tỏa nhiệt giúp mô hình luôn tươi mới như ngày đầu mở hộp.',
    coverImage:
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=600&q=80',
  },
];

export const POPULAR_SEARCH_KEYWORDS = [
  'Blue Lock Isagi',
  'Gojo Satoru 1/7',
  'Detective Conan #4869',
  'Frieren Teatime',
  'Pre-Order Haibara',
  'Anya Forger',
  'Sakamoto Days',
];

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}₫`;
}

interface RawBackendProduct {
  id?: string;
  code?: string;
  name?: string;
  brand?: string;
  status?: string;
  tags?: string[];
  category?: { name?: string; nameVi?: string };
  skus?: Array<{
    id?: string;
    skuCode?: string;
    variantName?: string;
    color?: string;
    size?: string;
    retailPrice?: number | string;
    originalPrice?: number | string;
    availableStock?: number;
  }>;
}

function mapBackendProduct(raw: RawBackendProduct, index: number): StorefrontProduct {
  const fallback = FALLBACK_PRODUCTS[index % FALLBACK_PRODUCTS.length];
  const rawSkus = Array.isArray(raw.skus) && raw.skus.length > 0 ? raw.skus : [];

  const mappedSkus: StorefrontSku[] =
    rawSkus.length > 0
      ? rawSkus.map((sku, sIdx) => {
          const price = Number(sku.retailPrice) || fallback.price;
          const originalPrice = Number(sku.originalPrice) || Math.round(price * 1.18);
          return {
            id: sku.id || `${raw.id || index}-sku-${sIdx}`,
            skuCode: sku.skuCode || `NK-SKU-${index + 1}-${sIdx + 1}`,
            label:
              sku.variantName ||
              [sku.color, sku.size].filter(Boolean).join(' / ') ||
              'Bản Tiêu Chuẩn (Full Box)',
            price,
            originalPrice,
            stock: typeof sku.availableStock === 'number' ? sku.availableStock : 10,
          };
        })
      : fallback.skus;

  const firstSku = mappedSkus[0] || fallback.skus[0];
  const totalStock = mappedSkus.reduce((acc, item) => acc + item.stock, 0);
  const price = firstSku.price || fallback.price;
  const originalPrice = firstSku.originalPrice || Math.round(price * 1.18);
  const discountPercent =
    originalPrice > price
      ? Math.max(5, Math.round(((originalPrice - price) / originalPrice) * 100))
      : fallback.discountPercent;

  return {
    ...fallback,
    id: raw.id || fallback.id,
    code: raw.code || fallback.code,
    name: raw.name || fallback.name,
    brand: raw.brand || fallback.brand,
    category: raw.category?.nameVi || raw.category?.name || fallback.category,
    series:
      (Array.isArray(raw.tags) && raw.tags[0]) ||
      raw.category?.nameVi ||
      fallback.series,
    price,
    originalPrice,
    discountPercent,
    stock: totalStock > 0 ? totalStock : fallback.stock,
    skus: mappedSkus,
  };
}

export interface StorefrontCatalogData {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  isLiveApi: boolean;
}

export async function fetchStorefrontCatalog(): Promise<StorefrontCatalogData> {
  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      webApiClient.get('/products', { params: { limit: 16 } }),
      webApiClient.get('/categories'),
    ]);

    let products = [...FALLBACK_PRODUCTS];
    let isLiveApi = false;

    if (productsRes.status === 'fulfilled' && productsRes.value) {
      const payload = productsRes.value as unknown as {
        items?: RawBackendProduct[];
        data?: RawBackendProduct[];
      };
      const rawList = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(productsRes.value)
            ? (productsRes.value as RawBackendProduct[])
            : [];

      if (rawList.length > 0) {
        isLiveApi = true;
        const apiMapped = rawList.map((item, idx) => mapBackendProduct(item, idx));
        const existingIds = new Set(apiMapped.map((p) => p.id));
        products = [
          ...apiMapped,
          ...FALLBACK_PRODUCTS.filter((p) => !existingIds.has(p.id)),
        ];
      }
    }

    let categories = [...FALLBACK_CATEGORIES];
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
      const rawCats = Array.isArray(categoriesRes.value)
        ? (categoriesRes.value as Array<{
            id?: string;
            name?: string;
            nameVi?: string;
            productCount?: number;
          }>)
        : [];
      if (rawCats.length > 0) {
        isLiveApi = true;
        const topCats = rawCats.slice(0, 8).map((cat, idx) => {
          const fb = FALLBACK_CATEGORIES[idx % FALLBACK_CATEGORIES.length];
          return {
            ...fb,
            id: cat.id || fb.id,
            name: cat.nameVi || cat.name || fb.name,
            productCount:
              typeof cat.productCount === 'number' && cat.productCount > 0
                ? cat.productCount
                : fb.productCount,
          };
        });
        if (topCats.length >= 4) {
          categories = topCats;
        }
      }
    }

    return { products, categories, isLiveApi };
  } catch {
    return {
      products: FALLBACK_PRODUCTS,
      categories: FALLBACK_CATEGORIES,
      isLiveApi: false,
    };
  }
}
