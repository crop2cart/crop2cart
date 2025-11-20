"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CartItem {
  id: string;
  name: string;
  variant: string;
  finalPrice: number;
  quantity: number;
  images?: string[];
}

interface CheckoutState {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  saveInfo: boolean;
  newsletter: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CART_STORAGE_KEY = "home-guardian-cart";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^[0-9]{6}$/;
  return zipRegex.test(zipCode);
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const validateAddress = (address: string): boolean => {
  return address.trim().length >= 5;
};

const validateCity = (city: string): boolean => {
  return city.trim().length >= 2;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      alert("Please sign in to place an order");
      router.push("/home?auth=signin");
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 sm:size-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, don't render checkout
  if (!user) {
    return null;
  }
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<CheckoutState>({
    email: "",
    firstName: "",
    lastName: "",
    country: "India",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    saveInfo: false,
    newsletter: false,
  });

  // Load cart from localStorage and populate email
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }

    // Pre-fill email if user is logged in
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
      }));
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    // Reset errors
    setFormErrors({});
    
    // Validate all required fields
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format";
    }

    // First name validation
    if (!formData.firstName) {
      errors.firstName = "First name is required";
    } else if (!validateName(formData.firstName)) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    } else if (!validateName(formData.lastName)) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Address validation
    if (!formData.address) {
      errors.address = "Address is required";
    } else if (!validateAddress(formData.address)) {
      errors.address = "Address must be at least 5 characters";
    }

    // City validation
    if (!formData.city) {
      errors.city = "City is required";
    } else if (!validateCity(formData.city)) {
      errors.city = "City must be at least 2 characters";
    }

    // State validation
    if (!formData.state) {
      errors.state = "State is required";
    }

    // Zip code validation
    if (!formData.zipCode) {
      errors.zipCode = "PIN Code is required";
    } else if (!validateZipCode(formData.zipCode)) {
      errors.zipCode = "PIN Code must be exactly 6 digits";
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    // If there are errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert("Please fix all validation errors");
      return;
    }

    // Check if user is authenticated
    if (!user || !user.id) {
      alert("You must be signed in to place an order");
      router.push("/home?auth=signin");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      
      const totalAmount = cartItems.reduce(
        (sum: number, item: CartItem) => sum + item.finalPrice * item.quantity,
        0
      );

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: formData.email,
          userName: `${formData.firstName} ${formData.lastName}`,
          items: cartItems,
          totalAmount,
          shippingAddress,
          phone: formData.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderId(result.data.orderId);
        setShowSuccessModal(true);
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred while placing your order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedirectHome = () => {
    // Clear the cart after successful order
    localStorage.removeItem(CART_STORAGE_KEY);
    setShowSuccessModal(false);
    // Redirect to home page
    router.push("/home");
  };

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.finalPrice * item.quantity,
    0
  );
  const shipping = 0;
  const taxes = 0;
  const total = subtotal + shipping + taxes;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative bg-background border-b border-dashed sticky top-0 z-40">
        <div className="max-w-(--breakpoint-xl) mx-auto w-full px-6">
          <div className="h-20 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🍎 Crop2Cart</h1>
            </div>
            <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('checkout.continueShopping')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-(--breakpoint-xl) mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-8">
              <span>{t('checkout.information')}</span>
              <span className="text-muted-foreground">&gt;</span>
              <span className="text-muted-foreground">{t('checkout.shipping')}</span>
              <span className="text-muted-foreground">&gt;</span>
              <span className="text-muted-foreground">{t('checkout.payment')}</span>
            </div>

            {/* Contact Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">{t('checkout.contact')}</h2>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder={t('checkout.email')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.email ? "border-red-500" : ""}`}
                />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span className="text-sm text-muted-foreground">
                  {t('checkout.emailMe')}
                </span>
              </label>
            </div>

            {/* Shipping Address Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">{t('checkout.shippingAddress')}</h2>

              <div className="mb-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('checkout.country')} *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled
                >
                  <option>India</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t('checkout.firstName')}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.firstName ? "border-red-500" : ""}`}
                  />
                  {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder={t('checkout.lastName')}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.lastName ? "border-red-500" : ""}`}
                  />
                  {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="address"
                  placeholder={t('checkout.address')}
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.address ? "border-red-500" : ""}`}
                />
                {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="apartment"
                  placeholder={t('checkout.apartment')}
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder={t('checkout.city')}
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.city ? "border-red-500" : ""}`}
                  />
                  {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.state ? "border-red-500" : ""}`}
                  >
                    <option value="">{t('checkout.selectState')}</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {formErrors.state && <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder={t('checkout.pinCode')}
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.zipCode ? "border-red-500" : ""}`}
                  />
                  {formErrors.zipCode && <p className="text-xs text-red-500 mt-1">{formErrors.zipCode}</p>}
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="phone"
                  placeholder={t('checkout.phone')}
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-lg border border-dashed bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.phone ? "border-red-500" : ""}`}
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span className="text-sm text-muted-foreground">
                  {t('checkout.saveInfo')}
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3 text-base" 
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {t('checkout.processing')}
                </>
              ) : (
                t('checkout.placeOrder')
              )}
            </Button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="relative">
                      <img
                        src={item.images?.[0] || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-20 h-20 rounded object-cover bg-muted"
                      />
                      <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}{item.variant}</h3>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.finalPrice} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium text-sm">
                      ₹{(item.finalPrice * item.quantity).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-dashed pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.subtotalItems').replace('{count}', cartItems.length.toString())}</span>
                  <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                  <span className="font-medium">{t('checkout.calculatedNextStep')}</span>
                </div>

                <div className="border-t border-dashed pt-3 flex justify-between">
                  <span className="font-semibold">{t('checkout.total')}</span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">INR</span>
                    <div className="text-2xl font-bold text-primary">
                      ₹{total.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border border-dashed shadow-lg max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dashed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="size-6 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">{t('checkout.orderPlaced')}</h2>
              </div>
              <button
                onClick={handleRedirectHome}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('checkout.orderConfirmed')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('checkout.orderSuccessMsg')}
                </p>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{t('checkout.expectedDelivery')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('checkout.deliveryTime')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t('checkout.orderDetails')}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('checkout.orderId')}:</span>
                    <span className="font-medium">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('checkout.items')}:</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('checkout.total')}:</span>
                    <span className="font-medium">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t('checkout.confirmationEmail')}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-dashed">
              <Button 
                onClick={handleRedirectHome}
                className="w-full"
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
