import React from "react";

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{ pointerEvents: "none" }}
    >
      {/* Modern Gradient Background - Light/Dark responsive */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 dark:from-black dark:via-gray-900 dark:to-gray-800" />

      {/* Primary animated orbs - Light/Dark responsive */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 dark:from-yellow-500/30 dark:to-amber-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-teal-400/15 to-emerald-500/15 dark:from-gray-500/25 dark:to-yellow-600/25 rounded-full blur-3xl animate-pulse animation-delay-1000" />

      {/* Secondary floating elements - Light/Dark responsive */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-teal-300/15 to-emerald-400/15 dark:from-amber-400/20 dark:to-yellow-500/20 rounded-full blur-2xl animate-bounce animation-delay-500" />
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-300/15 to-teal-400/15 dark:from-gray-400/20 dark:to-amber-500/20 rounded-full blur-2xl animate-bounce animation-delay-2000" />

      {/* Smaller accent particles - Light/Dark responsive */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-slate-300/20 to-teal-300/20 dark:from-gray-400/25 dark:to-amber-400/25 rounded-full blur-xl animate-pulse animation-delay-3000" />
      <div className="absolute top-3/4 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 dark:from-yellow-400/25 dark:to-gray-400/25 rounded-full blur-xl animate-pulse animation-delay-1500" />

      {/* Professional mesh gradient overlay - Light/Dark responsive */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-emerald-50/30 dark:from-black/60 dark:via-transparent dark:to-gray-900/40" />

      {/* Subtle grid pattern overlay - Light/Dark responsive */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
    </div>
  );
}
