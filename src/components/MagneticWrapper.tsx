import React, { useRef, useState } from "react";
import { motion, useSpring } from "motion/react";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function MagneticWrapper({ children, className = "", onClick, isActive = false }: MagneticWrapperProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Use spring physics for smooth, high-end motion
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center of the button
    const middleX = left + width / 2;
    const middleY = top + height / 2;
    
    // Calculate the pull ratio
    // The divisor dictates how strong the pull is.
    const x = (clientX - middleX) * 0.3;
    const y = (clientY - middleY) * 0.3;
    
    springX.set(x);
    springY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    springX.set(0);
    springY.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.button
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        scale: isHovered ? (isActive ? 1.08 : 1.05) : 1,
        y: isHovered ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative z-10 block ${className} ${isHovered ? 'z-20 drop-shadow-[0_4px_12px_rgba(99,102,241,0.2)]' : ''}`}
    >
      {children}
    </motion.button>
  );
}
