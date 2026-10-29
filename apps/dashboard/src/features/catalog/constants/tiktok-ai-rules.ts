/**
 * Quy tắc AI chuẩn TikTok Shop cho trang Tạo & Chỉnh sửa Sản phẩm
 * Công thức bắt buộc:
 * [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU
 */

export const TIKTOK_TITLE_FORMULA =
  '[Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU';

export const TIKTOK_AI_RULES_FILE_PATH = '.agents/rules/tiktok-product-ai-rules.md';

export interface AiProductContext {
  title?: string;
  brandName?: string;
  parentCategoryName?: string;
  categoryName?: string;
  animeSeries?: string;
  characterName?: string;
  material?: string;
  scale?: string;
  heightCm?: string;
  origin?: string;
  condition?: string;
  ageWarning?: string;
  primarySku?: string;
  variantNames?: string[];
  packageWeightGrams?: string;
  packageDimensions?: string;
}

export interface TitleFormulaSegmentStatus {
  key: 'brand' | 'modelType' | 'animeSeries' | 'character' | 'size' | 'sku';
  label: string;
  placeholder: string;
  example: string;
  matched: boolean;
  detectedValue?: string;
  weight: number;
}

export interface TitleSeoEvaluation {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  levelLabel: string;
  segments: TitleFormulaSegmentStatus[];
  suggestions: string[];
}

const MODEL_TYPE_KEYWORDS = [
  'mô hình',
  'figure',
  'nendoroid',
  'figma',
  'gunpla',
  'gundam',
  'pop up parade',
  'ichiban kuji',
  'standee',
  'móc khóa',
  'keychain',
  'huy hiệu',
  'badge',
  'cosplay',
  'wig',
  'manga',
  'light novel',
  'artbook',
  'truyện tranh',
  'plush',
  'gấu bông',
  'statue',
  'resin',
];

const POPULAR_ANIME_KEYWORDS = [
  'one piece',
  'jujutsu kaisen',
  'demon slayer',
  'kimetsu no yaiba',
  'naruto',
  'dragon ball',
  'chainsaw man',
  'attack on titan',
  'spy x family',
  'genshin impact',
  'honkai',
  'blue lock',
  'my hero academia',
  'bleach',
  'gundam',
  'frieren',
  'solo leveling',
  'one punch man',
  'evangelion',
  'hatsune miku',
  'hololive',
  'pokemon',
];

/**
 * Suy luận "Loại mô hình" từ tên hạng mục hoặc tỷ lệ
 */
export function inferModelTypeFromCategory(categoryName?: string, scale?: string): string {
  if (!categoryName) {
    return scale && scale !== 'Non-scale' ? `Mô hình Figure ${scale}` : 'Mô hình Figure PVC';
  }
  const lower = categoryName.toLowerCase();
  if (lower.includes('nendoroid') || lower.includes('chibi')) return 'Mô hình Nendoroid Chibi';
  if (lower.includes('gunpla') || lower.includes('lắp ráp')) return 'Mô hình lắp ráp Gunpla';
  if (lower.includes('figma') || lower.includes('action')) return 'Mô hình Action Figure';
  if (lower.includes('standee')) return 'Standee Acrylic Trưng Bày';
  if (lower.includes('móc khóa') || lower.includes('huy hiệu')) return 'Móc khóa & Huy hiệu Anime';
  if (lower.includes('trang phục') || lower.includes('cosplay')) return 'Trang phục Cosplay Anime';
  if (lower.includes('tóc giả') || lower.includes('wig')) return 'Tóc giả Wig Cosplay';
  if (lower.includes('manga') || lower.includes('truyện')) return 'Truyện tranh Manga';
  if (lower.includes('light novel')) return 'Tiểu thuyết Light Novel';
  if (lower.includes('artbook')) return 'Sách ảnh Artbook';
  if (lower.includes('gấu bông') || lower.includes('plush')) return 'Thú bông Plushie Anime';
  return scale && scale !== 'Non-scale' ? `Mô hình Figure ${scale}` : 'Mô hình Figure PVC';
}

/**
 * Đánh giá tiêu đề hiện tại theo công thức 6 thành phần chuẩn TikTok Shop:
 * [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU
 */
