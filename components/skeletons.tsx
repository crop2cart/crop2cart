"use client";

import { Card } from "./ui/card";

/**
 * Product Card Skeleton Loader
 * Used on home page while products are loading
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-background border border-dashed rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative bg-muted overflow-hidden">
        <div className="relative w-full h-48 bg-gray-300"></div>

        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full"></div>
        <div className="absolute top-3 right-3 w-14 h-6 bg-gray-300 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category Skeleton */}
        <div className="w-20 h-4 bg-gray-300 rounded"></div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>

        {/* Price Skeleton */}
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-300 rounded"></div>
          <div className="h-5 w-16 bg-gray-300 rounded"></div>
        </div>

        {/* Quantity Control Skeleton */}
        <div className="w-32 h-8 bg-gray-300 rounded-lg"></div>

        {/* Button Skeleton */}
        <div className="h-9 bg-gray-300 rounded-lg w-full"></div>
      </div>
    </div>
  );
}

/**
 * Admin Product Table Skeleton Loader
 */
export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center p-4 bg-muted rounded-lg animate-pulse">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
        <div className="h-9 w-24 bg-gray-300 rounded"></div>
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-dashed rounded-lg animate-pulse">
          <div className="h-4 w-48 bg-gray-300 rounded flex-1"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Profile Page Skeleton Loader
 */
export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* Header Section */}
      <Card className="p-6 space-y-4">
        {/* Avatar Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-300 rounded"></div>
            <div className="h-4 w-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Card>

      {/* Profile Information Section */}
      <Card className="p-6 space-y-4">
        <div className="h-5 w-24 bg-gray-300 rounded mb-4"></div>

        {/* Form Fields Skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded-lg"></div>
          </div>
        ))}

        <div className="h-9 w-24 bg-gray-300 rounded"></div>
      </Card>

      {/* Additional Section */}
      <Card className="p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
        <div className="h-20 bg-gray-300 rounded-lg"></div>
      </Card>
    </div>
  );
}

/**
 * Admin Dashboard Skeleton Loader
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <div className="h-8 w-48 bg-gray-300 rounded"></div>
        <div className="h-4 w-64 bg-gray-300 rounded"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 space-y-3">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>

      {/* Content Area */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Tabs Skeleton */}
          <div className="flex gap-4 border-b border-dashed pb-4">
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
          </div>

          {/* Table/List Skeleton */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded"></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Home Page Header Skeleton Loader
 */
export function HomeHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-dashed py-8 px-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Title Skeleton */}
        <div className="h-10 w-64 bg-gray-300 rounded"></div>

        {/* Subtitle Skeleton */}
        <div className="space-y-2 max-w-2xl">
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
        </div>

        {/* Search/Filter Bar Skeleton */}
        <div className="flex gap-4 mt-6">
          <div className="h-10 flex-1 max-w-md bg-gray-300 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Order Card Skeleton Loader
 */
export function OrderCardSkeleton() {
  return (
    <Card className="p-6 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-gray-300 rounded"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
      </div>

      {/* Items */}
      <div className="space-y-3 border-t border-dashed pt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
              <div className="h-3 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-dashed pt-4 flex justify-between">
        <div className="h-5 w-16 bg-gray-300 rounded"></div>
        <div className="h-5 w-24 bg-gray-300 rounded"></div>
      </div>
    </Card>
  );
}
