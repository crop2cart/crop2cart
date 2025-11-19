"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ProfileSkeleton } from "@/components/skeletons";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/home");
      return;
    }

    if (user) {
      setFormData({
        email: user.email || "",
        name: user.name || "",
        phone: "",
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("✅ Profile updated successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${result.error || "Failed to update profile"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="mb-4">Please log in to view your profile</p>
          <Link href="/home">
            <Button>Go to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <header className="border-b border-dashed bg-background sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex gap-2">
            <Link href="/home">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 border border-dashed rounded-lg bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-dashed rounded-lg hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-dashed rounded-lg hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Card>

          {/* Order History */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/orders">
                <Button variant="outline" className="w-full justify-start">
                  📦 View My Orders
                </Button>
              </Link>
              <Link href="/home">
                <Button variant="outline" className="w-full justify-start">
                  🛒 Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
