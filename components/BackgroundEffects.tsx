"use client";

import { useState, useRef, useEffect } from "react";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  duration: number;
}

export default function BackgroundEffects({ children }: Readonly<{ children: React.ReactNode }>) {
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const itemIdRef = useRef(0);

  const emojis = ["📚", "📖", "💻", "🖥️", "📝", "✏️", "🖊️", "🔖", "📂", "📒"];

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
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-r from-blue-100 to-purple-200 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
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

      {/* Ripple wrapper */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-96 h-96 flex items-center justify-center pointer-events-none">
          <span className="absolute w-full h-full border-4 border-blue-400 rounded-full animate-ripple opacity-50"></span>
          <span className="absolute w-full h-full border-4 border-blue-400 rounded-full animate-ripple opacity-50 animation-delay-500"></span>
          <span className="absolute w-full h-full border-4 border-blue-400 rounded-full animate-ripple opacity-50 animation-delay-1000"></span>
        </div>

        {/* Card/Form */}
        <div className="relative z-10">{children}</div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; }

        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ripple { animation: ripple 2s infinite; border-color: rgba(59,130,246,0.5); }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}
