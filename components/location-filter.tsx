"use client";

import { useState, useEffect } from "react";
import { ChevronDown, MapPin, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Farmer, FARMERS } from "@/lib/farmers";

export function LocationFilter({ onFarmerSelect, farmers }: { onFarmerSelect?: (farmerId: string) => void; farmers?: Farmer[] }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const displayFarmers = farmers || FARMERS;

  // Initialize with first farmer
  useEffect(() => {
    if (!selectedFarmer && displayFarmers.length > 0) {
      console.log("[LocationFilter] Initializing with first farmer:", displayFarmers[0].id);
      setSelectedFarmer(displayFarmers[0]);
      onFarmerSelect?.(displayFarmers[0].id);
    }
  }, [displayFarmers.length]);

  const handleSelectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    onFarmerSelect?.(farmer.id);
    setIsOpen(false);
  };

  if (!selectedFarmer) {
    return null;
  }

  return (
    <div className="relative w-full max-w-xs">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full border-dashed justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          <div className="text-left">
            <div className="text-xs font-medium text-muted-foreground">
              {t('filter.deliveryTo')}
            </div>
            <div className="text-sm font-semibold truncate">
              {selectedFarmer.location}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-dashed rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-dashed bg-muted/30">
            <h3 className="text-xs sm:text-sm font-semibold">{t('filter.selectFarmer')}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('filter.nearbyFarmers')}
            </p>
          </div>

          {/* Farmer List */}
          <div className="max-h-72 sm:max-h-96 overflow-y-auto">
            {displayFarmers.map((farmer) => {
              const isNearest = farmer === displayFarmers[0] && (farmer.distance || 0) < 100;
              return (
                <button
                  key={farmer.id}
                  onClick={() => handleSelectFarmer(farmer)}
                  className={`w-full px-4 py-3 text-left border-b border-dashed last:border-0 hover:bg-accent transition-colors ${
                    selectedFarmer.id === farmer.id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {farmer.name}
                        </span>
                        {selectedFarmer.id === farmer.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                        {isNearest && (
                          <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="size-2.5" />
                            Nearest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {farmer.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-primary">
                        {farmer.distance !== undefined ? `${farmer.distance} km` : farmer.area?.split(' ')[0] + ' km'}
                      </div>
                      <div className="text-xs text-muted-foreground">away</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-dashed bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              📍 Based on your current location
            </p>
          </div>
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
