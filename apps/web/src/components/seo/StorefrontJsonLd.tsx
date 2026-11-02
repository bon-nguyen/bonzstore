import React from 'react';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  SITE_URL,
  STOREFRONT_SEO_FAQS,
} from '../../lib/storefront-data';

/**
 * Server Component xuất Schema.org JSON-LD (@graph) chuẩn hóa cho:
 * 1. Google Search & Google Shopping (OnlineStore, Product, Offer, AggregateRating, BreadcrumbList, FAQPage)
 * 2. ChatGPT Search / GEO (Entity disambiguation, SKU & chính sách vận chuyển/đặt cọc rõ ràng)
 * 3. Gemini AI Overviews (Knowledge Graph kết nối Thương hiệu - Series Anime - Sản phẩm - Hỏi đáp)
 */
export function StorefrontJsonLd() {
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['OnlineStore', 'Organization'],
        '@id': `${SITE_URL}/#organization`,
        name: 'BonzStore Anime 24H',
        alternateName: 'BonzStore Kawaii Figure & Manga Store',
        url: SITE_URL,
        description:
          'Cửa hàng Figure Anime, Nendoroid, Scale Figure 1/7 và Manga chính hãng Nhật Bản với trải nghiệm bầu trời 24H, Freeship đơn từ 500.000₫ và bảo hiểm hộp Box-Care.',
        currenciesAccepted: 'VND',
        paymentAccepted: 'Cash, Credit Card, Bank Transfer, MoMo, VNPay',
        priceRange: '500.000₫ - 6.000.000₫',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'VN',
          returnPolicyCategory:
            'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'BonzStore Anime 24H — Figure, Nendoroid & Manga Chính Hãng',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'vi-VN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ Khoang Bay 24H',
            item: SITE_URL,
          },
          ...FALLBACK_CATEGORIES.slice(0, 4).map((cat, idx) => ({
            '@type': 'ListItem',
            position: idx + 2,
            name: `Mô hình ${cat.name} (${cat.jpTitle})`,
            item: `${SITE_URL}/?series=${cat.slug}`,
          })),
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/#catalog`,
        name: 'Danh mục Figure Anime & Nendoroid Chính Hãng Nhật Bản tại BonzStore',
        numberOfItems: FALLBACK_PRODUCTS.length,
        itemListElement: FALLBACK_PRODUCTS.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            '@id': `${SITE_URL}/#product-${product.code}`,
            name: product.name,
            sku: product.code,
            mpn: product.skus[0]?.skuCode || product.code,
            description: product.description,
            image: product.images,
            category: `${product.category} - ${product.series}`,
            brand: {
              '@type': 'Brand',
              name: product.brand,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.soldCount,
              bestRating: 5,
              worstRating: 1,
            },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}/?product=${product.code}`,
              priceCurrency: 'VND',
              price: product.price,
              availability: product.isPreOrder
                ? 'https://schema.org/PreOrder'
                : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@id': `${SITE_URL}/#organization` },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: 0,
                  currency: 'VND',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'VN',
                },
              },
            },
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: STOREFRONT_SEO_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
    />
  );
}

