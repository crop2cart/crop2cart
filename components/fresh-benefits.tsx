import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const benefits = [
  {
    title: "Direct from Farmers",
    description: "Cut out the middleman. Buy directly from local farmers and support their livelihood.",
    icon: "🌾",
  },
  {
    title: "Always Fresh",
    description: "Fruits picked at peak ripeness and delivered within 24 hours. Guaranteed freshness.",
    icon: "🍎",
  },
  {
    title: "Better Prices",
    description: "No middleman markup means lower prices for you while farmers get fair compensation.",
    icon: "💰",
  },
  {
    title: "100% Organic",
    description: "All fruits are grown naturally without pesticides or harmful chemicals.",
    icon: "🌱",
  },
  {
    title: "Community Impact",
    description: "Every purchase directly supports local farming communities and sustainable agriculture.",
    icon: "🤝",
  },
  {
    title: "Quality Assured",
    description: "Hand-picked by farmers who know their produce best. Premium quality guaranteed.",
    icon: "✨",
  },
];

export function FreshBenefits() {
  return (
    <div className="py-24 max-w-(--breakpoint-xl) mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose Crop2Cart?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the difference when you buy directly from farmers. Fresh, affordable, and sustainable.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border border-dashed hover:shadow-lg hover:border-primary/50 transition-all duration-300"
          >
            <div className="text-5xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
            <p className="text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
