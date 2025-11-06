"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api(CONSTANTS.API.AUTH.REGISTER, "POST", form);

      if (response.status === 201) {
        alert(CONSTANTS.MESSAGES.REGISTER_SUCCESS);
        router.push(CONSTANTS.ROUTES.LOGIN);
      } else {
        const message =
          (response as any)?.data?.message || CONSTANTS.MESSAGES.REGISTER_FAIL;
        alert(message);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert(CONSTANTS.MESSAGES.REGISTER_FAIL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg w-80 bg-card text-card-foreground transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-3 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-3 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-4 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200 disabled:opacity-60"
          type="submit"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <a
            href={CONSTANTS.ROUTES.LOGIN}
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
