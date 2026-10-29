import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Eye,
  Sparkles,
  Table as TableIcon,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (nextHtml: string) => void;
  onGenerateAiDescription?: () => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
}

export function RichTextEditor({
  value,
  onChange,
  onGenerateAiDescription,
  placeholder = 'Nhập mô tả chi tiết sản phẩm, thông số mô hình, chính sách đóng gói...',
  error,
  maxLength = 10000,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [isFocused, setIsFocused] = useState(false);

  // Đồng bộ giá trị từ bên ngoài (VD: khi bấm nút AI Tạo mô tả hoặc Reset form)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || mode !== 'visual') return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value, mode]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
  };

  const execCommand = (command: string, arg?: string) => {
    if (mode !== 'visual') setMode('visual');
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const insertHtmlSnippet = (snippet: string) => {
    if (mode === 'html') {
      onChange(`${value}\n${snippet}`);
      return;
    }
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertHTML', false, snippet);
    emitChange();
  };

  const plainTextLength = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;

  return (
    <div
      className={cn(
        'rounded-xl border bg-background overflow-hidden transition-all',
        isFocused ? 'ring-2 ring-primary/20 border-primary/50' : 'border-border',
        error && 'border-destructive ring-2 ring-destructive/15'
      )}
    >
      {/* Thanh công cụ Rich Text */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-muted/40 border-b border-border">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Tiêu đề lớn (H2)"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Tiêu đề phụ (H3)"
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            type="button"
            title="In đậm (Ctrl+B)"
            onClick={() => execCommand('bold')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="In nghiêng (Ctrl+I)"
            onClick={() => execCommand('italic')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Gạch chân (Ctrl+U)"
            onClick={() => execCommand('underline')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Underline className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            type="button"
            title="Danh sách dấu đầu dòng"
            onClick={() => execCommand('insertUnorderedList')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Danh sách đánh số"
            onClick={() => execCommand('insertOrderedList')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Khối trích dẫn / Lưu ý"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Các nút chèn mẫu nhanh */}
          <button
            type="button"
            onClick={() =>
              insertHtmlSnippet(
                `<h3>📋 Bảng thông số mô hình</h3><ul><li><strong>Thương hiệu:</strong> Chính hãng</li><li><strong>Chất liệu:</strong> Nhựa PVC &amp; ABS cao cấp</li><li><strong>Kích thước:</strong> Cao 22cm</li><li><strong>Tình trạng:</strong> Fullbox mới 100%</li></ul>`
              )
            }
            className="inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-colors"
          >
            <TableIcon className="h-3 w-3 text-primary" />
            + Thông số
          </button>

          <button
            type="button"
            onClick={() =>
              insertHtmlSnippet(
                `<blockquote><p>🛡️ <strong>Cam kết BonzStore:</strong> Đóng gói chống sốc 3 lớp (Bọc xốp nổ + Carton cứng) bảo vệ hộp mô hình nguyên vẹn 100%. Hỗ trợ đổi trả miễn phí trong 7 ngày nếu có lỗi nhà sản xuất.</p></blockquote>`
              )
            }
            className="inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-colors"
          >
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            + Cam kết Shop
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {onGenerateAiDescription && (
            <button
              type="button"
              onClick={onGenerateAiDescription}
              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-semibold bg-gradient-to-r from-primary/15 via-violet-500/15 to-fuchsia-500/15 text-primary hover:from-primary/25 hover:to-fuchsia-500/25 border border-primary/30 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Viết mô tả chuẩn TikTok
            </button>
          )}

          <button
            type="button"
            onClick={() => setMode((prev) => (prev === 'visual' ? 'html' : 'visual'))}
            className={cn(
              'inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium border transition-colors',
              mode === 'html'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            )}
            title="Chuyển đổi chế độ Soạn thảo trực quan / Mã nguồn HTML"
          >
            {mode === 'html' ? (
              <>
                <Eye className="h-3 w-3" />
                Trực quan
              </>
            ) : (
              <>
                <Code2 className="h-3 w-3" />
                HTML
              </>
            )}
          </button>
        </div>
      </div>

      {/* Vùng soạn thảo */}
      {mode === 'visual' ? (
        <div className="relative">
          {plainTextLength === 0 && !isFocused && (
            <div className="pointer-events-none absolute top-3.5 left-4 text-sm text-muted-foreground/60">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              emitChange();
            }}
            onInput={emitChange}
            className="min-h-[240px] max-h-[480px] overflow-y-auto px-4 py-3.5 text-sm leading-relaxed focus:outline-none [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/5 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg [&_blockquote]:my-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:font-mono [&_code]:text-xs"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={10}
          placeholder={placeholder}
          className="w-full min-h-[240px] px-4 py-3 text-xs font-mono leading-relaxed bg-muted/10 focus:outline-none resize-y"
        />
      )}

      {/* Thanh trạng thái dưới cùng */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-muted/20 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Định dạng hỗ trợ đồng bộ TikTok Shop: <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>,{' '}
            <code>&lt;ul&gt;</code>, <code>&lt;strong&gt;</code>
          </span>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors ml-2"
              title="Xóa toàn bộ nội dung mô tả"
            >
              <RotateCcw className="h-3 w-3" />
              Làm mới
            </button>
          )}
        </div>
        <span className={cn('font-mono', plainTextLength < 20 && 'text-amber-600 font-semibold')}>
          Nội dung: {plainTextLength} ký tự (HTML: {value.length}/{maxLength})
        </span>
      </div>
    </div>
  );
}

