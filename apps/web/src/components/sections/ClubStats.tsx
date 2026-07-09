import clsx from 'clsx';
import { clubIntro, clubStats } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { StatCounter } from '@/components/ui/StatCounter';
import { Reveal } from '@/components/ui/Reveal';

const CARD_STYLES = {
  light: 'border border-ink/10 bg-white shadow-card',
  gold: 'bg-gold-gradient-card',
  dark: 'bg-brand',
} as const;

const NUMBER_STYLES = {
  light: 'text-ink',
  gold: 'text-ink',
  dark: 'bg-gold-gradient bg-clip-text text-transparent',
} as const;

const LABEL_STYLES = {
  light: 'text-ink-soft',
  gold: 'text-ink-on-gold font-extrabold',
  dark: 'text-on-dark',
} as const;

export function ClubStats() {
  return (
    <section id="club" className="py-[90px]">
      <Container className="grid grid-cols-1 items-center gap-13 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <SectionKicker>{clubIntro.kicker}</SectionKicker>
          <h2 className="mb-[22px] text-[clamp(30px,4vw,50px)] leading-[1.04] font-extrabold tracking-[-0.025em] whitespace-pre-line">
            {clubIntro.heading}
          </h2>
          <p className="mb-[26px] max-w-[520px] text-[17px] leading-[1.6] text-ink-body">
            {clubIntro.paragraph}
          </p>
          <div className="flex flex-wrap gap-3">
            {clubIntro.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-[9px] rounded-pill border border-ink/10 bg-white px-4 py-2 text-[14.5px] font-semibold text-ink-secondary"
              >
                <span className="text-orange">◆</span> {feature}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="grid grid-cols-2 gap-4">
          {clubStats.map((stat) => (
            <div
              key={stat.label}
              className={clsx('rounded-card p-[26px]', CARD_STYLES[stat.variant])}
            >
              <div
                className={clsx(
                  'font-display text-[52px] leading-none',
                  NUMBER_STYLES[stat.variant],
                )}
              >
                <StatCounter target={stat.value} />
                {stat.suffix && <span className="text-2xl text-on-dark">{stat.suffix}</span>}
              </div>
              <div className={clsx('mt-1.5 text-sm font-bold', LABEL_STYLES[stat.variant])}>
                {stat.label}
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
