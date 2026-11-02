'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  fetchStorefrontCatalog,
} from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import {
  DynamicIslandPreOrder,
  MiniCartDrawer,
  QuickViewDialog,
  SearchSpotlightModal,
  SkyTreasureMapModal,
} from '../commerce';
import {
  AirshipBlogSection,
  DetectiveSpotlightSection,
  FlashSaleStallSection,
  GlassShowcaseSection,
  HeroCabinSection,
  MagicChalkboardSection,
  MemberClubSection,
  PreOrderDiarySection,
  SeoKnowledgeFaqSection,
  TrainStationSection,
  VideoBillboardSection,
} from '../sections';
import { TimeModeSwitcher } from '../ui';
import { AmbientSkyBackground } from './AmbientSkyBackground';
import { HeaderCockpit } from './HeaderCockpit';
import { LandingFooter } from './LandingFooter';
import { MobileBottomDock } from './MobileBottomDock';

export function StorefrontShell() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const { openCart } = useCart();

  const { data } = useQuery({
    queryKey: ['storefront-catalog-24h'],
    queryFn: fetchStorefrontCatalog,
  });

  const products = data?.products ?? FALLBACK_PRODUCTS;
  const categories = data?.categories ?? FALLBACK_CATEGORIES;

  const preOrderSpotlight =
    products.find((p) => p.isPreOrder) || products[products.length - 1];

  // Global Ctrl+K / Cmd+K shortcut for Search Spotlight
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      setSelectedSeries(null);
    } else {
      const matched = categories.find((c) => c.slug === slug);
      setSelectedSeries(matched ? matched.name : null);
    }
    const stationEl = document.getElementById('train-station');
    if (stationEl) {
      stationEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPreOrder = () => {
    const el = document.getElementById('preorder-diary');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="relative min-h-screen">
      {/* 24H Illustrated & Animated Sky Background (Sáng / Trưa / Tối) */}
      <AmbientSkyBackground />

      {/* Sticky Cockpit Header */}
      <HeaderCockpit
        categories={categories}
        activeCategory={
          selectedSeries
            ? categories.find((c) => c.name === selectedSeries)?.slug ?? 'all'
            : 'all'
        }
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenCart={openCart}
        onOpenPreOrder={scrollToPreOrder}
      />

      {/* Floating 24H Quick Dock (Desktop bottom-right) */}
      <div className="fixed bottom-5 right-5 z-30 hidden lg:block">
        <TimeModeSwitcher variant="floating" />
      </div>

      {/* Main 11 Storytelling Sections + AI/Search SEO Knowledge Base */}
      <main className="relative z-10">
        {/* Section 1: Airplane Cabin Window Hero */}
        <HeroCabinSection
          featuredProducts={products.slice(0, 2)}
          onOpenMap={() => setIsMapOpen(true)}
        />

        {/* Section 2: Magic Classroom Chalkboard Categories */}
        <MagicChalkboardSection
          categories={categories}
          selectedSeries={selectedSeries}
          onSelectSeries={setSelectedSeries}
        />

        {/* Section 3: Bonz Express Train Station In-Stock Cars */}
        <TrainStationSection
          products={products}
          selectedSeries={selectedSeries}
          onClearSeries={() => setSelectedSeries(null)}
        />

        {/* Section 4: Detective Case File #NK-4869 & Clue Radar */}
        <DetectiveSpotlightSection products={products.slice(1, 5)} />

        {/* Section 5: Cloud Festival Lottery Flash Sale Stall */}
        <FlashSaleStallSection products={products} />

        {/* Section 6: Pre-Order Spiral Diary & Self-Writing Fountain Pen */}
        <PreOrderDiarySection products={products} />

        {/* Section 7: Wooden Cloud 35mm Video Billboard */}
        <VideoBillboardSection />

        {/* Section 8: Museum Glass Showcase Best-Sellers */}
        <GlassShowcaseSection products={products} />

        {/* Section 9: Hand-drawn Member Club Perks */}
        <MemberClubSection />

        {/* Section 10: Airship Magazine & Collector Guides */}
        <AirshipBlogSection />

        {/* Section 11: SEO Knowledge Base & FAQ for Google, ChatGPT & Gemini */}
        <SeoKnowledgeFaqSection />
      </main>

      {/* 24H Landing Island Footer, Chalkboard Stats & Airmail */}
      <LandingFooter />

      {/* Interactive Commerce Modals, Drawers & Mobile Dock */}
      <SearchSpotlightModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
      />

      <SkyTreasureMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      <MiniCartDrawer />

      <QuickViewDialog />

      <DynamicIslandPreOrder preOrderProduct={preOrderSpotlight} />

      <MobileBottomDock
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenCart={openCart}
        onOpenPreOrder={scrollToPreOrder}
      />
    </div>
  );
}

