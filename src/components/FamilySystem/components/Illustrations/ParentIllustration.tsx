import React from 'react';

export const ParentIllustration = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="parent_bg" x1="0" y1="0" x2="320" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#9333EA" stopOpacity="0.02" />
        <stop offset="1" stopColor="#9333EA" stopOpacity="0.08" />
      </linearGradient>
      <filter id="parent_shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7E22CE" floodOpacity="0.1" />
      </filter>
    </defs>

    {/* Background Shapes */}
    <circle cx="280" cy="40" r="80" fill="url(#parent_bg)" />
    <circle cx="40" cy="160" r="100" fill="url(#parent_bg)" />
    
    {/* Base Grid or Lines */}
    <path d="M 0 170 L 320 170" stroke="#9333EA" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />
    <path d="M 0 150 L 320 150" stroke="#9333EA" strokeOpacity="0.05" strokeWidth="1" />
    
    {/* Base Platform */}
    <ellipse cx="160" cy="160" rx="110" ry="22" fill="#A855F7" fillOpacity="0.05" />
    <ellipse cx="160" cy="158" rx="85" ry="16" fill="#A855F7" fillOpacity="0.1" />

    {/* Main Composition */}
    <g transform="translate(160, 105)">
      
      {/* Wallet / Financial */}
      <g transform="translate(-65, -15)" filter="url(#parent_shadow)">
        <rect x="0" y="0" width="55" height="40" rx="8" fill="#C084FC" />
        <path d="M 0 15 C 15 15, 25 20, 55 20 L 55 40 C 55 44.4 51.4 48 47 48 L 8 48 C 3.6 48 0 44.4 0 40 Z" fill="#9333EA" />
        <rect x="40" y="22" width="16" height="8" rx="4" fill="#F3E8FF" />
        <circle cx="44" cy="26" r="2" fill="#9333EA" />
      </g>
      
      {/* Shield / Security */}
      <g transform="translate(25, -35)" filter="url(#parent_shadow)">
        <path d="M 22 0 L 44 12 V 32 C 44 50 33 65 22 72 C 11 65 0 50 0 32 V 12 Z" fill="#A855F7" />
        <path d="M 22 0 L 44 12 V 32 C 44 50 33 65 22 72 V 0 Z" fill="#9333EA" />
        <path d="M 12 34 L 19 41 L 33 25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      
      {/* Parent Figure / Responsibility */}
      <g transform="translate(-15, -55)">
        <circle cx="16" cy="16" r="14" fill="#D8B4FE" />
        <path d="M -12 55 C -12 38 4 33 16 33 C 28 33 44 38 44 55" fill="#D8B4FE" />
      </g>
    </g>

    {/* Floating UI Elements (Cards/Charts) */}
    <g transform="translate(50, 40)" filter="url(#parent_shadow)">
      <rect x="0" y="0" width="55" height="35" rx="6" fill="#FFFFFF" fillOpacity="0.9" className="dark:hidden" />
      <rect x="0" y="0" width="55" height="35" rx="6" fill="#1E293B" fillOpacity="0.9" className="hidden dark:block" />
      <path d="M 8 25 L 20 12 L 32 18 L 47 5" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="5" r="2.5" fill="#C084FC" />
    </g>
    
    <g transform="translate(220, 115)" filter="url(#parent_shadow)">
      <rect x="0" y="0" width="60" height="24" rx="6" fill="#FFFFFF" fillOpacity="0.95" className="dark:hidden" />
      <rect x="0" y="0" width="60" height="24" rx="6" fill="#1E293B" fillOpacity="0.95" className="hidden dark:block" />
      <rect x="8" y="10" width="30" height="4" rx="2" fill="#D8B4FE" />
      <circle cx="48" cy="12" r="4" fill="#34D399" />
    </g>

    {/* Small accents */}
    <circle cx="110" cy="35" r="3.5" fill="#D8B4FE" />
    <circle cx="250" cy="70" r="5" fill="#C084FC" opacity="0.6" />
    <rect x="45" y="110" width="8" height="8" rx="2" fill="#A855F7" opacity="0.4" transform="rotate(45 45 110)" />
    <path d="M 270 145 l 5 -5 m 0 5 l -5 -5" stroke="#D8B4FE" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
