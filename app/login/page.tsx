"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await api<{ token?: string; message?: string }>(
      "/auth/login",
      "POST",
      form
    );

    console.log("Login response:", response);

    if (response.status === 200 && response.data?.token) {
      localStorage.setItem("token", response.data.token);
      globalThis.dispatchEvent(new Event("tokenChanged"));
      alert("Login successful!");
      router.push("/dashboard");
    } else {
      alert(response.data?.message || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-(--color-background) text-(--color-foreground) border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg w-80 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-3 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-4 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200 disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
