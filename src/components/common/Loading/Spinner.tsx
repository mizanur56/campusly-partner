"use client";

import { motion } from "framer-motion";

function Spinner() {
  const outerVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 1.2,
        ease: "easeInOut" as const,
        repeat: Infinity,
      },
    },
  };

  const innerVariants = {
    rotate: {
      rotate: -360,
      transition: {
        duration: 0.9,
        ease: "easeInOut" as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-18 h-18">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="spinnerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#237d3b" stopOpacity="1" />
              <stop offset="50%" stopColor="#237d3b" stopOpacity="1" />
              <stop offset="100%" stopColor="#237d3b" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.8"
            opacity="0.12"
          />
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.8"
            opacity="0.12"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#237d3b"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="200, 64"
            variants={outerVariants}
            animate="rotate"
            style={{
              transformOrigin: "center",
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="#237d3b"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="60, 116"
            variants={innerVariants}
            animate="rotate"
            style={{
              transformOrigin: "center",
            }}
          />
        </svg>
      </div>
    </div>
  );
}

export default Spinner;

