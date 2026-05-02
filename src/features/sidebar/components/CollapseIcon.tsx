import React from 'react';

interface CollapseIconProps {
  size?: number;
  className?: string;
}

export const CollapseIcon: React.FC<CollapseIconProps> = ({ 
  size = 20, 
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
};