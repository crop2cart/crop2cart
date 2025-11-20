"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import { Button } from "./ui/button";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  description: string;
  inStock: boolean;
  category: string;
  onAddToCart: (id: number, quantity: number) => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  images,
  description,
  inStock,
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
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Card */}
      <div className="bg-background border border-dashed rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image Section */}
        <div className="relative bg-muted overflow-hidden group">
          {/* Image */}
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>

          {/* In Stock Badge */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
              inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
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
            <span className="px-3 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 py-1 hover:bg-background rounded transition"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full gap-2 transition-all ${
              addedToCart
                ? "bg-green-500 hover:bg-green-500"
                : "bg-primary hover:bg-primary/90"
            }`}
            size="sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-dashed rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            {/* Header */}
            <div className="sticky top-0 border-b border-dashed p-4 flex items-center justify-between bg-background">
              <h2 className="text-xl font-bold">{name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {inStock ? "✓ In Stock" : "✗ Out of Stock"}
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
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">Product Details</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• 100% Fresh & Organic</p>
                    <p>• Directly from Farmers</p>
                    <p>• 24-Hour Delivery</p>
                    <p>• Quality Assured</p>
                  </div>
                </div>

                {/* Quantity & Action */}
                <div className="space-y-3 pt-4 border-t border-dashed">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quantity
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
