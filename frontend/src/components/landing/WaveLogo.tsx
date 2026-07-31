import React from 'react';

interface WaveLogoProps {
  size?: number;
}

export const WaveLogo: React.FC<WaveLogoProps> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path
      d="M2 15C5 9 8 21 11 15C14 9 17 21 20 15C21.5 12 23.5 12 24 13"
      stroke="#1489b4"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
