'use client';

import React from 'react';
import { useTimeMode } from '../../providers/time-mode-provider';

const NIGHT_STARS = [
  { top: '6%', left: '10%', size: 'h-2 w-2', delay: '0s' },
  { top: '12%', left: '24%', size: 'h-1.5 w-1.5', delay: '0.5s' },
  { top: '8%', left: '42%', size: 'h-2.5 w-2.5', delay: '1.1s' },
  { top: '16%', left: '58%', size: 'h-1.5 w-1.5', delay: '0.3s' },
  { top: '10%', left: '76%', size: 'h-2 w-2', delay: '1.4s' },
  { top: '22%', left: '88%', size: 'h-1.5 w-1.5', delay: '0.8s' },
  { top: '26%', left: '15%', size: 'h-2 w-2', delay: '1.7s' },
  { top: '31%', left: '68%', size: 'h-1.5 w-1.5', delay: '0.4s' },
  { top: '38%', left: '6%', size: 'h-2 w-2', delay: '1.2s' },
  { top: '44%', left: '92%', size: 'h-2 w-2', delay: '0.9s' },
];

const SAKURA_PETALS = [
  { top: '12%', left: '18%', rotate: 'rotate-12', delay: '0s' },
  { top: '24%', left: '34%', rotate: '-rotate-45', delay: '0.7s' },
  { top: '15%', left: '62%', rotate: 'rotate-45', delay: '1.3s' },
  { top: '32%', left: '82%', rotate: '-rotate-12', delay: '0.4s' },
  { top: '45%', left: '12%', rotate: 'rotate-30', delay: '1.6s' },
  { top: '38%', left: '48%', rotate: '-rotate-30', delay: '0.9s' },
];

