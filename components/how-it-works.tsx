import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Browse Fresh Produce",
    description: "Explore our catalog of fresh fruits directly from local farmers.",
  },
  {
    number: "2",
    title: "Add to Cart",
    description: "Select the fruits you want. All are picked fresh daily.",
  },
  {
    number: "3",
    title: "Quick Checkout",
    description: "Simple and secure checkout process. Your data is safe with us.",
  },
  {
    number: "4",
    title: "Next-Day Delivery",
    description: "Your order arrives fresh within 24 hours, straight from the farmer.",
  },
];

export function HowItWorks() {
  return (
    <div className="py-24 max-w-(--breakpoint-xl) mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get fresh, organic fruits in just 4 simple steps.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Card */}
            <div className="p-6 rounded-xl border border-dashed bg-muted/50 h-full">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>

            {/* Arrow */}
            {index < steps.length - 1 && (
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
