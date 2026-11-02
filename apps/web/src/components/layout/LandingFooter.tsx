'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTimeMode } from '../../providers/time-mode-provider';
import { TimeModeSwitcher } from '../ui';

const CHALKBOARD_STATS = [
  { value: '18.500+', label: 'Đơn hàng Figure giao thành công' },
  { value: '100%', label: 'Cam kết Chính Hãng Nhật Bản' },
  { value: '2 Giờ', label: 'Bonz Express nội thành HN & HCM' },
  { value: '4.98 ★', label: 'Đánh giá từ cộng đồng Collector' },
];

export function LandingFooter() {
  const { period, meta } = useTimeMode();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer
      data-testid="landing-footer"
      className="relative mt-20 overflow-hidden border-t-3 border-[#1E1E2E] text-white"
    >
      {/* Original BonzStore 24H Footer Sky Canvas */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          period === 'morning'
            ? 'bg-gradient-to-b from-[#0284C7] via-[#1E3A8A] to-[#0F172A]'
            : period === 'afternoon'
              ? 'bg-gradient-to-b from-[#D97706] via-[#9D174D] to-[#1E1B4B]'
              : 'bg-gradient-to-b from-[#0F1026] via-[#1B1638] to-[#070913]'
        }`}
      />

      {/* Decorative Vector Constellation & Cloud Wave Overlay */}
      <svg
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 w-full opacity-25"
      >
        <path
          fill="#FFFFFF"
          d="M0,96L80,106.7C160,117,320,139,480,138.7C640,139,800,117,960,101.3C1120,85,1280,75,1360,69.3L1440,64L1440,0L0,0Z"
        />
      </svg>

      {/* Readability Vignette Layer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090B14]/95 via-[#111528]/75 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-14 pb-28 lg:pb-16">
        {/* Top Row: 24H Chalkboard Stats + BonzStore Airmail Envelope */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 24H Wooden Chalkboard */}
          <div className="lg:col-span-7 rounded-3xl border-4 border-[var(--chalk-frame-bg)] bg-[var(--chalk-board-bg)] p-6 shadow-kawaii-lg transition-colors duration-700">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <h2 className="font-display text-lg font-black tracking-wide text-amber-200">
                  BẢNG PHẤN THỐNG KÊ BONZSTORE 24H
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-white/90">
                {meta.badgeText}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {CHALKBOARD_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-black/20 p-3.5 text-center"
                >
                  <div className="font-display text-2xl font-black text-amber-300">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/85">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3 text-xs">
              <span className="font-bold text-amber-100">
                🎨 Đổi chế độ bầu trời BonzStore trực tiếp:
              </span>
              <TimeModeSwitcher variant="full" />
            </div>
          </div>

          {/* BonzStore Airmail Newsletter Card */}
          <div className="lg:col-span-5 rounded-3xl border-3 border-[#1E1E2E] bg-[#FFFDF9] p-6 text-[#1E1E2E] shadow-kawaii-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1E1E2E] bg-[#FF6B9D] px-3 py-0.5 text-xs font-black text-white">
                <Mail className="h-3.5 w-3.5" />
                BONZSTORE AIRMAIL
              </span>
              <span className="text-xs font-black tracking-widest text-sky-600">
                BONZ EXPRESS ✈️
              </span>
            </div>

            <h3 className="font-display text-xl font-black text-[#1E1E2E]">
              Nhận Lịch Phát Hành Pre-Order & Voucher 10%
            </h3>
            <p className="mt-1 text-xs font-semibold text-[#4A4B65]">
              Mỗi tuần BonzStore gửi thông báo lịch mở cọc Good Smile Company,
              Kotobukiya, Alter, POP MART & ưu đãi độc quyền cho thành viên.
            </p>

            {subscribed ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-[#1E1E2E] bg-emerald-100 p-3 text-xs font-black text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>
                  Đăng ký thành công! Mã giảm 10%{' '}
                  <code className="underline">BONZVIP10</code> đã sẵn sàng.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email nhận lịch Pre-Order..."
                  className="flex-1 rounded-xl border-2 border-[#1E1E2E] bg-white px-3.5 py-2.5 text-xs font-bold text-[#1E1E2E] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E] bg-amber-300 px-4 py-2.5 text-xs font-black text-[#1E1E2E] shadow-kawaii-sm transition hover:-translate-y-0.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Đăng Ký</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Row: Custom BonzStore Sky Island Emblem + Store Links */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 border-t border-white/15 pt-10 lg:grid-cols-12">
          {/* Original BonzStore Floating Citadel SVG Card */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 rounded-3xl border-2 border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-[#1E1E2E] bg-gradient-to-br from-[#FF6B9D] via-[#8B5CF6] to-[#38BDF8] shadow-kawaii animate-float-slow">
              <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
                {/* Floating Sky Island Base */}
                <path
                  d="M10 42H54L46 54L32 60L18 54L10 42Z"
                  fill="#1E1E2E"
                  stroke="#FDE047"
                  strokeWidth="2"
                />
                {/* BonzStore Citadel Tower */}
                <rect
                  x="22"
                  y="18"
                  width="20"
                  height="24"
                  rx="4"
                  fill="#FFFDF9"
                  stroke="#1E1E2E"
                  strokeWidth="2.5"
                />
                <path d="M18 20L32 8L46 20H18Z" fill="#FF6B9D" stroke="#1E1E2E" strokeWidth="2" />
                <circle cx="32" cy="29" r="4" fill="#38BDF8" />
              </svg>
            </div>
            <div>
              <span className="inline-block rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-black text-[#1E1E2E]">
                TRẠM KHÔNG GIAN BONZSTORE 24H
              </span>
              <p className="mt-2 font-display text-sm font-bold text-amber-100">
                {meta.farewellQuote}
              </p>
              <p className="mt-1 text-xs text-white/75">
                Hệ thống phân phối Figure, Nendoroid, Blindbox & Manga bản quyền
                Nhật Bản uy tín hàng đầu tại Việt Nam.
              </p>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-6 sm:grid-cols-3 text-xs">
            <div>
              <h4 className="font-display text-sm font-black uppercase tracking-wider text-amber-300">
                Danh Mục BonzStore
              </h4>
              <ul className="mt-3 space-y-2 text-white/80 font-semibold">
                <li>
                  <a href="#train-station" className="hover:text-white">
                    Nendoroid & Chibi
                  </a>
                </li>
                <li>
                  <a href="#glass-showcase" className="hover:text-white">
                    Scale Figure 1/7 & 1/4
                  </a>
                </li>
                <li>
                  <a href="#preorder-diary" className="hover:text-white">
                    Sổ Tay Pre-Order Nhật Bản
                  </a>
                </li>
                <li>
                  <a href="#detective-spotlight" className="hover:text-white">
                    Hồ Sơ Thám Tử #4869
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-black uppercase tracking-wider text-amber-300">
                Đặc Quyền Khách Hàng
              </h4>
              <ul className="mt-3 space-y-2 text-white/80 font-semibold">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Bảo hành chính hãng 100%</span>
                </li>
                <li>Đóng gói hộp chống sốc Box-Care 3 lớp</li>
                <li>Trả góp & Đặt cọc linh hoạt 30%</li>
                <li>
                  <a href="/llms.txt" className="text-sky-300 hover:underline">
                    AI Catalog (/llms.txt)
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-display text-sm font-black uppercase tracking-wider text-amber-300">
                Hệ Thống Showroom
              </h4>
              <ul className="mt-3 space-y-2 text-white/80 font-semibold">
                <li className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#FF6B9D] shrink-0 mt-0.5" />
                  <span>BonzStore Hub: Quận Cầu Giấy, Hà Nội & Quận 1, TP.HCM</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                  <span>Hotline: 1900 2468 (08:00 – 22:00)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/70 sm:flex-row">
          <p className="flex items-center gap-1 font-semibold">
            <span>© {new Date().getFullYear()} BONZSTORE Official.</span>
            <span>Chế tác với</span>
            <Heart className="h-3.5 w-3.5 fill-[#FF6B9D] text-[#FF6B9D]" />
            <span>cho cộng đồng Otaku & Collector Việt Nam.</span>
          </p>
          <div className="flex items-center gap-4 font-bold">
            <a href="/sitemap.xml" className="hover:text-white">
              Sitemap
            </a>
            <a href="/robots.txt" className="hover:text-white">
              Robots
            </a>
            <a href="/llms-full.txt" className="hover:text-white">
              LLMs Full Index
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
