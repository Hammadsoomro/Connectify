import React from "react";

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{ pointerEvents: "none" }}
    >
      {/* Modern Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900" />

      {/* Primary animated orbs - Modern purple/blue theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/25 to-purple-600/25 rounded-full blur-3xl animate-pulse animation-delay-1000" />

      {/* Secondary floating elements - Emerald accents */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-blue-500/20 rounded-full blur-2xl animate-bounce animation-delay-500" />
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-emerald-500/20 rounded-full blur-2xl animate-bounce animation-delay-2000" />

      {/* Smaller accent particles - Subtle modern colors */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-slate-400/25 to-purple-400/25 rounded-full blur-xl animate-pulse animation-delay-3000" />
      <div className="absolute top-3/4 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/25 to-blue-400/25 rounded-full blur-xl animate-pulse animation-delay-1500" />

      {/* Professional mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-800/40 dark:from-gray-950/80 dark:via-transparent dark:to-gray-900/60" />
      
      {/* Subtle grid pattern overlay for professional feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
    </div>
  );
}
