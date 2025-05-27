'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
  timeRemaining: number;
  phase: 'active' | 'countdown' | 'resolution' | 'reset';
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeRemaining, phase }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / 60; // Assuming 60 second rounds
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const getTimerColor = () => {
    if (timeRemaining > 30) return '#10b981'; // Green
    if (timeRemaining > 10) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getGlowIntensity = () => {
    if (timeRemaining <= 5) return 'drop-shadow-lg';
    if (timeRemaining <= 10) return 'drop-shadow-md';
    return 'drop-shadow-sm';
  };

  return (
    <div className="relative">
      <svg
        width="140"
        height="140"
        className={`transform -rotate-90 ${getGlowIntensity()}`}
      >
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          stroke={getTimerColor()}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="timer-ring"
          animate={{
            strokeDashoffset: strokeDashoffset,
            stroke: getTimerColor(),
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Pulse effect for countdown */}
        {timeRemaining <= 10 && (
          <motion.circle
            cx="70"
            cy="70"
            r={radius + 5}
            stroke={getTimerColor()}
            strokeWidth="2"
            fill="transparent"
            opacity="0.5"
            animate={{
              r: [radius + 5, radius + 15],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </svg>
      
      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{
            scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: timeRemaining <= 5 ? Infinity : 0,
          }}
        >
          <div className="text-3xl font-bold text-white">
            {timeRemaining}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {phase === 'countdown' ? 'Final' : 'Seconds'}
          </div>
        </motion.div>
      </div>
      
      {/* Warning indicators */}
      {timeRemaining <= 5 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500"
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
};

export default CircularTimer; 