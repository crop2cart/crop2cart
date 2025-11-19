"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface CartItem {
  id: string | number;
  name: string;
  variant?: string;
  finalPrice?: number;
  price?: number;
  quantity: number;
  images?: string[];
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string | number, quantity: number) => void;
  onRemove: (productId: string | number) => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}: CartSidebarProps) {
  const cartTotal = items.reduce((sum, item) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-80 md:w-96 bg-background border-l border-dashed shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-dashed p-3 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-semibold">My Cart</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl sm:text-6xl mb-4">🛒</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-lg border border-dashed bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        ₹{(item.finalPrice || item.price || 0).toFixed(0)} INR
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2.5 py-1 rounded border border-dashed hover:bg-accent transition-colors font-medium text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2.5 py-1 rounded border border-dashed hover:bg-accent transition-colors font-medium text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="ml-auto p-1 hover:bg-destructive/10 rounded transition-colors"
                        >
                          <X className="size-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t border-dashed pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toFixed(0)} INR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">₹0 INR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-dashed pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    ₹{cartTotal.toFixed(0)} INR
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" onClick={onClose} className="block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
