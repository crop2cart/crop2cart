'use client';

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHydration } from "@/hooks/use-hydration";

const stepsKeys = [
  {
    number: "1",
    titleKey: "how.step1",
    descKey: "how.step1Desc",
  },
  {
    number: "2",
    titleKey: "how.step2",
    descKey: "how.step2Desc",
  },
  {
    number: "3",
    titleKey: "how.step3",
    descKey: "how.step3Desc",
  },
  {
    number: "4",
    titleKey: "how.step4",
    descKey: "how.step4Desc",
  },
];

const FALLBACK_STEPS = {
  'how.title': 'How It Works',
  'how.description': 'Simple steps to get fresh produce delivered to your door',
  'how.step1': 'Browse Products',
  'how.step1Desc': 'Explore our collection of fresh fruits and vegetables from local farmers',
  'how.step2': 'Add to Cart',
  'how.step2Desc': 'Select your favorite items and add them to your shopping cart',
  'how.step3': 'Checkout',
  'how.step3Desc': 'Review your order and proceed to secure payment',
  'how.step4': 'Get Delivered',
  'how.step4Desc': 'Receive your fresh produce within 24 hours of ordering',
};

export function HowItWorksClient() {
  const { t } = useTranslation();
  const isHydrated = useHydration();

  const getContent = (key: string) => {
    if (!isHydrated) {
      return FALLBACK_STEPS[key as keyof typeof FALLBACK_STEPS] || key;
    }
    return t(key);
  };

  return (
    <div className="py-24 max-w-(--breakpoint-xl) mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">{getContent('how.title')}</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {getContent('how.description')}
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stepsKeys.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Card */}
            <div className="p-6 rounded-xl border border-dashed bg-muted/50 h-full">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-2">{getContent(step.titleKey)}</h3>
              <p className="text-muted-foreground text-sm">{getContent(step.descKey)}</p>
            </div>

            {/* Arrow */}
            {index < stepsKeys.length - 1 && (
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <div className="w-6 h-6 rounded-full bg-background border-2 border-dashed flex items-center justify-center">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
