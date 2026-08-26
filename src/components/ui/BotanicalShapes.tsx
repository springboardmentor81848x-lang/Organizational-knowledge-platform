import React from 'react';

interface BotanicalProps {
  className?: string;
  variant?: 'leaf-top-right' | 'leaf-bottom-left' | 'organic-blob' | 'sprout-cluster' | 'card-corner';
  opacity?: number;
}

export const BotanicalShapes: React.FC<BotanicalProps> = ({
  className = '',
  variant = 'leaf-top-right',
  opacity = 0.4,
}) => {
  if (variant === 'leaf-top-right') {
    return (
      <svg
        className={`pointer-events-none absolute -top-8 -right-8 w-44 h-44 text-teal-600 ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M190 10C140 10 110 50 110 100C110 150 150 190 200 190C200 140 160 110 110 110C60 110 20 70 20 20C70 20 100 60 100 110"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M170 30C130 50 120 90 130 130C150 130 190 120 210 80C190 60 160 60 170 30Z"
          fill="#0F9D95"
          fillOpacity="0.12"
        />
        <circle cx="160" cy="40" r="6" fill="#0F9D95" fillOpacity="0.3" />
        <circle cx="120" cy="80" r="4" fill="#0F9D95" fillOpacity="0.2" />
        <circle cx="180" cy="110" r="5" fill="#087F78" fillOpacity="0.25" />
      </svg>
    );
  }

  if (variant === 'leaf-bottom-left') {
    return (
      <svg
        className={`pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 text-teal-600 ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 190C60 190 90 150 90 100C90 50 50 10 0 10C0 60 40 90 90 90C140 90 180 130 180 180C130 180 100 140 100 90"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M30 170C70 150 80 110 70 70C50 70 10 80 -10 120C10 140 40 140 30 170Z"
          fill="#0F9D95"
          fillOpacity="0.1"
        />
        <circle cx="40" cy="160" r="5" fill="#0F9D95" fillOpacity="0.25" />
        <circle cx="80" cy="120" r="4" fill="#0F9D95" fillOpacity="0.2" />
      </svg>
    );
  }

  if (variant === 'organic-blob') {
    return (
      <svg
        className={`pointer-events-none absolute w-64 h-64 ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M45.7,-59.1C58.9,-51.4,69.1,-37.8,73.4,-22.4C77.7,-7,76.2,10.2,69.9,25.2C63.6,40.2,52.5,53,38.8,61.4C25.1,69.8,8.8,73.8,-7.4,72.6C-23.6,71.4,-39.8,65,-51.8,54.4C-63.8,43.8,-71.6,29,-74.6,13C-77.6,-3,-75.8,-20.2,-67.2,-33.9C-58.6,-47.6,-43.2,-57.8,-28,-64.3C-12.8,-70.8,2.2,-73.6,16.8,-70.7C31.4,-67.8,32.5,-66.8,45.7,-59.1Z"
          transform="translate(100 100)"
          fill="#E6F7F5"
        />
      </svg>
    );
  }

  if (variant === 'card-corner') {
    return (
      <div className={`pointer-events-none absolute top-0 right-0 overflow-hidden w-28 h-28 ${className}`} style={{ opacity }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-teal-600/10 fill-current">
          <path d="M100 0 C70 10 40 40 30 70 C20 100 0 100 0 100 L100 100 Z" />
        </svg>
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500/30" />
        </div>
      </div>
    );
  }

  return (
    <svg
      className={`pointer-events-none absolute w-32 h-32 text-teal-600 ${className}`}
      style={{ opacity }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 90 V20 M50 35 C35 25 25 35 25 45 C35 55 45 45 50 35 M50 55 C65 45 75 55 75 65 C65 75 55 65 50 55" stroke="#0F9D95" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
