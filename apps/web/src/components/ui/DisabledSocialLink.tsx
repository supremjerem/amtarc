'use client';

import type { MouseEvent, ReactNode } from 'react';

type DisabledSocialLinkProps = Readonly<{
  className?: string;
  ariaLabel: string;
  title: string;
  children: ReactNode;
}>;

// Placeholder social links (`href="#"`) for accounts the club hasn't created
// yet (Instagram/TikTok/YouTube). Prevents the anchor's default jump-to-top
// scroll while still looking and behaving like the real link visually.
export function DisabledSocialLink({
  className,
  ariaLabel,
  title,
  children,
}: DisabledSocialLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
  };

  return (
    <a
      href="#"
      aria-label={ariaLabel}
      aria-disabled="true"
      title={title}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
