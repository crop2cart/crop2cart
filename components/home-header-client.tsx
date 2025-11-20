'use client';

import { Search, ShoppingCart, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHydration } from "@/hooks/use-hydration";
import { OTPAuthModal } from "./otp-auth-modal";
import { ProfileMenu } from "./ProfileMenu";
import { LanguageToggle } from "./language-toggle";
import { Button } from "./ui/button";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

interface HomeHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

const FALLBACK_HEADER = {
  'header.search': 'Search products...',
  'header.adminPanel': 'Admin Panel',
  'header.signIn': 'Sign In',
};

export function HomeHeaderClient({
  cartItemCount,
  onCartClick,
  onSearchChange,
  searchValue,
}: HomeHeaderProps) {
  const { t } = useTranslation();
  const isHydrated = useHydration();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  const getContent = (key: string) => {
    if (!isHydrated) {
      return FALLBACK_HEADER[key as keyof typeof FALLBACK_HEADER] || key;
    }
    return t(key);
  };

  const handleLogin = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <div className="relative bg-background border-b border-dashed sticky top-0 z-40">
        <div className="max-w-(--breakpoint-xl) mx-auto w-full px-3 sm:px-6">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-base sm:text-xl font-bold">🍎 Crop2Cart</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder={getContent('header.search')}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 rounded-lg border border-dashed bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                />
                <Search className="absolute left-3 top-2.5 size-4 sm:size-5 text-muted-foreground" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageToggle />
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      {user.role === 'admin' && (
                        <Link href="/admin">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm flex items-center gap-2"
                          >
                            <Settings className="size-4" />
                            {getContent('header.adminPanel')}
                          </Button>
                        </Link>
                      )}
                      <ProfileMenu />
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowAuthModal(true)}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      {getContent('header.signIn')}
                    </Button>
                  )}
                </>
              )}

              {/* Cart Icon */}
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <ShoppingCart className="size-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <OTPAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
}
