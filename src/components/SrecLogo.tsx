import React from 'react';
import srecLogo from '../assets/srec-logo.png';

interface SrecLogoProps {
  className?: string;
  lightText?: boolean;
  style?: React.CSSProperties;
  height?: string;
}

export const SrecLogo: React.FC<SrecLogoProps> = ({ 
  className,
  lightText,
  style,
  height = '85px',
}) => {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', ...style }}>
      <img 
        src={srecLogo} 
        alt="SREC Logo" 
        style={{ 
          height, 
          width: 'auto', 
          display: 'block', 
          filter: lightText ? 'brightness(0) invert(1)' : 'none',
          transition: 'filter 0.3s ease',
          flexShrink: 0
        }} 
      />
    </div>
  );
};