export function evaluateProductTitleSeo(
  rawTitle: string,
  ctx: AiProductContext
): TitleSeoEvaluation {
  const title = (rawTitle || '').trim();
  const lowerTitle = title.toLowerCase();

  // 1. [Thương hiệu]
  const bracketBrandMatch = title.match(/^\[([^\]]+)\]/);
  const cleanBrand =
    ctx.brandName && !ctx.brandName.includes('No Brand')
      ? ctx.brandName.split('(')[0].trim()
      : '';
  const hasBrand =
    Boolean(bracketBrandMatch) ||
    (Boolean(cleanBrand) && lowerTitle.includes(cleanBrand.toLowerCase()));

  // 2. Loại mô hình
  const matchedModelKeyword = MODEL_TYPE_KEYWORDS.find((kw) => lowerTitle.includes(kw));
  const hasModelType = Boolean(matchedModelKeyword);

  // 3. Series Anime
  const ctxSeries = (ctx.animeSeries || '').trim();
  const matchedAnime =
    ctxSeries && lowerTitle.includes(ctxSeries.toLowerCase())
      ? ctxSeries
      : POPULAR_ANIME_KEYWORDS.find((kw) => lowerTitle.includes(kw));
  const hasAnimeSeries = Boolean(matchedAnime);

  // 4. Nhân vật
  const candidateCharacters = [
    ctx.characterName,
    ...(ctx.variantNames || []),
  ]
    .map((v) => (v || '').trim())
    .filter((v) => v.length >= 2 && !v.toLowerCase().includes('tiêu chuẩn'));

  const matchedCharacter = candidateCharacters.find((charName) => {
    const coreName = charName.split('(')[0].trim().toLowerCase();
    return coreName.length >= 2 && lowerTitle.includes(coreName);
  });
  const hasCharacter =
    Boolean(matchedCharacter) ||
    /\b(ver\.|version|gear \d|shibuya|chính hãng|limited|deluxe|fullbox)\b/i.test(title) ||
    title.split(/\s+/).length >= 9;

  // 5. Kích thước (VD: 24cm, 180mm, 1/7, 1/144, Cao 20cm)
  const sizeMatch = title.match(
    /\b(\d+(?:[.,]\d+)?\s*(?:cm|mm)|tỷ lệ\s*1\/\d+|scale\s*1\/\d+|1\/(?:4|6|7|8|12|60|100|144))\b/i
  );
  const hasSize = Boolean(sizeMatch);

  // 6. Mã SKU
  const cleanSku = (ctx.primarySku || '').trim();
  const skuRegexMatch = title.match(/\b(?:sku|mã|code)[:\s-]*([a-z0-9-_]{3,})\b/i);
  const hasSku =
    Boolean(skuRegexMatch) ||
    (cleanSku.length >= 3 && lowerTitle.includes(cleanSku.toLowerCase()));

  const segments: TitleFormulaSegmentStatus[] = [
    {
      key: 'brand',
      label: '[Thương hiệu]',
      placeholder: cleanBrand ? `[${cleanBrand}]` : '[Good Smile Company]',
      example: '[Good Smile Company]',
      matched: hasBrand,
      detectedValue: bracketBrandMatch ? `[${bracketBrandMatch[1]}]` : cleanBrand || undefined,
      weight: 18,
    },
    {
      key: 'modelType',
      label: 'Loại mô hình',
      placeholder: inferModelTypeFromCategory(ctx.categoryName, ctx.scale),
      example: 'Mô hình Figure PVC',
      matched: hasModelType,
      detectedValue: matchedModelKeyword,
      weight: 18,
    },
    {
      key: 'animeSeries',
      label: 'Series Anime',
      placeholder: ctxSeries || 'Jujutsu Kaisen',
      example: 'Jujutsu Kaisen',
      matched: hasAnimeSeries,
      detectedValue: matchedAnime || undefined,
      weight: 18,
    },
    {
      key: 'character',
      label: 'Nhân vật',
      placeholder: matchedCharacter || candidateCharacters[0] || 'Gojo Satoru Ver.',
      example: 'Gojo Satoru Shibuya Ver.',
      matched: hasCharacter,
      detectedValue: matchedCharacter || undefined,
      weight: 16,
    },
    {
      key: 'size',
      label: 'Kích thước',
      placeholder: ctx.heightCm ? `Cao ${ctx.heightCm}cm` : 'Cao 24cm',
      example: 'Cao 24cm',
      matched: hasSize,
      detectedValue: sizeMatch ? sizeMatch[0] : undefined,
      weight: 15,
    },
    {
      key: 'sku',
      label: 'Mã SKU',
      placeholder: cleanSku ? `SKU ${cleanSku}` : 'SKU FIG-01',
      example: 'SKU FIG-JJK-01',
      matched: hasSku,
      detectedValue: skuRegexMatch ? skuRegexMatch[0] : cleanSku || undefined,
      weight: 15,
    },
  ];

  const rawScore = segments.reduce((sum, seg) => sum + (seg.matched ? seg.weight : 0), 0);
  const lengthBonus = title.length >= 50 && title.length <= 160 ? 0 : title.length < 25 ? -10 : 0;
  const score = Math.max(0, Math.min(100, rawScore + lengthBonus));

  const suggestions: string[] = [];
  if (!hasBrand) {
    suggestions.push('Thêm [Thương hiệu] trong ngoặc vuông ở đầu tên (VD: [Bandai Spirits]).');
  }
  if (!hasModelType) {
    suggestions.push('Bổ sung Loại mô hình (VD: Mô hình Figure PVC, Nendoroid, Gunpla).');
  }
  if (!hasAnimeSeries) {
    suggestions.push('Thêm tên bộ Series Anime để tăng khả năng tìm kiếm tự nhiên.');
  }
  if (!hasCharacter) {
    suggestions.push('Thêm tên Nhân vật và phiên bản (Ver.).');
  }
  if (!hasSize) {
    suggestions.push('Bổ sung Kích thước chiều cao (VD: Cao 24cm) hoặc tỷ lệ (1/7).');
  }
  if (!hasSku) {
    suggestions.push('Đặt Mã SKU ở cuối tên (VD: SKU FIG-OP-01) để đồng bộ kho nhanh.');
  }

  let level: TitleSeoEvaluation['level'] = 'poor';
  let levelLabel = 'Cần tối ưu thêm';
  if (score >= 85) {
    level = 'excellent';
    levelLabel = 'Chuẩn SEO Website';
  } else if (score >= 65) {
    level = 'good';
    levelLabel = 'Khá tốt';
  } else if (score >= 40) {
    level = 'fair';
    levelLabel = 'Trung bình';
  }

  return {
    score,
    level,
    levelLabel,
    segments,
    suggestions,
  };
}

