"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import BackgroundEffects from "@/components/BackgroundEffects";

interface LoginForm {
  email: string;
  password: string;
  isAdmin: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    isAdmin: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) return;
    try {
      const response = (await api(CONSTANTS.API.AUTH.LOGIN, "POST", form)) as {
        status: number;
        data?: { token?: string; role?: string; message?: string };
      };

      if (response.status === 200 && response.data?.token) {
        const { token, role } = response.data;

        globalThis.localStorage.setItem(CONSTANTS.TOKEN, token);
        globalThis.localStorage.setItem(CONSTANTS.ROLE, role || "student");
        globalThis.dispatchEvent(new Event(CONSTANTS.TOKEN_EVENT));

        if (role === "admin") {
          await Swal.fire({
            icon: "success",
            title: "Admin Login Successful",
            text: CONSTANTS.MESSAGES.ADMIN_LOGIN_SUCCESS,
          });
          router.push(CONSTANTS.ROUTES.ADMIN.COURSES);
        } else {
          await Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: CONSTANTS.MESSAGES.LOGIN_SUCCESS,
          });
          router.push(CONSTANTS.ROUTES.DASHBOARD);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.data?.message || CONSTANTS.MESSAGES.LOGIN_FAIL,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: CONSTANTS.MESSAGES.LOGIN_FAIL,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundEffects>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-12 rounded-3xl shadow-2xl w-96 md:w-[480px]"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          className={`border ${
            errors.email
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-3">{errors.email}</p>
        )}

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          className={`mt-2 border ${
            errors.password
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-1 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-3">{errors.password}</p>
        )}

        <div className="flex items-center mb-6 mt-2">
          <input
            type="checkbox"
            name="isAdmin"
            checked={form.isAdmin}
            onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
            className="mr-2 accent-blue-600 w-5 h-5"
          />
          <label
            htmlFor="isAdmin"
            className="text-sm text-gray-900 dark:text-gray-100"
          >
            Login as Admin
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition-colors duration-200 disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </BackgroundEffects>
  );
}
