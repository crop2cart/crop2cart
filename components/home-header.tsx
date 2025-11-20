"use client";

import { HomeHeaderClient } from "./home-header-client";

interface HomeHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export function HomeHeader({
  cartItemCount,
  onCartClick,
  onSearchChange,
  searchValue,
}: HomeHeaderProps) {
  return (
    <HomeHeaderClient
      cartItemCount={cartItemCount}
      onCartClick={onCartClick}
      onSearchChange={onSearchChange}
      searchValue={searchValue}
    />
  );
}
