"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, RegisterResponse } from "@/lib/api";
import { Button } from "@/components/Button";

interface RegisterFormProps {
  role: "CUSTOMER" | "RESTAURANT" | "DELIVERY";
  onSuccess?: () => void;
}

export function RegisterForm({ role, onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    shopName: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await apiCall<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        role,
      }),
    });

    if (result.success && result.data) {
      // Store tokens
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      if (onSuccess) onSuccess();

      // Redirect
      if (role === "RESTAURANT") {
        router.push("/restaurant/dashboard");
      } else if (role === "DELIVERY") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else if (result.data && typeof result.data === "object" && "details" in result.data) {
      setErrors((result.data as any).details);
    } else {
      setErrors({ form: result.error || "Registration failed" });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md w-full max-w-md">
      {errors.form && (
        <div className="bg-danger bg-opacity-10 border border-danger text-danger px-md py-sm rounded-md">
          {errors.form}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-xs">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          className={`input ${errors.email ? "border-danger" : ""}`}
        />
        {errors.email && <p className="text-sm text-danger mt-xs">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className={`input ${errors.password ? "border-danger" : ""}`}
        />
        {errors.password && <p className="text-sm text-danger mt-xs">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          className={`input ${errors.name ? "border-danger" : ""}`}
        />
        {errors.name && <p className="text-sm text-danger mt-xs">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="9876543210"
          className={`input ${errors.phone ? "border-danger" : ""}`}
        />
        {errors.phone && <p className="text-sm text-danger mt-xs">{errors.phone}</p>}
      </div>

      {role === "RESTAURANT" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-xs">Restaurant Name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="My Restaurant"
              required
              className={`input ${errors.shopName ? "border-danger" : ""}`}
            />
            {errors.shopName && <p className="text-sm text-danger mt-xs">{errors.shopName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-xs">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              required
              className={`input ${errors.address ? "border-danger" : ""}`}
            />
            {errors.address && <p className="text-sm text-danger mt-xs">{errors.address}</p>}
          </div>
        </>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Creating account..." : `Register as ${role.toLowerCase()}`}
      </Button>
    </form>
  );
}
