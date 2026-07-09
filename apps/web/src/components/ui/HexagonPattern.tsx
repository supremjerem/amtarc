import { useId } from 'react';

type HexagonPatternProps = {
  color?: string;
  opacity?: number;
  className?: string;
};

// Recurring honeycomb SVG motif from the design reference, used as a low-opacity
// background texture across several sections. Each instance needs a unique
// pattern id since SVG `<defs>` ids are global to the document.
export function HexagonPattern({
  color = '#ff9d00',
  opacity = 0.09,
  className = 'absolute inset-0 h-full w-full pointer-events-none',
}: Readonly<HexagonPatternProps>) {
  const patternId = `hexagon-pattern-${useId()}`;

  return (
    <svg className={className} style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id={patternId} width="56" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <path
            d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
