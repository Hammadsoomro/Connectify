import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, MessageSquare, Phone, Zap, Globe, Send } from "lucide-react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 animate-gradient-shift" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-floating" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-floating" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-floating" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl animate-floating" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl animate-floating" style={{ animationDelay: '3s' }} />
      
      {/* Animated devices */}
      <div className="absolute top-1/4 left-1/6 transform animate-floating" style={{ animationDelay: '0s', animationDuration: '4s' }}>
        <div className="relative">
          <div className="w-16 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl border border-slate-700">
            <div className="w-12 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm m-2 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="absolute top-1/3 right-1/5 transform animate-floating" style={{ animationDelay: '2s', animationDuration: '5s' }}>
        <div className="relative">
          <div className="w-12 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700">
            <div className="w-8 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl m-2 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/5 transform animate-floating" style={{ animationDelay: '1s', animationDuration: '6s' }}>
        <div className="relative">
          <div className="w-20 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl border border-slate-700">
            <div className="w-16 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm m-2 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="absolute bottom-1/3 right-1/4 transform animate-floating" style={{ animationDelay: '3s', animationDuration: '4.5s' }}>
        <div className="relative">
          <div className="w-14 h-18 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
            <div className="w-10 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg m-2 flex items-center justify-center">
              <Tablet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-1/5 left-1/3 transform animate-bounce-gentle text-blue-500/30" style={{ animationDelay: '0s' }}>
        <Send className="w-8 h-8" />
      </div>
      
      <div className="absolute top-2/3 right-1/3 transform animate-bounce-gentle text-purple-500/30" style={{ animationDelay: '2s' }}>
        <Zap className="w-6 h-6" />
      </div>
      
      <div className="absolute bottom-1/5 left-1/2 transform animate-bounce-gentle text-green-500/30" style={{ animationDelay: '1s' }}>
        <Globe className="w-7 h-7" />
      </div>

      <div className="absolute top-1/2 right-1/6 transform animate-bounce-gentle text-orange-500/30" style={{ animationDelay: '3s' }}>
        <MessageSquare className="w-6 h-6" />
      </div>

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" begin="1.5s" />
            </stop>
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" begin="2s" />
            </stop>
          </linearGradient>
        </defs>
        
        <path
          d="M 100 200 Q 300 100 500 300 T 900 200"
          stroke="url(#lineGradient1)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 20,10; 0,0"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M 200 400 Q 400 300 600 500 T 800 400"
          stroke="url(#lineGradient2)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="3,7"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -15,5; 0,0"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Particle effects */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
