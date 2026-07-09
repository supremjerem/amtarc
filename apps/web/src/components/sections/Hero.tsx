import Image from 'next/image';
import { hero } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { PillButton } from '@/components/ui/PillButton';

function CompassArm({ rotate }: Readonly<{ rotate: number }>) {
  return (
    <g transform={rotate ? `rotate(${rotate})` : undefined}>
      <path d="M-7 -6 L-7 -32 L-19 -32 L0 -54 L19 -32 L7 -32 L7 -6 Z" />
      <circle cx="-19" cy="-32" r="6.5" />
      <circle cx="19" cy="-32" r="6.5" />
      <circle cx="0" cy="-54" r="6.5" />
    </g>
  );
}

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-10"
    >
      <HexagonPattern color="#ff9d00" opacity={0.09} />
      <div className="pointer-events-none absolute -right-[120px] -bottom-[160px] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(255,175,0,0.35),rgba(255,175,0,0)_66%)]" />

      <Container className="relative z-[2] grid grid-cols-1 items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div
            className="animate-reveal mb-6 inline-flex items-center gap-[9px] rounded-pill border border-ink/[0.14] bg-white/70 px-[15px] py-[7px] text-xs font-bold tracking-[0.13em] text-ink-soft"
            style={{ animationDelay: '50ms' }}
          >
            <span className="h-[7px] w-[7px] rounded-[2px] bg-gold-gradient" />
            {hero.badge}
          </div>

          <div
            className="animate-reveal mb-[18px] bg-hero-gradient bg-clip-text font-display text-[clamp(66px,12vw,150px)] leading-[0.86] tracking-[0.01em] text-transparent [-webkit-text-stroke:2px_rgba(20,16,8,0.82)] drop-shadow-[0_6px_14px_rgba(255,138,0,0.25)]"
            style={{ animationDelay: '120ms' }}
          >
            {hero.wordmark}
          </div>

          <h1
            className="animate-reveal mb-5 whitespace-pre-line text-[clamp(26px,3.4vw,42px)] leading-[1.05] font-extrabold tracking-[-0.02em]"
            style={{ animationDelay: '200ms' }}
          >
            {hero.title}
          </h1>

          <p
            className="animate-reveal mb-[34px] max-w-[500px] text-[clamp(16px,1.7vw,19px)] leading-[1.55] font-medium text-ink-body"
            style={{ animationDelay: '280ms' }}
          >
            {hero.paragraph}
          </p>

          <div
            className="animate-reveal flex flex-wrap gap-3.5"
            style={{ animationDelay: '360ms' }}
          >
            <PillButton href={hero.ctaPrimary.href} variant="gold-lg">
              {hero.ctaPrimary.label}
            </PillButton>
            <PillButton href={hero.ctaSecondary.href} variant="dark">
              {hero.ctaSecondary.label}
            </PillButton>
          </div>
        </div>

        <div
          className="animate-reveal relative flex items-center justify-center"
          style={{ animationDelay: '200ms' }}
        >
          <svg
            viewBox="-60 -60 120 120"
            className="animate-float absolute h-[118%] w-[118%] text-orange opacity-10"
            fill="currentColor"
            aria-hidden="true"
          >
            <CompassArm rotate={0} />
            <CompassArm rotate={90} />
            <CompassArm rotate={180} />
            <CompassArm rotate={270} />
          </svg>
          <Image
            src="/panther.png"
            alt="Panthère AMTARC"
            width={420}
            height={593}
            priority
            className="relative h-auto w-[min(88%,420px)] drop-shadow-[0_26px_44px_rgba(20,16,8,0.4)]"
          />
        </div>
      </Container>

      <div className="absolute bottom-[22px] left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-on-dark">
        {hero.scrollHint}
        <span className="animate-bob h-8 w-px bg-[linear-gradient(#c9a15a,transparent)]" />
      </div>
    </header>
  );
}
