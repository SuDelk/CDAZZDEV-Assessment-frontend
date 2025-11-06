"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api("/auth/register", "POST", form);
    console.log("Registration successful:", response);
    if (response.status === 201) {
      alert("Registration successful! Please log in.");
      router.push("/login");
    } else {
      const message = (response as any)?.data?.message;
      alert(message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-(--color-background) text-(--color-foreground) border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg w-80 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-3 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-3 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground placeholder-gray-400 p-2 mb-4 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