export interface AiGeneratedTitleCandidate {
  id: string;
  styleLabel: string;
  title: string;
  formulaBreakdown: {
    brand: string;
    modelType: string;
    animeSeries: string;
    character: string;
    size: string;
    sku: string;
  };
}

/**
 * AI sinh danh sách gợi ý tên sản phẩm bám sát công thức:
 * [Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU
 */
export function generateAiProductTitles(ctx: AiProductContext): AiGeneratedTitleCandidate[] {
  const rawBrand =
    ctx.brandName && !ctx.brandName.includes('No Brand')
      ? ctx.brandName.split('(')[0].trim()
      : 'Chính Hãng';
  const brandTag = `[${rawBrand}]`;

  const modelType = inferModelTypeFromCategory(ctx.categoryName, ctx.scale);
  const animeSeries = (ctx.animeSeries || '').trim() || 'Jujutsu Kaisen';

  const firstVariant = (ctx.variantNames || [])
    .map((v) => v.trim())
    .find((v) => v && !v.toLowerCase().includes('tiêu chuẩn'));

  const character =
    (ctx.characterName || '').trim() ||
    firstVariant ||
    'Gojo Satoru Shibuya Ver.';

  const heightVal = (ctx.heightCm || '').replace(/[^0-9.,]/g, '').trim() || '22';
  const scaleText =
    ctx.scale && ctx.scale !== 'Non-scale' ? `${ctx.scale} ` : '';
  const sizeText = `${scaleText}Cao ${heightVal}cm`.trim();

  const skuCode =
    (ctx.primarySku || '').trim() ||
    `FIG-${animeSeries
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 3) || 'ANI'}-01`;

  return [
    {
      id: 'standard-seo',
      styleLabel: 'Chuẩn Công thức 100% (Khuyên dùng)',
      title: `${brandTag} ${modelType} ${animeSeries} ${character} ${sizeText} - SKU ${skuCode}`,
      formulaBreakdown: {
        brand: brandTag,
        modelType,
        animeSeries,
        character,
        size: sizeText,
        sku: `SKU ${skuCode}`,
      },
    },
    {
      id: 'collector-edition',
      styleLabel: 'Tối ưu chuyển đổi Sưu tầm (Fullbox)',
      title: `${brandTag} ${modelType} ${animeSeries} - Nhân vật ${character} Fullbox ${sizeText} (Mã SKU: ${skuCode})`,
      formulaBreakdown: {
        brand: brandTag,
        modelType,
        animeSeries,
        character: `${character} Fullbox`,
        size: sizeText,
        sku: `Mã SKU: ${skuCode}`,
      },
    },
    {
      id: 'compact-mobile',
      styleLabel: 'Ngắn gọn hiển thị tốt trên Mobile',
      title: `${brandTag} ${modelType} ${animeSeries} ${character} ${heightVal}cm [${skuCode}]`,
      formulaBreakdown: {
        brand: brandTag,
        modelType,
        animeSeries,
        character,
        size: `${heightVal}cm`,
        sku: `[${skuCode}]`,
      },
    },
  ];
}

