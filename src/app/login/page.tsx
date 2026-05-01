import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "Login - Yumm Food Delivery",
  description: "Login to your Yumm account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-md">
      <div className="bg-white rounded-lg shadow-lg p-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-md text-primary">🍔 Yumm</h1>

        <h2 className="text-2xl font-bold mb-lg text-center text-gray-800">Login</h2>

        <LoginForm />

        <div className="mt-lg text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
