import React, { useMemo } from 'react';

const colorChannelMixer = (colorChannelA: number, colorChannelB: number, amountToMix: number) => {
  let channelA = colorChannelA * amountToMix;
  let channelB = colorChannelB * (1 - amountToMix);
  return channelA + channelB;
};

const colorMixer = (rgbA: number[], rgbB: number[], amountToMix: number) => {
  let r = Math.round(colorChannelMixer(rgbA[0], rgbB[0], amountToMix));
  let g = Math.round(colorChannelMixer(rgbA[1], rgbB[1], amountToMix));
  let b = Math.round(colorChannelMixer(rgbA[2], rgbB[2], amountToMix));
  return `rgb(${r}, ${g}, ${b})`;
};

const COLORS = {
  primaryColor: [231, 76, 60],       // Red (Pomegranate) — Good for damage/alerts
  secondColor: [0, 255, 85],        // Amber — Excellent for durability on dark UI
  accentColor: [255, 87, 34],        // Deep Orange — Pops well on dark backgrounds
};

type WeightBarProps = {
  percent: number;
  durability?: boolean;
  variant?: 'bar' | 'circle';
};

const WeightBar: React.FC<WeightBarProps> = ({ percent, durability, variant = 'bar' }) => {
  const color = useMemo(() => {
    return durability
      ? percent < 50
        ? colorMixer(COLORS.accentColor, COLORS.primaryColor, percent / 100)
        : colorMixer(COLORS.secondColor, COLORS.accentColor, percent / 100)
      : percent > 50
        ? colorMixer(COLORS.primaryColor, COLORS.accentColor, percent / 100)
        : colorMixer(COLORS.accentColor, COLORS.secondColor, percent / 50);
  }, [durability, percent]);

if (variant === 'circle') {
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const innerRadius = normalizedRadius - 12;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <svg
      viewBox="0 0 100 100"
      className="progress-ace-circle"
    >
      {/* Outer static circle */}
      <circle
        className="outer-circle"
        r={normalizedRadius}
        cx="50"
        cy="50"
        stroke="rgb(0, 0, 0)"
        strokeWidth={stroke}
        fill="none"
      />

      {/* Inner progress circle */}
      <circle
        className="inner-circle"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={innerRadius}
        cx="50"
        cy="50"
        fill="none"
      />
    </svg>
  );
}



  // Default to bar
  return (
    <div className={durability ? 'durability-bar' : 'weight-bar'}>
      <div
        style={{
          visibility: percent > 0 ? 'visible' : 'hidden',
          height: '100%',
          width: `${percent}%`,
          backgroundColor: color,
          transition: `background 0.3s ease, width 0.3s ease`,
        }}
      />
    </div>
  );
};

export default WeightBar;