/**
 * AI sinh nội dung mô tả sản phẩm định dạng Rich HTML chuẩn TikTok Shop
 */
export function generateAiProductDescriptionHtml(ctx: AiProductContext): string {
  const brand =
    ctx.brandName && !ctx.brandName.includes('No Brand')
      ? ctx.brandName
      : 'Chính hãng tuyển chọn';
  const modelType = inferModelTypeFromCategory(ctx.categoryName, ctx.scale);
  const series = ctx.animeSeries || 'Anime / Manga Nhật Bản';
  const character =
    ctx.characterName ||
    (ctx.variantNames && ctx.variantNames.length > 0
      ? ctx.variantNames.join(', ')
      : 'Phiên bản tiêu chuẩn');
  const material = ctx.material || 'Nhựa PVC & ABS cao cấp an toàn';
  const height = ctx.heightCm ? `${ctx.heightCm} cm` : '20 - 24 cm';
  const scale = ctx.scale || 'Non-scale';
  const origin = ctx.origin || 'Nhật Bản (Japan)';
  const condition = ctx.condition || 'Mới 100% Fullbox nguyên seal';
  const sku = ctx.primarySku || 'BONZ-SKU-01';
  const displayTitle =
    ctx.title?.trim() ||
    `[${brand.split('(')[0].trim()}] ${modelType} ${series} ${character} Cao ${height} - SKU ${sku}`;

  return `<h2>🔥 ${displayTitle}</h2>
<p>Chào mừng bạn đến với <strong>BonzStore</strong>! Sản phẩm <strong>${modelType} ${series} - ${character}</strong> được chế tác sắc nét từng chi tiết, màu sơn bền đẹp theo thời gian, cực kỳ thích hợp để trưng bày góc gaming, bàn làm việc hoặc làm quà tặng cho fan <em>${series}</em>.</p>

<h3>📋 Thông số kỹ thuật chi tiết</h3>
<ul>
  <li><strong>Thương hiệu:</strong> ${brand}</li>
  <li><strong>Loại mô hình:</strong> ${modelType} (${ctx.categoryName || 'Mô hình & Đồ chơi Anime'})</li>
  <li><strong>Series Anime / Game:</strong> ${series}</li>
  <li><strong>Nhân vật / Phiên bản:</strong> ${character}</li>
  <li><strong>Chất liệu:</strong> ${material}</li>
  <li><strong>Kích thước / Tỷ lệ:</strong> Cao ${height} (${scale})</li>
  <li><strong>Xuất xứ:</strong> ${origin}</li>
  <li><strong>Tình trạng hộp:</strong> ${condition}</li>
  <li><strong>Mã định danh SKU:</strong> <code>${sku}</code></li>
</ul>

<h3>✨ Điểm nổi bật của sản phẩm</h3>
<ul>
  <li>Đường nét điêu khắc khuôn mặt và trang phục chuẩn nguyên tác <strong>${series}</strong>.</li>
  <li>Chất liệu <strong>${material}</strong> cứng cáp, khớp nối và đế đứng (base) chắc chắn.</li>
  <li>Màu sơn phủ tĩnh điện chống phai màu dưới ánh đèn LED tủ trưng bày.</li>
</ul>

<h3>🛡️ Cam kết & Chính sách Bảo hành tại Website BonzStore</h3>
<blockquote>
  <p>✅ <strong>Đóng gói tiêu chuẩn 3 lớp:</strong> Bọc xốp nổ chống sốc + hộp carton cứng cáp bảo vệ hộp mô hình không móp méo khi vận chuyển.<br/>
  ✅ <strong>Hỗ trợ đổi trả miễn phí:</strong> Đổi trả trong 7 ngày theo chính sách bảo hành Website nếu phát sinh lỗi từ nhà sản xuất (vui lòng quay video mở hộp).<br/>
  ✅ <strong>Tư vấn tận tâm 24/7:</strong> Nhắn tin ngay cho shop nếu bạn cần chụp ảnh thực tế tại kho!</p>
</blockquote>`;
}

