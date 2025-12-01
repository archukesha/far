
import React, { useMemo } from 'react';
import { UserSettings } from '../types';

interface CycleRingProps {
  settings: UserSettings;
  currentDayInCycle: number;
}

const CycleRing: React.FC<CycleRingProps> = ({ settings, currentDayInCycle }) => {
  const radius = 120;
  const strokeWidth = 18;
  const center = 140; // SVG size 280x280
  const circumference = 2 * Math.PI * radius;
  
  const { avgCycleLength, avgPeriodLength } = settings;

  // Calculate arc lengths
  const periodArc = (avgPeriodLength / avgCycleLength) * circumference;
  
  const fertileStartDay = 10;
  const fertileEndDay = 16;
  const fertileDuration = fertileEndDay - fertileStartDay + 1;
  const fertileArc = (fertileDuration / avgCycleLength) * circumference;
  
  const rotation = -90; 
  
  const trackDash = `${circumference} ${circumference}`;
  const periodDash = `${periodArc} ${circumference}`;
  
  const fertileOffsetAngle = (fertileStartDay / avgCycleLength) * 360;

  const cursorAngle = ((currentDayInCycle) / avgCycleLength) * 360;
  const cursorRad = (cursorAngle - 90) * (Math.PI / 180);
  const cursorX = center + radius * Math.cos(cursorRad);
  const cursorY = center + radius * Math.sin(cursorRad);

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect behind the ring */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-75" />

      <svg width="280" height="280" viewBox="0 0 280 280" className="relative z-10">
        <defs>
            <linearGradient id="periodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="fertileGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
        </defs>

        {/* 1. Base Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F3F4F6" // gray-100
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 2. Period Arc (Red) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#periodGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={periodDash}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${center} ${center})`}
        />

        {/* 3. Fertile Window Arc (Purple Dotted) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#fertileGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${fertileArc} ${circumference}`}
          strokeDashoffset={-((fertileStartDay) / avgCycleLength) * circumference}
          strokeLinecap="round"
          strokeOpacity="0.6"
          transform={`rotate(${rotation} ${center} ${center})`}
        />

        {/* 4. Current Day Cursor */}
        <circle
          cx={cursorX}
          cy={cursorY}
          r={12}
          fill="white"
          stroke="#E97A9A"
          strokeWidth={4}
          className="shadow-lg drop-shadow-md"
        />
        
        {/* Inner Text */}
        <foreignObject x="60" y="80" width="160" height="120">
            <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">День</span>
                <span className="text-6xl font-bold text-gray-800 leading-none my-1">{currentDayInCycle}</span>
                <span className="text-primary text-sm font-semibold">
                     из {settings.avgCycleLength}
                </span>
            </div>
        </foreignObject>
      </svg>
    </div>
  );
};

export default CycleRing;
