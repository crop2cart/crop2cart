"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableSkeleton } from "@/components/skeletons";
import { FARMERS } from "@/lib/farmers";

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
  farmer_id?: string;
}

interface AdminRole {
  email: string;
  farmer_id: string;
  farm_name: string;
}

export function ProductManagement() {
  const { user } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    variant: "",
    fullPrice: "",
    discount: "",
    stock: "",
    description: "",
    images: [] as string[],
  });

  // Fetch admin role on mount
  useEffect(() => {
    fetchAdminRole();
  }, [user]);

  const fetchAdminRole = async () => {
    try {
      if (!user?.email) {
        setRoleLoading(false);
        return;
      }

      console.log("[ProductManagement] Fetching role for:", user.email);

      const response = await fetch("/api/admin/my-farm", {
        headers: {
          "x-user-email": user.email,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("[ProductManagement] Admin role:", result.data);
        setAdminRole(result.data);
        setSelectedFarmerId(result.data.farmer_id);
      } else {
        console.error("[ProductManagement] Error:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching admin role:", error);
    } finally {
      setRoleLoading(false);
    }
  };

  // Fetch products when role is loaded
  useEffect(() => {
    if (selectedFarmerId) {
      fetchProducts();
    }
  }, [selectedFarmerId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/by-farmer?farmer_id=${selectedFarmerId}`);
      const result = await response.json();

      setProducts(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    try {
      const formDataForUpload = new FormData();
      Array.from(files).forEach((file) => {
        formDataForUpload.append("files", file);
      });

      console.log(`[Client] Uploading ${files.length} file(s) to Cloudinary...`);

      // Use Cloudinary endpoint instead of Appwrite
      const response = await fetch("/api/upload-to-cloudinary", {
        method: "POST",
        body: formDataForUpload,
      });

      console.log("[Client] Response status:", response.status);

      const result = await response.json();
      
      console.log("[Client] Response:", result);

      if (result.success && result.data.imageUrls) {
        setFormData({
          ...formData,
          images: [...formData.images, ...result.data.imageUrls],
        });
        alert(`✅ Successfully uploaded ${result.data.count} image(s) to Cloudinary`);
      } else {
        const errorMsg = result.error || result.details || "Failed to upload images";
        console.error("[Client] Upload error:", errorMsg);
        alert(`❌ Failed to upload images: ${errorMsg}`);
      }
    } catch (error) {
      console.error("[Client] Error uploading images:", error);
      alert(`❌ Error uploading images: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `/api/products/delete?id=${id}&farmer_id=${selectedFarmerId}`,
          {
            method: "DELETE",
            headers: {
              "x-user-email": user?.email || "",
            },
          }
        );

        if (response.ok) {
          setProducts(products.filter((p) => p.id !== id));
          alert("✅ Product deleted successfully");
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.error || "Failed to delete product"}`);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("❌ Error deleting product");
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      variant: product.variant,
      fullPrice: product.fullPrice.toString(),
      discount: product.discount.toString(),
      stock: product.stock.toString(),
      description: product.description,
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fullPrice = parseInt(formData.fullPrice);
      const discount = parseInt(formData.discount) || 0;
      const finalPrice = Math.round(fullPrice - (fullPrice * discount) / 100);

      // Check if editing or creating
      if (editingId) {
        // UPDATE existing product
        const payload = {
          id: editingId,
          name: formData.name,
          variant: formData.variant,
          fullPrice,
          discount,
          stock: parseInt(formData.stock),
          description: formData.description,
          images: formData.images.length > 0 ? formData.images : undefined,
          farmer_id: selectedFarmerId,
        };

        const response = await fetch("/api/products/update", {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          fetchProducts();
          setFormData({
            name: "",
            variant: "",
            fullPrice: "",
            discount: "",
            stock: "",
            description: "",
            images: [],
          });
          setShowForm(false);
          setEditingId(null);
          alert("✅ Product updated successfully!");
        } else {
          alert(`❌ Error: ${result.error || "Failed to update product"}`);
        }
      } else {
        // CREATE new product
        const payload = {
          name: formData.name,
          variant: formData.variant,
          fullPrice,
          discount,
          stock: parseInt(formData.stock),
          description: formData.description,
          images: formData.images.length > 0 ? formData.images : undefined,
          farmer_id: selectedFarmerId,
        };

        const response = await fetch("/api/products", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          fetchProducts();
          setFormData({
            name: "",
            variant: "",
            fullPrice: "",
            discount: "",
            stock: "",
            description: "",
            images: [],
          });
          setShowForm(false);
          alert("✅ Product added successfully!");
        } else {
          alert(`❌ Error: ${result.error || "Failed to add product"}`);
        }
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("❌ Failed to submit product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              variant: "",
              fullPrice: "",
              discount: "",
              stock: "",
              description: "",
              images: [],
            });
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Assigned Farm Display */}
      {roleLoading ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <p>Loading your farm...</p>
        </div>
      ) : adminRole ? (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-700 mb-2">Your Assigned Farm:</p>
          <div className="bg-white px-4 py-3 rounded-lg border border-green-200 font-semibold text-green-800">
            🌾 {adminRole.farm_name}
          </div>
          <p className="text-xs text-green-600 mt-2">You can only manage products for this farm</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-700">
            ⚠️ No farm assigned to your account. Please contact administrator.
          </p>
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Product" : "Add New Product"} ({adminRole?.farm_name || "Farm"})
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Red Apples"
                  required
                  className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Variant (e.g., 2pcs, 1Kg) *
                </label>
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) =>
                    setFormData({ ...formData, variant: e.target.value })
                  }
                  placeholder="e.g., 2pcs"
                  required
                  className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>



              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Price (₹) *
</label>
                <input
                  type="number"
                  value={formData.fullPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, fullPrice: e.target.value })
                  }
                  placeholder="e.g., 100"
                  required
                  className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="e.g., 30"
                  min="0"
                  max="100"
                  required
                  className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.fullPrice && formData.discount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Final Price: ₹
                    {Math.round(
                      parseInt(formData.fullPrice) -
                        (parseInt(formData.fullPrice) *
                          parseInt(formData.discount)) /
                          100
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="e.g., 100"
                  required
                  className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description"
                rows={3}
                className="w-full px-3 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-3">Product Images</label>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Input */}
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="size-8 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="size-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload images</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB each)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.images.length} image(s) selected
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    variant: "",
                    fullPrice: "",
                    discount: "",
                    stock: "",
                    description: "",
                    images: [],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-6">
            <ProductTableSkeleton />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No products available
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}{product.variant}
                      </TableCell>
                      <TableCell>{product.variant}</TableCell>
                      <TableCell>₹{product.fullPrice}</TableCell>
                      <TableCell>{product.discount}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{product.finalPrice}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
