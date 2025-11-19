"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { ProductManagement } from "@/components/admin/product-management";
import { OrderManagement } from "@/components/admin/order-management";
import { Analytics } from "@/components/admin/analytics";
import { AdminRouteGuard } from "@/components/admin-route-guard";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-dashed sticky top-0 z-40 bg-background">
          <div className="max-w-(--breakpoint-xl) mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-2xl font-bold">🍎 Crop2Cart Admin</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2 text-xs sm:text-sm"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <Link href="/home">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-(--breakpoint-xl) mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 text-xs sm:text-sm">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <Analytics />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <OrderManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminRouteGuard>
  );
}
