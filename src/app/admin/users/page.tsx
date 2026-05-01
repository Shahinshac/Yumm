"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadUsers();
  }, [isAuthenticated, user?.role, router]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const url = roleFilter === "all" ? "/admin/users" : `/admin/users?role=${roleFilter}`;
    const result = await apiCall<{ data: User[] }>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setUsers((result.data as any).data || []);
    } else {
      setError(result.error || "Failed to load users");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const result = await apiCall(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success) {
      loadUsers();
    } else {
      setError(result.error || "Failed to delete user");
    }
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  const userCounts = {
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
    RESTAURANT: users.filter((u) => u.role === "RESTAURANT").length,
    DELIVERY: users.filter((u) => u.role === "DELIVERY").length,
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - User Management</h1>
          <Link href="/admin/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Manage Users</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-lg flex gap-md flex-wrap">
          <Button
            variant={roleFilter === "all" ? "primary" : "outline"}
            onClick={() => {
              setRoleFilter("all");
              loadUsers();
            }}
          >
            All Users ({users.length})
          </Button>
          <Button
            variant={roleFilter === "CUSTOMER" ? "primary" : "outline"}
            onClick={() => setRoleFilter("CUSTOMER")}
          >
            Customers ({userCounts.CUSTOMER})
          </Button>
          <Button
            variant={roleFilter === "RESTAURANT" ? "primary" : "outline"}
            onClick={() => setRoleFilter("RESTAURANT")}
          >
            Restaurants ({userCounts.RESTAURANT})
          </Button>
          <Button
            variant={roleFilter === "DELIVERY" ? "primary" : "outline"}
            onClick={() => setRoleFilter("DELIVERY")}
          >
            Delivery ({userCounts.DELIVERY})
          </Button>
        </div>

        {/* Users Table */}
        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-lg py-md text-left text-sm font-semibold">Name</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Email</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Role</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Joined</th>
                  <th className="px-lg py-md text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-lg py-md font-semibold">{u.name}</td>
                    <td className="px-lg py-md text-sm">{u.email}</td>
                    <td className="px-lg py-md">
                      <span
                        className={`badge text-xs ${
                          u.role === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : u.role === "RESTAURANT"
                            ? "bg-orange-100 text-orange-700"
                            : u.role === "DELIVERY"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-lg py-md text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-lg py-md text-right">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-danger"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refresh */}
        {!loading && (
          <div className="mt-lg">
            <Button variant="outline" onClick={() => loadUsers()}>
              🔄 Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
