"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import { Button } from "./ui/button";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  description: string;
  inStock: boolean;
  stock: number;
  category: string;
  onAddToCart: (id: string | number, quantity: number) => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  images,
  description,
  inStock,
  stock,
  category,
  onAddToCart,
}: ProductCardProps) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const handleAddToCart = () => {
    onAddToCart(id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const currentImage = images && images.length > 0 ? images[currentImageIndex] : null;

  return (
    <>
      {/* Card */}
      <div className="bg-background border border-dashed rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image Section */}
        <div className="relative bg-muted overflow-hidden group">
          {/* Image */}
          <div className="relative w-full h-32 sm:h-40 md:h-48 overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt={name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">No image</span>
              </div>
            )}
          </div>

          {/* In Stock Badge */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
              inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {inStock ? t('product.inStock') : t('product.outOfStock')}
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {discount}% OFF
            </div>
          )}

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Image Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-primary w-4"
                        : "bg-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {category}
            </span>
          </div>

          {/* Name - Clickable */}
          <button
            onClick={() => setShowModal(true)}
            className="text-left hover:text-primary transition"
          >
            <h3 className="font-bold text-sm line-clamp-2 hover:underline">
              {name}
            </h3>
          </button>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">₹{price}</span>
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1 w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 hover:bg-background rounded transition"
            >
              −
            </button>
            <span className="px-3 text-sm font-medium">{quantity}/{stock}</span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={quantity >= stock}
              className="px-2 py-1 hover:bg-background rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {quantity > stock && (
            <p className="text-xs text-red-500">Max {stock} available</p>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || quantity > stock}
            className={`w-full gap-2 transition-all ${
              addedToCart
                ? "bg-green-500 hover:bg-green-500"
                : "bg-primary hover:bg-primary/90"
            }`}
            size="sm"
            title={quantity > stock ? `Max ${stock} available` : ""}
          >
            <ShoppingCart className="size-4" />
            {addedToCart ? t('product.added') : t('product.add')}
          </Button>

          {/* View More Link */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full text-xs text-primary hover:underline py-1"
          >
            {t('product.viewDetails')}
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-background border border-dashed rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            {/* Header */}
            <div className="sticky top-0 border-b border-dashed p-3 sm:p-4 flex items-center justify-between bg-background">
              <h2 className="text-lg sm:text-xl font-bold line-clamp-1">{name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition flex-shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Images */}
              <div className="space-y-4">
                <div className="relative bg-muted rounded-lg h-80 overflow-hidden group">
                  <img
                    src={images[currentImageIndex]}
                    alt={name}
                    className="w-full h-full object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-dashed"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Category & Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-muted px-3 py-1 rounded">
                    {category}
                  </span>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded ${
                      inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {inStock ? "✓ " + t('product.inStock') : "✗ " + t('product.outOfStock')}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold">₹{price}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{originalPrice}
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      Save {discount}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">{t('product.description')}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">{t('product.details')}</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• {t('product.organic')}</p>
                    <p>• {t('product.direct')}</p>
                    <p>• {t('product.delivery')}</p>
                    <p>• {t('product.quality')}</p>
                  </div>
                </div>

                {/* Quantity & Action */}
                <div className="space-y-3 pt-4 border-t border-dashed">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('product.quantity')}
                    </label>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-2 w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 hover:bg-background rounded transition"
                      >
                        −
                      </button>
                      <span className="px-4 text-sm font-medium min-w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 hover:bg-background rounded transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      handleAddToCart();
                      setShowModal(false);
                    }}
                    disabled={!inStock}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="size-5" />
                    {t('product.add')} {quantity} {t('product.add').split(' ')[0]}
                  </Button>

                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    {t('product.continueShopping')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
