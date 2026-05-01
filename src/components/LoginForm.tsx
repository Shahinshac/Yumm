"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, LoginResponse } from "@/lib/api";
import { Button } from "@/components/Button";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
      // Store tokens
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Call callback if provided
      if (onSuccess) onSuccess();

      // Redirect based on role
      if (result.data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (result.data.user.role === "RESTAURANT") {
        router.push("/restaurant/dashboard");
      } else if (result.data.user.role === "DELIVERY") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md w-full max-w-md">
      {error && (
        <div className="bg-danger bg-opacity-10 border border-danger text-danger px-md py-sm rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-xs">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="input"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
