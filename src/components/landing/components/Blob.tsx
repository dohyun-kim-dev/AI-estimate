import { useEffect, useState } from "react";

export default function Blob({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [colorIndex, setColorIndex] = useState(0);

  const colors = [
    "from-[#97a8ff] to-[#1a1fff]",
    "from-[#a897ff] to-[#2d1bff]",
    "from-[#b5a8ff] to-[#3d2fff]",
    "from-[#8fa8ff] to-[#1a2fff]",
    "from-[#9bb8ff] to-[#2a35ff]",
    "from-[#a8b5ff] to-[#3542ff]",
  ];

  useEffect(() => {
    let moveCount = 0;
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      moveCount++;
      if (moveCount % 20 === 0) {
        setColorIndex(Math.floor(Math.random() * colors.length));
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [colors.length]);

  const isWeb = () => {
    return !('ontouchstart' in window || navigator.maxTouchPoints > 0);
  };

  if (!active || !isWeb()) return null;

  return (
    <div
      className={`pointer-events-none fixed z-50 h-48 w-48 rounded-full bg-gradient-to-br ${colors[colorIndex]} opacity-40 blur-2xl transition-all duration-300 ease-out`}
      style={{
        left: pos.x - 96,
        top: pos.y - 96,
      }}
    />
  );
}
