'use client';

import { useTranslation } from "react-i18next";
import { useHydration } from "@/hooks/use-hydration";

const benefitsKeys = [
  { titleKey: "why.directFarmers", descKey: "why.directFarmersDesc", icon: "🌾" },
  { titleKey: "why.alwaysFresh", descKey: "why.alwaysFreshDesc", icon: "🍎" },
  { titleKey: "why.betterPrices", descKey: "why.betterPricesDesc", icon: "💰" },
  { titleKey: "why.organic", descKey: "why.organicDesc", icon: "🌱" },
  { titleKey: "why.community", descKey: "why.communityDesc", icon: "🤝" },
  { titleKey: "why.quality", descKey: "why.qualityDesc", icon: "✨" },
];

const FALLBACK_BENEFITS = {
  'why.title': 'Why Choose Crop2Cart?',
  'why.description': 'Experience the freshest produce with direct farmer connections',
  'why.directFarmers': 'Direct from Farmers',
  'why.directFarmersDesc': 'Buy directly from local farmers, no middlemen',
  'why.alwaysFresh': 'Always Fresh',
  'why.alwaysFreshDesc': 'Produce picked and delivered within 24 hours',
  'why.betterPrices': 'Better Prices',
  'why.betterPricesDesc': 'Fair prices that benefit both farmers and customers',
  'why.organic': '100% Organic',
  'why.organicDesc': 'All produce grown without harmful pesticides',
  'why.community': 'Community Support',
  'why.communityDesc': 'Support local farmers and rural communities',
  'why.quality': 'Quality Assured',
  'why.qualityDesc': 'Every product is carefully selected and verified',
};

export function FreshBenefitsClient() {
  const { t } = useTranslation();
  const isHydrated = useHydration();

  const getContent = (key: string) => {
    if (!isHydrated) {
      return FALLBACK_BENEFITS[key as keyof typeof FALLBACK_BENEFITS] || key;
    }
    return t(key);
  };

  return (
    <div className="py-24 max-w-(--breakpoint-xl) mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">{getContent('why.title')}</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {getContent('why.description')}
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefitsKeys.map((benefit, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border border-dashed hover:shadow-lg hover:border-primary/50 transition-all duration-300"
          >
            <div className="text-5xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{getContent(benefit.titleKey)}</h3>
            <p className="text-muted-foreground">{getContent(benefit.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
