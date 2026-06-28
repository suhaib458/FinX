import React from 'react';

export const ChildIllustration = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="child_bg" x1="0" y1="0" x2="320" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" stopOpacity="0.02" />
        <stop offset="1" stopColor="#10B981" stopOpacity="0.08" />
      </linearGradient>
      <filter id="child_shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#047857" floodOpacity="0.1" />
      </filter>
    </defs>

    {/* Background Shapes */}
    <circle cx="60" cy="50" r="70" fill="url(#child_bg)" />
    <circle cx="280" cy="160" r="100" fill="url(#child_bg)" />
    
    {/* Base Grid or Lines */}
    <path d="M 0 170 L 320 170" stroke="#10B981" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />
    <path d="M 0 150 L 320 150" stroke="#10B981" strokeOpacity="0.05" strokeWidth="1" />
    
    {/* Base Platform */}
    <ellipse cx="160" cy="160" rx="100" ry="20" fill="#34D399" fillOpacity="0.06" />
    <ellipse cx="160" cy="158" rx="75" ry="15" fill="#34D399" fillOpacity="0.12" />

    {/* Main Composition */}
    <g transform="translate(160, 105)">
      
      {/* Piggy Bank */}
      <g transform="translate(10, -25)" filter="url(#child_shadow)">
        <path d="M 0 10 C -25 10, -40 28, -40 50 C -40 68, -20 80, 0 80 C 28 80, 50 62, 50 45 C 50 28, 28 10, 0 10 Z" fill="#34D399" />
        <path d="M 0 10 C -25 10, -40 28, -40 50 C -40 68, -20 80, 0 80 C 28 80, 50 62, 50 45 V 10 Z" fill="#10B981" />
        <path d="M -18 28 L 18 28" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
        
        {/* Legs */}
        <path d="M -22 75 L -22 86 C -22 90, -16 90, -16 86 L -10 78" stroke="#10B981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 18 75 L 18 86 C 18 90, 24 90, 24 86 L 30 75" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Ear & Snout */}
        <path d="M 38 32 C 50 32, 58 38, 58 50 C 58 62, 50 62, 38 62" fill="#34D399" />
        <circle cx="-16" cy="4" r="7" fill="#10B981" />
        <circle cx="48" cy="44" r="2.5" fill="#064E3B" opacity="0.3" />
        <circle cx="48" cy="52" r="2.5" fill="#064E3B" opacity="0.3" />
        
        {/* Eye */}
        <circle cx="28" cy="38" r="3" fill="#064E3B" />
      </g>
      
      {/* Coins */}
      <g transform="translate(-15, -55)" filter="url(#child_shadow)">
        <circle cx="0" cy="0" r="10" fill="#FBBF24" />
        <circle cx="0" cy="0" r="6" stroke="#D97706" strokeWidth="1.5" />
      </g>
      <g transform="translate(12, -75)" filter="url(#child_shadow)">
        <circle cx="0" cy="0" r="7" fill="#FBBF24" />
        <circle cx="0" cy="0" r="4" stroke="#D97706" strokeWidth="1" />
      </g>

      {/* Child Figure */}
      <g transform="translate(-45, -15)">
        <circle cx="0" cy="0" r="12" fill="#6EE7B7" />
        <path d="M -22 40 C -22 24, -10 18, 0 18 C 10 18, 22 24, 22 40" fill="#6EE7B7" />
        {/* Device/Phone */}
        <rect x="6" y="16" width="12" height="18" rx="3" fill="#059669" transform="rotate(15)" />
      </g>
    </g>

    {/* Floating Elements / Goals */}
    <g transform="translate(250, 50)" filter="url(#child_shadow)">
      <polygon points="12,0 16,8 24,8 18,14 20,22 12,18 4,22 6,14 0,8 8,8" fill="#FBBF24" />
    </g>
    
    <g transform="translate(45, 95)" filter="url(#child_shadow)">
      <rect x="0" y="0" width="40" height="40" rx="10" fill="#FFFFFF" fillOpacity="0.95" className="dark:hidden" />
      <rect x="0" y="0" width="40" height="40" rx="10" fill="#1E293B" fillOpacity="0.95" className="hidden dark:block" />
      <circle cx="20" cy="20" r="12" stroke="#34D399" strokeWidth="3" strokeDasharray="20 50" strokeLinecap="round" />
      <circle cx="20" cy="20" r="12" stroke="#10B981" strokeWidth="3" strokeDasharray="45 20" strokeLinecap="round" strokeDashoffset="-25" />
      <circle cx="20" cy="20" r="4" fill="#059669" />
    </g>

    {/* Small accents */}
    <circle cx="85" cy="40" r="4" fill="#6EE7B7" />
    <circle cx="215" cy="35" r="3.5" fill="#34D399" opacity="0.6" />
    <rect x="290" y="110" width="8" height="8" rx="2" fill="#10B981" opacity="0.4" transform="rotate(45 290 110)" />
    <path d="M 45 140 l 5 -5 m 0 5 l -5 -5" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
