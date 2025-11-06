"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User, BookOpen, ClipboardList } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkToken = () => {
      const token = globalThis.localStorage?.getItem(CONSTANTS.TOKEN);
      setIsLoggedIn(!!token);
    };

    // ✅ Initial check when component mounts
    checkToken();

    // ✅ Listen for changes in localStorage and custom token events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONSTANTS.TOKEN) checkToken();
    };

    globalThis.addEventListener("storage", handleStorageChange);
    globalThis.addEventListener(CONSTANTS.TOKEN_EVENT, checkToken);

    return () => {
      globalThis.removeEventListener("storage", handleStorageChange);
      globalThis.removeEventListener(CONSTANTS.TOKEN_EVENT, checkToken);
    };
  }, []);

  const handleLogout = () => {
    globalThis.localStorage?.removeItem(CONSTANTS.TOKEN);
    globalThis.dispatchEvent(new Event(CONSTANTS.TOKEN_EVENT));
    globalThis.location.href = "/";
  };

  const navItems = [
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

  return (
    <>
      {/* ✅ Navbar Section */}
      <header className="w-full flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-background">
        {/* Left: Logo */}
        <Link
          href={isLoggedIn ? CONSTANTS.ROUTES.DASHBOARD : CONSTANTS.ROUTES.ROOT}
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

        {/* Center: Navigation (only when logged in) */}
        {isLoggedIn && (
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
        )}

        {/* Right: Logout Button (only when logged in) */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        )}
      </header>

      {/* ✅ Main Content Area */}
      <main
        className={isLoggedIn ? "min-h-[calc(100vh-64px)]" : "min-h-screen"}
      >
        {children}
      </main>
    </>
  );
}
