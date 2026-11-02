'use client';

import React from 'react';
import { Crown, Gift, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../ui';

const MEMBER_PERKS = [
  {
    id: 'perk-01',
    badge: 'HẠNG PHI CÔNG TẬP SỰ',
    title: 'Tích Điểm Dặm Bay — Đổi Voucher Tới 500K',
    desc: 'Mỗi 10.000₫ chi tiêu tích lũy 1 Dặm Bay Kawaii. Đổi trực tiếp lấy mã giảm giá hoặc hộp mù Blindbox bất kỳ.',
    bg: '#FFE5EC',
    accent: '#FFB5C2',
    icon: Gift,
  },
  {
    id: 'perk-02',
    badge: 'BẢO HIỂM HỘP BOX-CARE',
    title: 'Đóng Thùng Gỗ & Góc Xốp Chống Sốc 8 Cạnh',
    desc: 'Cam kết hộp Figure vuông vức 100% khi hạ cánh. Hoàn tiền hoặc đổi hộp mới ngay nếu móp méo do vận chuyển.',
    bg: '#E0F2FE',
    accent: '#A2D2FF',
    icon: ShieldCheck,
  },
  {
    id: 'perk-03',
    badge: 'THẺ CƠ TRƯỞNG V.I.P',
    title: 'Ưu Tiên Giữ Suất Pre-Order & Quà Sinh Nhật',
    desc: 'Miễn cọc cho đơn dưới 1.500.000₫ và nhận hộp quà Anime bất ngờ vào tháng sinh nhật của bạn.',
    bg: '#FEF9C3',
    accent: '#FFF3B0',
    icon: Crown,
  },
];

export function MemberClubSection() {
  return (
    <section
      id="section-banner-group"
      data-testid="member-club-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <SectionHeader
        chapterCode="👑 CHƯƠNG 9 · CÂU LẠC BỘ PHI HÀNH GIA KAWAII"
        title="Đặc Quyền Thành Viên — Bo Góc Vẽ Tay Thủ Công"
        badgeColor="#FFB5C2"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {MEMBER_PERKS.map((perk) => {
          const IconComponent = perk.icon;
          return (
            <article
              key={perk.id}
              style={{ backgroundColor: perk.bg }}
              className="kw-member-card flex flex-col justify-between p-6 text-[#4A3E3D]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: perk.accent }}
                    className="status-badge font-mono text-[11px]"
                  >
                    {perk.badge}
                  </span>
                  <span className="stat-card-icon">
                    <IconComponent className="h-5 w-5 text-[#4A3E3D]" />
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                  {perk.title}
                </h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-[#4A3E3D]/80">
                  {perk.desc}
                </p>
              </div>

              <div className="mt-5 border-t-2 border-dashed border-[#4A3E3D]/25 pt-3">
                <a
                  href="#section-landing-footer"
                  className="font-display text-xs font-bold text-[#E11D48] hover:underline"
                >
                  Đăng ký Thẻ Phi Hành Gia miễn phí →
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

