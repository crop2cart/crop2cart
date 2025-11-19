import Link from "next/link";
import { Button } from "./ui/button";
import { Truck, Leaf, Heart } from "lucide-react";

export function EcommerceHero() {
  return (
    <div className="min-h-screen py-12 sm:py-20 max-w-(--breakpoint-xl) mx-auto text-center px-4 sm:px-6">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-dashed bg-primary/5 mb-4 sm:mb-6 text-xs sm:text-sm">
        <Leaf className="size-3 sm:size-4 text-primary" />
        <span className="font-medium">Farm Fresh Delivered Daily</span>
      </div>

      {/* Main Heading */}
      <h1 className="mt-4 sm:mt-5 max-w-4xl mx-auto text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-bold tracking-tighter text-balance mb-4 sm:mb-6">
        Fresh Products Directly From Farmers
      </h1>

      {/* Subheading */}
      <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-muted-foreground text-balance mb-6 sm:mb-8">
        No middlemen. No markups. Just fresh, organic fruits delivered straight from local farmers to your doorstep in 24 hours.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 sm:mt-12 flex gap-2 sm:gap-4 justify-center flex-wrap">
        <Link href="/home">
          <Button size="lg" className="text-sm sm:text-base">
            Shop Fresh Fruits
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
        <div className="flex flex-col items-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
            <Leaf className="size-6 sm:size-8 text-primary" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-2">100% Organic</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">No pesticides or chemicals</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3 sm:mb-4">
            <Truck className="size-6 sm:size-8 text-green-500" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-2">24-Hour Delivery</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Picked fresh, delivered fast</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-3 sm:mb-4">
            <Heart className="size-6 sm:size-8 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-2">Support Farmers</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Fair prices for farmers</p>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mt-20 aspect-video border-2 border-dashed rounded-2xl bg-muted overflow-hidden">
        <img
          src="https://res.cloudinary.com/dpmupy9fs/image/upload/v1763552978/vivek-vk-7YV-1obuFlg-unsplash_x4rhlt.jpg"
          alt="Fresh fruits from farmers"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
