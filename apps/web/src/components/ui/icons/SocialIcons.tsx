type BaseIconProps = Readonly<{
  size?: number;
  /** Main icon color (fill or stroke depending on the glyph). */
  color: string;
  className?: string;
}>;

type YouTubeIconProps = BaseIconProps & {
  /** Color of the play triangle — matches the pastille's background so it
   * reads as a cutout rather than a filled shape. */
  holeColor: string;
};

export function FacebookIcon({ size = 22, color, className }: BaseIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      className={className}
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.02H7.9v-2.92h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.92h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 22, color, className }: BaseIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.2" fill={color} stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ size = 21, color, className }: BaseIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      className={className}
    >
      <path d="M16.5 2h-2.9v13.1a2.6 2.6 0 1 1-2.6-2.6c.28 0 .55.04.8.12V9.6a5.7 5.7 0 1 0 4.7 5.6V8.62a6.6 6.6 0 0 0 3.9 1.27V6.94a3.7 3.7 0 0 1-3.9-3.6V2Z" />
    </svg>
  );
}

export function YouTubeIcon({ size = 24, color, holeColor, className }: YouTubeIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className}>
      <path
        fill={color}
        d="M23 12s0-3.2-.41-4.73a2.5 2.5 0 0 0-1.76-1.77C19.29 5.09 12 5.09 12 5.09s-7.29 0-8.83.41A2.5 2.5 0 0 0 1.41 7.27C1 8.8 1 12 1 12s0 3.2.41 4.73a2.5 2.5 0 0 0 1.76 1.77c1.54.41 8.83.41 8.83.41s7.29 0 8.83-.41a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12Z"
      />
      <path fill={holeColor} d="M9.75 15.02V8.98L15 12l-5.25 3.02Z" />
    </svg>
  );
}
