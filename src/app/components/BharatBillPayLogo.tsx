import React from 'react';

interface BharatProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isDark?: boolean;
}

/**
 * Official Bharat Connect Logo Mark (NPCI)
 * Composed of two geometric blocks forming the iconic 'B' 
 * with dynamic bidirectional arrows
 */
export const BharatConnectIcon: React.FC<{ size?: number; className?: string; color?: string }> = ({ 
  size = 20, 
  className = '',
  color
}) => {
  const defaultBlue = '#2E60C7';
  const fillColor = color || defaultBlue;
  const maskIdTop = React.useId().replace(/:/g, '-');
  const maskIdBot = React.useId().replace(/:/g, '-');

  return (
    <svg 
      width={size} 
      height={(size * 54) / 44} 
      viewBox="0 0 44 54" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Bharat Connect"
    >
      <defs>
        <mask id={`bc-mtop-${maskIdTop}`}>
          <rect width="44" height="54" fill="white" />
          {/* Top cutout: begins from left side, goes right, angles up-left ↖ (shortened diagonal) */}
          <path 
            d="M -2 19 H 19 L 11 10" 
            stroke="black" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </mask>
        <mask id={`bc-mbot-${maskIdBot}`}>
          <rect width="44" height="54" fill="white" />
          {/* Bottom cutout: begins from right side, goes left, angles down-right ↘ (shortened diagonal) */}
          <path 
            d="M 46 35 H 21 L 29 44" 
            stroke="black" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </mask>
      </defs>

      {/* Top 'B' Half */}
      <path 
        d="M 3 1 H 24 C 34.5 1 43 9.5 43 20 C 43 23 40.5 25.5 37.5 25.5 H 3 C 1.5 25.5 0 24 0 22.5 V 4 C 0 2.5 1.5 1 3 1 Z" 
        fill={fillColor} 
        mask={`url(#bc-mtop-${maskIdTop})`} 
      />

      {/* Bottom 'B' Half */}
      <path 
        d="M 3 28.5 H 37.5 C 40.5 28.5 43 31 43 34 C 43 44.5 34.5 53 24 53 H 3 C 1.5 53 0 51.5 0 50 V 31.5 C 0 30 1.5 28.5 3 28.5 Z" 
        fill={fillColor} 
        mask={`url(#bc-mbot-${maskIdBot})`} 
      />
    </svg>
  );
};

/**
 * Official "Powered by Bharat Connect" Footer component
 * Styled exactly like PhonePe / NPCI Bharat Connect specs
 */
export const PoweredByBharatConnect: React.FC<{ isDark?: boolean; className?: string }> = ({
  isDark = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 select-none py-1.5 ${className}`}>
      <span className="text-xs font-normal tracking-tight text-slate-500 dark:text-slate-400">
        Powered by
      </span>
      <div className="flex items-center gap-1.5">
        <BharatConnectIcon 
          size={19} 
          color={isDark ? '#3B82F6' : '#2E60C7'} 
        />
        <div className="flex flex-col leading-[1.05] text-left">
          <span 
            className="text-[12px] font-extrabold tracking-tight"
            style={{ color: isDark ? '#FB923C' : '#EB5A28' }}
          >
            Bharat
          </span>
          <span 
            className="text-[12px] font-bold tracking-tight"
            style={{ color: isDark ? '#FB923C' : '#EB5A28' }}
          >
            Connect
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Legacy Bharat BillPay badge compatibility export
 */
export const PoweredByBBPSBadge: React.FC<{ isDark?: boolean; className?: string }> = ({
  isDark = true,
  className = ''
}) => {
  return <PoweredByBharatConnect isDark={isDark} className={className} />;
};

export const BharatBillPayLogo: React.FC<BharatProps> = ({ 
  className = '', 
  isDark = true 
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <BharatConnectIcon size={16} color={isDark ? '#3B82F6' : '#2E60C7'} />
      <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Bharat Connect
      </span>
    </div>
  );
};

export const BharatBillPayIcon = BharatConnectIcon;



