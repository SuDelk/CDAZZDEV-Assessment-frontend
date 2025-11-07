"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import BackgroundEffects from "@/components/BackgroundEffects";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validations
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return Swal.fire("Validation Error", "All fields are required", "error");
    }

    if (!validateEmail(form.email)) {
      return Swal.fire("Validation Error", "Invalid email address", "error");
    }

    if (form.password.length < 6) {
      return Swal.fire(
        "Validation Error",
        "Password must be at least 6 characters",
        "error"
      );
    }

    if (form.password !== form.confirmPassword) {
      return Swal.fire("Validation Error", "Passwords do not match", "error");
    }

    setLoading(true);

    try {
      const response = await api(CONSTANTS.API.AUTH.REGISTER, "POST", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (response.status === 201) {
        Swal.fire("Success", CONSTANTS.MESSAGES.REGISTER_SUCCESS, "success");
        router.push(CONSTANTS.ROUTES.LOGIN);
      } else {
        Swal.fire(
          "Error",
          (response as any)?.data?.message || CONSTANTS.MESSAGES.REGISTER_FAIL,
          "error"
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire("Error", CONSTANTS.MESSAGES.REGISTER_FAIL, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundEffects>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-12 rounded-3xl shadow-2xl w-96 md:w-[480px] relative z-10 animate-bounce-card transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

        {/* Full Name */}
        <label
          htmlFor="name"
          className="block mb-1 font-medium text-gray-900 dark:text-gray-100"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-4 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Email */}
        <label
          htmlFor="email"
          className="block mb-1 font-medium text-gray-900 dark:text-gray-100"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-4 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password */}
        <label
          htmlFor="password"
          className="block mb-1 font-medium text-gray-900 dark:text-gray-100"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-4 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password */}
        <label
          htmlFor="confirmPassword"
          className="block mb-1 font-medium text-gray-900 dark:text-gray-100"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-6 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition-colors duration-200 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-6 text-gray-900 dark:text-gray-100">
          Already have an account?{" "}
          <a
            href={CONSTANTS.ROUTES.LOGIN}
            className="text-blue-500 hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </BackgroundEffects>
  );
}
