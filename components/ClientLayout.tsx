"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User, BookOpen, ClipboardList, Shield } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = globalThis.localStorage?.getItem(CONSTANTS.TOKEN);
      const userRole = globalThis.localStorage?.getItem(CONSTANTS.ROLE);
      setIsLoggedIn(!!token);
      setRole(userRole || null);
    };

    // ✅ Initial check
    checkAuth();

    // ✅ Listen for login/logout events
    const handleAuthChange = () => checkAuth();
    globalThis.addEventListener(CONSTANTS.TOKEN_EVENT, handleAuthChange);

    return () => {
      globalThis.removeEventListener(CONSTANTS.TOKEN_EVENT, handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    globalThis.localStorage?.removeItem(CONSTANTS.TOKEN);
    globalThis.localStorage?.removeItem(CONSTANTS.ROLE);
    globalThis.dispatchEvent(new Event(CONSTANTS.TOKEN_EVENT));
    globalThis.location.href = "/";
  };

  // 🧑‍🎓 Student Nav Items
  const studentNav = [
    {
      name: CONSTANTS.NAV.PROFILE,
      href: CONSTANTS.ROUTES.PROFILE,
      icon: <User size={18} />,
    },
    {
      name: CONSTANTS.NAV.COURSES,
      href: CONSTANTS.ROUTES.COURSES,
      icon: <BookOpen size={18} />,
    },
    {
      name: CONSTANTS.NAV.ENROLLMENTS,
      href: CONSTANTS.ROUTES.ENROLLMENTS,
      icon: <ClipboardList size={18} />,
    },
  ];

  // 🧑‍💼 Admin Nav Items
  const adminNav = [
    {
      name: CONSTANTS.NAV.ADMIN.COURSES,
      href: CONSTANTS.ROUTES.ADMIN.COURSES,
      icon: <BookOpen size={18} />,
    },
    {
      name: CONSTANTS.NAV.ADMIN.ENROLLMENTS,
      href: CONSTANTS.ROUTES.ADMIN.ENROLLMENTS,
      icon: <Shield size={18} />,
    },
    {
      name: CONSTANTS.NAV.ADMIN.STUDENTS,
      href: CONSTANTS.ROUTES.ADMIN.STUDENTS,
      icon: <User size={18} />,
    },
  ];

  // Choose nav based on role
  const navItems = role === "admin" ? adminNav : studentNav;

  return (
    <>
      {/* ✅ Navbar Section */}
      {isLoggedIn && (
        <header className="w-full flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-background">
          {/* Left: Logo */}
          <Link
            href={
              role === "admin"
                ? CONSTANTS.ROUTES.ADMIN.COURSES
                : CONSTANTS.ROUTES.DASHBOARD
            }
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={38}
              height={38}
              className="rounded-md"
            />
            <span className="font-semibold text-lg">Online Learning</span>
          </Link>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-500"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right: Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </header>
      )}

      {/* ✅ Main Content */}
      <main
        className={isLoggedIn ? "min-h-[calc(100vh-64px)]" : "min-h-screen"}
      >
        {children}
      </main>
    </>
  );
}
