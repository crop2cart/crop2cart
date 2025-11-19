import { BackgroundPattern } from "@/components/background-pattern";
import { Navbar } from "@/components/navbar";
import { EcommerceHero } from "@/components/ecommerce-hero";
import { FreshBenefits } from "@/components/fresh-benefits";
import { HowItWorks } from "@/components/how-it-works";

export default function Home() {
  return (
    <div>
      <div className="relative bg-primary/4">
        <Navbar />
        <EcommerceHero />
        <BackgroundPattern />
      </div>

      <FreshBenefits />
      <HowItWorks />
    </div>
  );
}
