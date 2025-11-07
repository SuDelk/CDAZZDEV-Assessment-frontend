"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  duration: number;
}

export default function Home() {
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const itemIdRef = useRef(0);

  const emojis = ["📚", "📖", "💻", "🖥️", "📝", "✏️", "🖊️", "🔖", "📂", "📒"];

  // Spawn random falling items
  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: FallingItem = {
        id: itemIdRef.current,
        x: Math.random() * window.innerWidth,
        y: -50,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 24 + 16,
        duration: Math.random() * 3 + 2,
      };
      setFallingItems((prev) => [...prev, newItem]);
      itemIdRef.current += 1;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-r from-blue-100 to-purple-200 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
      {/* Falling Items */}
      {fallingItems.map((item) => (
        <span
          key={item.id}
          className="absolute animate-fall pointer-events-none select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            opacity: 0.5,
          }}
          onAnimationEnd={() =>
            setFallingItems((prev) => prev.filter((i) => i.id !== item.id))
          }
        >
          {item.emoji}
        </span>
      ))}

      {/* Middle Card Container */}
      <div className="relative flex items-center justify-center z-10">
        {/* Ripple Circles */}
        <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
          <span className="absolute w-lg h-11/12 border-4 border-blue-400 rounded-full animate-ripple opacity-50"></span>
          <span className="absolute w-lg h-11/12 border-4 border-blue-400 rounded-full animate-ripple opacity-50 animation-delay-500"></span>
          <span className="absolute w-lg h-11/12 border-4 border-blue-400 rounded-full animate-ripple opacity-50 animation-delay-1000"></span>
        </div>

        {/* Card */}
        <div className="relative bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-12 flex flex-col items-center max-w-md w-full animate-bounce-card z-20">
          <div className="rounded-2xl overflow-hidden mb-6 w-36 h-36">
            <Image
              src="/logo.png"
              alt="CDazzDev Logo"
              width={150}
              height={150}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-4">
            CDazzDev Learning Platform
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Please register or log in to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <a
              href="/login"
              className="flex-1 px-6 py-3 text-white font-semibold bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition-colors text-center"
            >
              Login
            </a>
            <a
              href="/register"
              className="flex-1 px-6 py-3 text-white font-semibold bg-green-600 rounded-xl shadow hover:bg-green-700 transition-colors text-center"
            >
              Register
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Falling Items */
        @keyframes fall {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }

        /* Bouncing Card */
        @keyframes bounce-card {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-card {
          animation: bounce-card 2s ease-in-out infinite;
        }

        /* Ripple Effect */
        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 2s infinite;
          border-color: rgba(59, 130, 246, 0.5);
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
