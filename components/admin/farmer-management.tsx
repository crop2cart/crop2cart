"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialFarmers = [
  {
    id: 1,
    name: "Raj Sharma",
    region: "Himachal Pradesh",
    specialty: "Apples",
    products: 5,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Patel",
    region: "Karnataka",
    specialty: "Berries",
    products: 3,
    status: "Active",
  },
  {
    id: 3,
    name: "Vijay Kumar",
    region: "Maharashtra",
    specialty: "Citrus",
    products: 4,
    status: "Active",
  },
  {
    id: 4,
    name: "Anjali Singh",
    region: "Uttar Pradesh",
    specialty: "Mangoes",
    products: 2,
    status: "Inactive",
  },
];

export function FarmerManagement() {
  const [farmers, setFarmers] = useState(initialFarmers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    specialty: "",
  });

  const handleDelete = (id: number) => {
    setFarmers(farmers.filter((f) => f.id !== id));
  };

  const handleEdit = (farmer: (typeof farmers)[0]) => {
    setEditingId(farmer.id);
    setFormData({
      name: farmer.name,
      region: farmer.region,
      specialty: farmer.specialty,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setFarmers(
        farmers.map((f) =>
          f.id === editingId
            ? {
                ...f,
                name: formData.name,
                region: formData.region,
                specialty: formData.specialty,
              }
            : f
        )
      );
      setEditingId(null);
    } else {
      const newFarmer = {
        id: Math.max(...farmers.map((f) => f.id)) + 1,
        name: formData.name,
        region: formData.region,
        specialty: formData.specialty,
        products: 0,
        status: "Active",
      };
      setFarmers([...farmers, newFarmer]);
    }

    setFormData({ name: "", region: "", specialty: "" });
    setShowForm(false);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setFarmers(
      farmers.map((f) =>
        f.id === id ? { ...f, status: newStatus } : f
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Farmer Management</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", region: "", specialty: "" });
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Farmer
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Farmer Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Raj Sharma"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  placeholder="e.g., Himachal Pradesh"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  placeholder="e.g., Apples"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update Farmer" : "Add Farmer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", region: "", specialty: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell className="font-medium">{farmer.name}</TableCell>
                <TableCell>{farmer.region}</TableCell>
                <TableCell>{farmer.specialty}</TableCell>
                <TableCell>{farmer.products}</TableCell>
                <TableCell>
                  <select
                    value={farmer.status}
                    onChange={(e) =>
                      handleStatusChange(farmer.id, e.target.value)
                    }
                    className={`px-2 py-1 rounded text-xs font-medium border border-dashed focus:outline-none focus:ring-2 focus:ring-primary ${
                      farmer.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(farmer)}
                    className="gap-1"
                  >
                    <Edit2 className="size-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(farmer.id)}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
