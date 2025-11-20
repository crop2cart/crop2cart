"use client";

import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fruits } from "@/data/products";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";

interface ProductFilterProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onApply: () => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  products?: Array<{ name: string; variant: string }>;
}

export function ProductFilter({
  selectedCategories,
  onCategoryChange,
  onApply,
  onClear,
  isOpen = false,
  onClose,
  products = [],
}: ProductFilterProps) {
  const { t } = useTranslation();
  const [tempCategories, setTempCategories] = useState<string[]>(selectedCategories);

  // Get unique product names from products if available, otherwise from fruits data
  const categories = products.length > 0 
    ? Array.from(new Set(products.map((p) => p.name))).sort()
    : Array.from(new Set(fruits.map((fruit) => fruit.category))).sort();

  const handleTempCategoryChange = (category: string) => {
    setTempCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    // Apply changes for each selected category
    tempCategories.forEach((category) => {
      if (!selectedCategories.includes(category)) {
        onCategoryChange(category);
      }
    });
    // Remove unselected categories
    selectedCategories.forEach((category) => {
      if (!tempCategories.includes(category)) {
        onCategoryChange(category);
      }
    });
    onApply();
    // Close sidebar after applying filters
    if (onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    setTempCategories([]);
    onClear();
    // Close sidebar after clearing filters
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Filter Sidebar - Slides from left */}
      <div
        className={`fixed top-0 left-0 h-screen w-full sm:w-80 md:w-96 bg-background border-r border-dashed shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-dashed p-3 sm:p-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">{t('filter.title')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-4">
          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3">
              {t('filter.categories')}
            </h3>

            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={tempCategories.includes(category)}
                  onChange={() => handleTempCategoryChange(category)}
                  className="w-4 h-4 rounded border border-dashed cursor-pointer accent-primary"
                />
                <span className="text-xs sm:text-sm group-hover:text-foreground transition-colors">
                  {category}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({
                    products.length > 0
                      ? products.filter((p) => p.name === category).length
                      : fruits.filter((f) => f.category === category).length
                  })
                </span>
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-dashed">
            <Button
              onClick={handleApply}
              size="sm"
              className="w-full"
            >
              {t('filter.apply')}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {t('filter.clear')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
