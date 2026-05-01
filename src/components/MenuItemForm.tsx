"use client";

import { useState } from "react";
import { Button } from "./Button";

interface MenuItemFormProps {
  item?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category?: string;
    isAvailable: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function MenuItemForm({ item, onSubmit, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || 0,
    image: item?.image || "",
    category: item?.category || "",
    isAvailable: item?.isAvailable !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price) {
      setError("Name and price are required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-lg">
      <h3 className="text-lg font-bold mb-lg">
        {item ? "Edit Menu Item" : "Add Menu Item"}
      </h3>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
          {error}
        </div>
      )}

      <div className="space-y-md mb-lg">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-semibold mb-xs">
            Item Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Butter Chicken"
            className="input w-full"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-semibold mb-xs">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe the dish..."
            rows={3}
            className="input w-full"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block font-semibold mb-xs">
            Price (₹) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            placeholder="0.00"
            className="input w-full"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block font-semibold mb-xs">
            Category
          </label>
          <input
            id="category"
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Mains, Appetizers, Desserts"
            className="input w-full"
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="image" className="block font-semibold mb-xs">
            Image URL
          </label>
          <input
            id="image"
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="input w-full"
          />
          {formData.image && (
            <div className="mt-md">
              <img
                src={formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-md">
          <input
            id="isAvailable"
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(e) =>
              setFormData({ ...formData, isAvailable: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label htmlFor="isAvailable" className="font-semibold">
            Available for ordering
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-md">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
