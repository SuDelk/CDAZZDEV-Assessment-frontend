"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import BackgroundEffects from "@/components/BackgroundEffects";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error when typing
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.name) newErrors.name = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email address";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // clear previous errors

    try {
      const response = await api(CONSTANTS.API.AUTH.REGISTER, "POST", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (response.status === 201) {
        router.push(CONSTANTS.ROUTES.LOGIN);
      } else {
        setErrors({
          general:
            (response as any)?.data?.message || CONSTANTS.MESSAGES.REGISTER_FAIL,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: CONSTANTS.MESSAGES.REGISTER_FAIL });
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
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Register
        </h2>

        {/* Full Name */}
        <label
          htmlFor="name"
          className="block mt-2 font-medium text-gray-900 dark:text-gray-100"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          className={`border ${
            errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.name && <p className="text-red-500 text-sm mb-3">{errors.name}</p>}

        {/* Email */}
        <label
          htmlFor="email"
          className="block mt-2 font-medium text-gray-900 dark:text-gray-100"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          className={`border ${
            errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email}</p>}

        {/* Password */}
        <label
          htmlFor="password"
          className="block mt-2 font-medium text-gray-900 dark:text-gray-100"
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
          className={`border ${
            errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-3">{errors.password}</p>
        )}

        {/* Confirm Password */}
        <label
          htmlFor="confirmPassword"
          className="block mt-2 font-medium text-gray-900 dark:text-gray-100"
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
          className={`border ${
            errors.confirmPassword
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-3">{errors.confirmPassword}</p>
        )}

        {/* General Error */}
        {errors.general && (
          <p className="text-red-500 text-center text-sm mb-4">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition-colors duration-200 disabled:opacity-60"
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
