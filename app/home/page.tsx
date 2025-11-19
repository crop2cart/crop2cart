"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import { HomeHeader } from "@/components/home-header";
import { ProductCard } from "@/components/product-card";
import { CartSidebar } from "@/components/cart-sidebar";
import { ProductFilter } from "@/components/product-filter";
import { LocationFilter } from "@/components/location-filter";
import { ProductCardSkeleton, HomeHeaderSkeleton } from "@/components/skeletons";
import { FARMERS, getUserLocation, calculateFarmerDistances, getNearestFarmer } from "@/lib/farmers";

interface Product {
  id: string;
  name: string;
  variant: string;
  fullPrice: number;
  discount: number;
  finalPrice: number;
  stock: number;
  description: string;
  images?: string[];
}

interface CartItem {
  id: string;
  name: string;
  variant: string;
  finalPrice: number;
  quantity: number;
  images?: string[];
}

const CART_STORAGE_KEY = "home-guardian-cart";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [farmers, setFarmers] = useState(FARMERS);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>([]);

  // Initialize: Detect user location and auto-select nearest farmer
  useEffect(() => {
    const initializeLocation = async () => {
      console.log("[HOME] Starting location initialization...");
      const location = await getUserLocation();
      console.log("[HOME] Got location:", location);
      setUserLocation(location);

      if (location) {
        // Calculate distances and sort farmers
        const farmersWithDistances = calculateFarmerDistances(
          location.latitude,
          location.longitude,
          FARMERS
        );
        console.log("[HOME] Farmers with distances:", farmersWithDistances);
        setFarmers(farmersWithDistances);

        // Auto-select nearest farmer
        const nearest = getNearestFarmer(farmersWithDistances);
        if (nearest) {
          console.log("[HOME] Setting nearest farmer:", nearest.id);
          setSelectedFarmerId(nearest.id);
          console.log(`🎯 Auto-selected nearest farmer: ${nearest.name} (${nearest.distance} km away)`);
        }
      } else {
        console.log("[HOME] No location, using default farmer");
        setFarmers(FARMERS);
        setSelectedFarmerId(FARMERS[0].id);
      }
    };

    initializeLocation();
  }, []);

  // Fetch products on mount and when farmer changes
  useEffect(() => {
    if (selectedFarmerId) {
      console.log("[HOME] Fetching products for farmer:", selectedFarmerId);
      fetchProducts(selectedFarmerId);
    } else {
      console.log("[HOME] No farmer selected yet");
    }
  }, [selectedFarmerId]);

  const fetchProducts = async (farmerId: string) => {
    try {
      setLoading(true);
      console.log("[HOME] Fetch started for farmer:", farmerId);
      const response = await fetch(`/api/products/by-farmer?farmer_id=${farmerId}`);
      console.log("[HOME] Response status:", response.status);
      const result = await response.json();
      console.log("[HOME] Response data:", result);
      console.log("[HOME] Is array:", Array.isArray(result));
      console.log("[HOME] Result length:", result?.length);

      if (Array.isArray(result)) {
        console.log("[HOME] Setting products:", result.length);
        setProducts(result);
      } else {
        console.log("[HOME] Result is not an array!", result);
      }
    } catch (error) {
      console.error("[HOME] Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (productId: string | number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Validate stock
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      
      // Check if total quantity exceeds stock
      const totalQuantity = (existingItem?.quantity || 0) + quantity;
      if (totalQuantity > product.stock) {
        alert(`Only ${product.stock} items available. Already have ${existingItem?.quantity || 0} in cart.`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: totalQuantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          variant: product.variant,
          finalPrice: product.finalPrice,
          quantity,
          images: product.images,
        },
      ];
    });
  };

  const handleRemoveFromCart = (productId: string | number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products by search and selected product names
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variant.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If no products are selected in filter, show all
    // If products are selected, only show those
    const matchesFilter = selectedProductNames.length === 0 || selectedProductNames.includes(product.name);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <HomeHeader
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(!isCartOpen)}
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Location Filter - Top Left */}
        <div className="px-6 pt-8 max-w-(--breakpoint-xl) mx-auto w-full mb-6">
          <LocationFilter onFarmerSelect={setSelectedFarmerId} farmers={farmers} />
        </div>

        {/* Header with Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-8 px-6 max-w-(--breakpoint-xl) mx-auto w-full">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Fresh Fruits & Produce</h1>
            <p className="text-muted-foreground">
              Browse our collection of the freshest fruits, sourced directly from local farmers
            </p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed hover:bg-accent transition-colors h-fit"
          >
            <Filter className="size-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Products Section */}
        <div className="max-w-(--breakpoint-xl) mx-auto w-full px-6 py-8">
          {loading ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Loading products...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={`${product.name}${product.variant}`}
                    price={product.finalPrice}
                    originalPrice={product.fullPrice}
                    images={product.images || []}
                    description={product.description}
                    inStock={product.stock > 0}
                    stock={product.stock}
                    category={product.variant}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No fruits found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      <ProductFilter
        selectedCategories={selectedProductNames}
        onCategoryChange={(productName) => {
          setSelectedProductNames((prev) =>
            prev.includes(productName)
              ? prev.filter((name) => name !== productName)
              : [...prev, productName]
          );
        }}
        onApply={() => {
          setIsFilterOpen(false);
        }}
        onClear={() => {
          setSelectedProductNames([]);
        }}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        products={products}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
      />
    </div>
  );
}
