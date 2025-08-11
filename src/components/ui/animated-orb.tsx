'use client'

import React from 'react'

export function AnimatedOrb({ className = '', size = 'lg' }: { className?: string; size?: 'sm' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'w-24 h-24' : 'w-12 h-12'
  const glowSize = size === 'lg' ? 'w-36 h-36' : 'w-18 h-18'
  
  return (
    <div className={`relative ${sizeClasses} ${className}`}>
      {/* Outer aurora glow - subtle */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${glowSize} blur-lg opacity-20 pointer-events-none`}>
        <div className="animated-aurora-outer w-full h-full rounded-full" />
      </div>
      
      {/* Middle aurora layer - softer */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${size === 'lg' ? 'w-30 h-30' : 'w-15 h-15'} blur-sm opacity-30 pointer-events-none`}>
        <div className="animated-aurora-middle w-full h-full rounded-full" />
      </div>
      
      {/* Main orb */}
      <div className={`relative w-full h-full`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Aurora-like gradient with more greens */}
            <linearGradient id="auroraGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#34D399" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#A7F3D0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.6" />
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values="0 100 100; 360 100 100"
                dur="20s"
                repeatCount="indefinite"
              />
            </linearGradient>
            
            <linearGradient id="auroraGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
              <stop offset="33%" stopColor="#10B981" stopOpacity="0.75" />
              <stop offset="66%" stopColor="#34D399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.6" />
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values="0 100 100; -360 100 100"
                dur="15s"
                repeatCount="indefinite"
              />
            </linearGradient>
            
            {/* Soft blur for aurora effect */}
            <filter id="auroraBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              <feColorMatrix type="saturate" values="1.5" />
            </filter>
          </defs>
          
          {/* Aurora waves */}
          <g filter="url(#auroraBlur)">
            {/* Wave 1 */}
            <ellipse
              cx="100"
              cy="100"
              rx="60"
              ry="50"
              fill="url(#auroraGradient1)"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 100 100; 360 100 100"
                dur="12s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="rx"
                values="60;70;55;65;60"
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="ry"
                values="50;45;55;48;50"
                dur="8s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            {/* Wave 2 */}
            <ellipse
              cx="100"
              cy="100"
              rx="55"
              ry="65"
              fill="url(#auroraGradient2)"
              opacity="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 100 100; -360 100 100"
                dur="10s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="rx"
                values="55;50;60;55"
                dur="6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="ry"
                values="65;70;60;65"
                dur="6s"
                repeatCount="indefinite"
              />
            </ellipse>
            
            {/* Central core */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="url(#auroraGradient1)"
              opacity="0.9"
            >
              <animate
                attributeName="r"
                values="35;38;33;36;35"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes auroraFlow {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.3;
          }
          25% {
            transform: scale(1.15) translateY(-5px);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.05) translateY(3px);
            opacity: 0.35;
          }
          75% {
            transform: scale(1.1) translateY(-2px);
            opacity: 0.38;
          }
        }
        
        @keyframes auroraWave {
          0% {
            transform: rotate(0deg) scale(1);
          }
          33% {
            transform: rotate(120deg) scale(1.1);
          }
          66% {
            transform: rotate(240deg) scale(0.95);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        .animated-aurora-outer {
          background: conic-gradient(
            from 0deg at 50% 50%,
            rgba(5, 150, 105, 0.2),     /* Emerald green */
            rgba(16, 185, 129, 0.25),   /* Green */
            rgba(52, 211, 153, 0.2),    /* Light green */
            rgba(110, 231, 183, 0.15),  /* Pale green */
            rgba(167, 243, 208, 0.2),   /* Very light green */
            rgba(99, 102, 241, 0.15),   /* Indigo accent */
            rgba(34, 197, 94, 0.2),     /* Bright green */
            rgba(5, 150, 105, 0.2)      /* Back to emerald */
          );
          animation: auroraWave 15s ease-in-out infinite;
        }
        
        .animated-aurora-middle {
          background: conic-gradient(
            from 180deg at 50% 50%,
            rgba(16, 185, 129, 0.3),    /* Green */
            rgba(34, 197, 94, 0.25),    /* Bright green */
            rgba(74, 222, 128, 0.3),    /* Light green */
            rgba(134, 239, 172, 0.25),  /* Pale green */
            rgba(6, 182, 212, 0.2),     /* Cyan accent */
            rgba(52, 211, 153, 0.25),   /* Mint green */
            rgba(16, 185, 129, 0.3)     /* Back to green */
          );
          animation: auroraFlow 10s ease-in-out infinite,
                     shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}