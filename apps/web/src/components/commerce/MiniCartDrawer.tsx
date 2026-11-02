'use client';

import React from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { formatVnd } from '../../lib/storefront-data';
import { FREESHIP_THRESHOLD, useCart } from '../../providers/cart-provider';

export function MiniCartDrawer() {
  const {
    items,
    isOpen,
    totalItems,
    subtotal,
    freeshipProgress,
    amountToFreeship,
    undoState,
    lastAddedToast,
    closeCart,
    updateQuantityDebounced,
    removeItemWithUndo,
    restoreUndoItem,
    clearCart,
  } = useCart();

  return (
    <>
      {lastAddedToast && !isOpen && (
        <div
          role="status"
          aria-live="polite"
          data-testid="cart-added-toast"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl border-[2.5px] border-[#4A3E3D] bg-[#B8F2E6] px-4 py-3 text-xs font-bold text-[#4A3E3D] shadow-kw-hard md:bottom-6"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
          <span>{lastAddedToast}</span>
        </div>
      )}

      {isOpen && (
        <div
          data-testid="mini-cart-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm"
          onClick={closeCart}
          role="dialog"
          aria-modal="true"
          aria-label="Khoang Giỏ Hàng BonzStore"
        >
          <div
            className="flex h-full w-full max-w-md flex-col border-l-[3.5px] border-[#4A3E3D] bg-[#FFFDF9] text-[#4A3E3D] shadow-[-8px_0_0_#4A3E3D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-[2.5px] border-[#4A3E3D] bg-[#FFB5C2] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="stat-card-icon">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold">
                    Khoang Giỏ Hàng ({totalItems})
                  </h2>
                  <p className="font-mono text-[11px] font-bold text-[#4A3E3D]/80">
                    BONZSTORE AIR · BAGGAGE CLAIM
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                aria-label="Đóng giỏ hàng"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4A3E3D] bg-white shadow-kw-hard-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b-2 border-dashed border-[#4A3E3D]/25 bg-[#FFF3B0] px-5 py-3.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-[#0284C7]" />
                  {amountToFreeship === 0 ? (
                    <span className="text-[#059669]">
                      🎉 Đơn hàng đã đủ mốc Freeship ({formatVnd(FREESHIP_THRESHOLD)})!
                    </span>
                  ) : (
                    <span>
                      Mua thêm{' '}
                      <strong className="font-mono text-[#E11D48]">
                        {formatVnd(amountToFreeship)}
                      </strong>{' '}
                      để được Miễn Phí Bay!
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs">{freeshipProgress}%</span>
              </div>

              <div className="mt-2 h-3 w-full overflow-hidden rounded-full border-2 border-[#4A3E3D] bg-white">
                <div
                  style={{ width: `${freeshipProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#A2D2FF] via-[#B8F2E6] to-[#10B981] transition-all duration-300"
                />
              </div>
            </div>

            {undoState && (
              <div
                data-testid="cart-undo-bar"
                className="flex items-center justify-between gap-2 border-b-2 border-[#4A3E3D] bg-[#DCD3FF] px-4 py-2.5 text-xs font-bold"
              >
                <span className="truncate">
                  Đã xóa &ldquo;{undoState.item.name}&rdquo; (
                  {undoState.secondsLeft}s)
                </span>
                <button
                  type="button"
                  onClick={restoreUndoItem}
                  className="status-badge status-maintenance shrink-0 py-1 hover:bg-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Hoàn tác</span>
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#4A3E3D]/35 bg-[#FFF9F0] p-6 text-center">
                  <span className="text-4xl">🧳</span>
                  <p className="mt-2 font-display text-base font-bold">
                    Khoang hành lý đang trống
                  </p>
                  <p className="mt-1 text-xs text-[#7A6A68]">
                    Hãy ghé Ga Tàu Express hoặc Quầy Vé Số để chọn Figure yêu thích nhé!
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 rounded-2xl border-2 border-[#4A3E3D] bg-white p-3 shadow-[3px_3px_0px_#4A3E3D]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-xl border-2 border-[#4A3E3D] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="rounded bg-[#FFE5EC] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                          {item.skuLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItemWithUndo(item.key)}
                          className="rounded-lg p-1 text-[#7A6A68] hover:bg-[#FFE4E6] hover:text-[#E11D48]"
                          title="Xóa sản phẩm (Có thể hoàn tác trong 5s)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h4 className="mt-1 line-clamp-1 font-display text-xs font-bold">
                        {item.name}
                      </h4>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-[#E11D48]">
                          {formatVnd(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center rounded-xl border-2 border-[#4A3E3D] bg-[#FFF9F0]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantityDebounced(
                                item.key,
                                item.quantity - 1,
                              )
                            }
                            aria-label="Giảm số lượng"
                            className="px-2 py-1 hover:bg-[#FFB5C2]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[26px] text-center font-mono text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantityDebounced(
                                item.key,
                                item.quantity + 1,
                              )
                            }
                            aria-label="Tăng số lượng"
                            className="px-2 py-1 hover:bg-[#B8F2E6]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-[2.5px] border-[#4A3E3D] bg-[#FFF9F0] p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-display text-sm font-bold text-[#7A6A68]">
                  Tạm tính ({totalItems} món):
                </span>
                <span className="font-mono text-xl font-bold text-[#E11D48]">
                  {formatVnd(subtotal)}
                </span>
              </div>

              <div className="flex gap-2.5">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-xl border-2 border-[#4A3E3D] bg-white px-3 py-2.5 font-display text-xs font-bold hover:bg-[#FFE4E6]"
                  >
                    Dọn khoang
                  </button>
                )}
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => {
                    closeCart();
                    alert(
                      `Cảm ơn Phi hành gia! Đơn hàng ${formatVnd(subtotal)} đã sẵn sàng làm thủ tục cất cánh!`,
                    );
                  }}
                  className="action-btn-secondary flex-1"
                >
                  Làm Thủ Tục Xuất Khoang ✈️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

