"use client";

import { Button } from "./Button";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
}

interface MenuManagerProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onAdd: () => void;
  loading?: boolean;
}

export function MenuManager({
  items,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}: MenuManagerProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
        <p className="text-gray-500 mb-lg">No menu items yet</p>
        <Button variant="primary" onClick={onAdd}>
          + Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-end mb-lg">
        <Button variant="primary" onClick={onAdd}>
          + Add Item
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-lg py-md text-left text-sm font-semibold">Name</th>
              <th className="px-lg py-md text-left text-sm font-semibold">Category</th>
              <th className="px-lg py-md text-left text-sm font-semibold">Price</th>
              <th className="px-lg py-md text-left text-sm font-semibold">Status</th>
              <th className="px-lg py-md text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                <td className="px-lg py-md">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-lg py-md text-sm">
                  {item.category ? (
                    <span className="badge text-xs">{item.category}</span>
                  ) : (
                    <span className="text-gray-500 text-xs">-</span>
                  )}
                </td>
                <td className="px-lg py-md text-sm font-semibold">
                  ₹{item.price.toFixed(0)}
                </td>
                <td className="px-lg py-md">
                  <span
                    className={`badge text-xs ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <div className="flex gap-sm justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Delete this item?")) {
                          onDelete(item.id);
                        }
                      }}
                      disabled={loading}
                      className="text-danger"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