export function AmbientSkyBackground() {
  const { period } = useTimeMode();

  return (
    <div
      id="bonz-sky-world"
      data-testid="ambient-sky-background"
      data-period={period}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Layer 1: Multi-Stop Original BonzStore Sky Canvas */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          period === 'morning'
            ? 'bg-[radial-gradient(ellipse_at_top_right,_#BAE6FD_0%,_#E0F2FE_38%,_#FDF2F8_72%,_#FFFDF9_100%)]'
            : period === 'afternoon'
              ? 'bg-[radial-gradient(ellipse_at_top_right,_#FDBA74_0%,_#FDE68A_36%,_#FFEDD5_70%,_#FFF9EE_100%)]'
              : 'bg-[radial-gradient(ellipse_at_top_right,_#1E1B4B_0%,_#0F172A_45%,_#090D16_100%)]'
        }`}
      />

      {/* Layer 2: Atmospheric Aurora / Diagonal Sunbeams (God-Rays) */}
      {period === 'morning' && (
        <div className="absolute inset-0 overflow-hidden opacity-75">
          <div className="absolute -top-32 right-[10%] h-[36rem] w-44 -rotate-35 bg-gradient-to-b from-white/70 via-sky-200/30 to-transparent blur-2xl" />
          <div className="absolute -top-24 right-[28%] h-[32rem] w-32 -rotate-35 bg-gradient-to-b from-amber-100/65 via-pink-200/20 to-transparent blur-2xl" />
          <div className="absolute top-1/4 -left-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute bottom-16 right-1/4 h-80 w-80 rounded-full bg-pink-200/30 blur-3xl" />
        </div>
      )}

      {period === 'afternoon' && (
        <div className="absolute inset-0 overflow-hidden opacity-80">
          <div className="absolute -top-28 right-[8%] h-[38rem] w-56 -rotate-30 bg-gradient-to-b from-amber-300/55 via-orange-300/25 to-transparent blur-2xl" />
          <div className="absolute -top-20 right-[26%] h-[34rem] w-36 -rotate-30 bg-gradient-to-b from-rose-300/40 via-amber-200/20 to-transparent blur-2xl" />
          <div className="absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="absolute bottom-10 right-1/3 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
        </div>
      )}

      {period === 'night' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Cosmic Nebula Ribbon */}
          <div className="absolute -top-20 left-1/4 h-80 w-[44rem] -rotate-12 rounded-full bg-gradient-to-r from-indigo-600/25 via-fuchsia-500/20 to-cyan-400/20 blur-3xl" />
          <div className="absolute top-1/3 right-10 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        </div>
      )}

      {/* Layer 3: Subtle Architectural Grid & Halftone Texture */}
      <div
        className={`absolute inset-0 bg-grid-pattern bg-grid-28 transition-opacity duration-1000 ${
          period === 'night' ? 'opacity-15' : 'opacity-30'
        }`}
      />

      {/* Layer 4: Bespoke Celestial SVG Art (Top-Right Sky Anchor) */}
      <div className="absolute top-16 right-6 md:top-20 md:right-14 transition-all duration-1000">
        {period === 'morning' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute h-36 w-36 rounded-full bg-amber-200/60 blur-2xl" />
            <svg
              viewBox="0 0 160 160"
              className="relative h-28 w-28 md:h-36 md:w-36 animate-float-slow"
            >
              {/* Outer geometric sun halo */}
              <circle
                cx="80"
                cy="80"
                r="66"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.55"
              />
              <circle
                cx="80"
                cy="80"
                r="52"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="2"
                opacity="0.65"
              />
              {/* Sun rays */}
              <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.75">
                <line x1="80" y1="6" x2="80" y2="18" />
                <line x1="80" y1="142" x2="80" y2="154" />
                <line x1="6" y1="80" x2="18" y2="80" />
                <line x1="142" y1="80" x2="154" y2="80" />
                <line x1="28" y1="28" x2="37" y2="37" />
                <line x1="123" y1="123" x2="132" y2="132" />
                <line x1="132" y1="28" x2="123" y2="37" />
                <line x1="37" y1="123" x2="28" y2="132" />
              </g>
              {/* Core Morning Sun */}
              <circle cx="80" cy="80" r="36" fill="url(#bonzMorningSun)" />
              <defs>
                <radialGradient id="bonzMorningSun" cx="35%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="55%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        )}

        {period === 'afternoon' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute h-44 w-44 rounded-full bg-orange-400/50 blur-2xl" />
            {/* Retro-Anime Sliced Sunset Orb */}
            <svg
              viewBox="0 0 180 180"
              className="relative h-32 w-32 md:h-44 md:w-44 animate-float-slow"
            >
              <defs>
                <linearGradient id="bonzSunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="45%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <clipPath id="bonzSunsetSlices">
                  <rect x="0" y="0" width="180" height="96" />
                  <rect x="0" y="102" width="180" height="14" />
                  <rect x="0" y="122" width="180" height="10" />
                  <rect x="0" y="138" width="180" height="8" />
                  <rect x="0" y="152" width="180" height="6" />
                </clipPath>
              </defs>
              <circle
                cx="90"
                cy="90"
                r="74"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                opacity="0.5"
              />
              <circle
                cx="90"
                cy="90"
                r="58"
                fill="url(#bonzSunsetGrad)"
                clipPath="url(#bonzSunsetSlices)"
              />
            </svg>
          </div>
        )}

        {period === 'night' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute h-40 w-40 rounded-full bg-indigo-500/35 blur-2xl" />
            {/* Cosmic Astrolabe & Glowing Crescent Moon */}
            <svg
              viewBox="0 0 180 180"
              className="relative h-32 w-32 md:h-40 md:w-40 animate-float-slow"
            >
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#A78BFA"
                strokeWidth="1.2"
                strokeDasharray="5 5"
                opacity="0.5"
              />
              <circle
                cx="90"
                cy="90"
                r="56"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1"
                opacity="0.35"
              />
              {/* Crescent Moon Path */}
              <path
                d="M105 42C80 46 62 67 62 92C62 119 84 141 111 141C119 141 127 139 133 135C119 145 101 149 83 144C55 136 39 107 47 79C53 56 74 40 98 40C100 40 103 41 105 42Z"
                fill="#FEF08A"
              />
              {/* Sparkle Stars around Moon */}
              <path
                d="M132 54L135 62L143 65L135 68L132 76L129 68L121 65L129 62Z"
                fill="#FDE047"
              />
              <circle cx="52" cy="54" r="2.5" fill="#38BDF8" />
              <circle cx="138" cy="112" r="2" fill="#F472B6" />
            </svg>
          </div>
        )}
      </div>

      {/* Layer 5: Mode-Specific Particles (Sakura / Golden Motes / Constellations & Meteors) */}
      {period === 'morning' && (
        <div className="absolute inset-0">
          {SAKURA_PETALS.map((petal, idx) => (
            <span
              key={idx}
              style={{
                top: petal.top,
                left: petal.left,
                animationDelay: petal.delay,
              }}
              className={`absolute h-3 w-4 rounded-tl-full rounded-br-full bg-pink-300/65 shadow-sm animate-float-slow ${petal.rotate}`}
            />
          ))}
        </div>
      )}

      {period === 'afternoon' && (
        <div className="absolute inset-0">
          {NIGHT_STARS.slice(0, 7).map((mote, idx) => (
            <span
              key={idx}
              style={{
                top: mote.top,
                left: mote.left,
                animationDelay: mote.delay,
              }}
              className="absolute h-2.5 w-2.5 rotate-45 bg-amber-400/55 shadow-[0_0_12px_#F59E0B] animate-twinkle"
            />
          ))}
        </div>
      )}

      {period === 'night' && (
        <div className="absolute inset-0">
          {/* Constellation Line Graph SVG */}
          <svg
            viewBox="0 0 1440 420"
            className="absolute top-0 left-0 w-full h-80 opacity-35"
            preserveAspectRatio="none"
          >
            <g stroke="#A78BFA" strokeWidth="1" strokeDasharray="4 4" fill="none">
              <polyline points="160,70 260,120 350,85 430,150" />
              <polyline points="820,60 910,110 1020,75 1110,130 1040,190" />
            </g>
            <g fill="#FEF08A">
              <circle cx="160" cy="70" r="3" />
              <circle cx="260" cy="120" r="2.5" />
              <circle cx="350" cy="85" r="3.5" />
              <circle cx="430" cy="150" r="2.5" />
              <circle cx="820" cy="60" r="3" />
              <circle cx="910" cy="110" r="3.5" />
              <circle cx="1020" cy="75" r="2.5" />
              <circle cx="1110" cy="130" r="3" />
              <circle cx="1040" cy="190" r="2.5" />
            </g>
          </svg>

          {/* Twinkling Starfield */}
          {NIGHT_STARS.map((star, idx) => (
            <span
              key={idx}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
              }}
              className={`absolute rounded-full bg-amber-200 shadow-[0_0_10px_#FDE68A] animate-twinkle ${star.size}`}
            />
          ))}

          {/* Shooting Star / Meteor */}
          <div className="absolute top-24 left-1/3 h-0.5 w-28 -rotate-25 bg-gradient-to-r from-transparent via-cyan-200 to-white opacity-70 blur-[0.5px] animate-pulse" />
        </div>
      )}

      {/* Layer 6: Original BonzStore Sky-Rail & Floating Horizon Panorama SVG */}
      <div className="absolute inset-x-0 bottom-0 h-56 md:h-72 overflow-hidden">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {/* Distant Mountain & Cloud Layer */}
          <path
            fill={
              period === 'morning'
                ? '#BAE6FD'
                : period === 'afternoon'
                  ? '#FDE68A'
                  : '#1E1B4B'
            }
            fillOpacity={period === 'night' ? '0.55' : '0.45'}
            d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,218.7C840,213,960,171,1080,165.3C1200,160,1320,192,1380,208L1440,224L1440,320L0,320Z"
          />

          {/* Elevated Bonz Sky-Rail Viaduct Pillars & Track */}
          <g
            stroke={
              period === 'morning'
                ? '#38BDF8'
                : period === 'afternoon'
                  ? '#F59E0B'
                  : '#6366F1'
            }
            strokeOpacity={period === 'night' ? '0.40' : '0.30'}
            strokeWidth="2"
          >
            <line x1="0" y1="246" x2="1440" y2="246" />
            <line x1="0" y1="252" x2="1440" y2="252" />
            <line x1="180" y1="252" x2="180" y2="320" />
            <line x1="420" y1="252" x2="420" y2="320" />
            <line x1="660" y1="252" x2="660" y2="320" />
            <line x1="900" y1="252" x2="900" y2="320" />
            <line x1="1140" y1="252" x2="1140" y2="320" />
          </g>

          {/* Foreground Soft Cloud Bank */}
          <path
            fill={
              period === 'morning'
                ? '#FFFDF9'
                : period === 'afternoon'
                  ? '#FFF9EE'
                  : '#14172E'
            }
            fillOpacity="0.9"
            d="M0,268L80,262C160,256,320,244,480,250C640,256,800,280,960,282C1120,284,1280,264,1360,254L1440,244L1440,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
}
