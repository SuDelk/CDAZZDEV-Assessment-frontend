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

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    isAdmin: false,
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
      const response = (await api(CONSTANTS.API.AUTH.LOGIN, "POST", form)) as {
        status: number;
        data?: {
          token?: string;
          message?: string;
          role?: string;
          userId?: string;
        };
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
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-12 rounded-3xl shadow-2xl w-96 md:w-[480px] animate-bounce-card transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-4 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          required
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 p-3 mb-5 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center mb-6">
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

        <p className="text-sm text-center mt-6 text-gray-900 dark:text-gray-100">
          Don’t have an account?{" "}
          <a
            href={CONSTANTS.ROUTES.REGISTER}
            className="text-blue-500 hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </BackgroundEffects>
  );
}
