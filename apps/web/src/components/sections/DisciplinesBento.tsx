import Link from 'next/link';
import clsx from 'clsx';
import { disciplines, disciplinesKicker, type DisciplineCard } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { Reveal } from '@/components/ui/Reveal';

const SPAN_CLASSES: Record<DisciplineCard['size'], string> = {
  hero: 'col-span-2 row-span-2',
  small: '',
  wide: 'col-span-2',
  full: 'col-span-2 md:col-span-3',
};

function DisciplineTile({ card }: Readonly<{ card: DisciplineCard }>) {
  if (card.size === 'hero') {
    return (
      <Link
        href={card.href ?? '#'}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-gold-gradient-card p-9 text-ink transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_20px_40px_rgba(255,138,0,0.35)]"
      >
        <HexagonPattern color="#000000" opacity={0.08} />
        <div className="relative">
          <div className="mb-5 inline-block rounded-pill bg-brand px-3 py-[5px] data-label text-gold">
            {card.badge}
          </div>
          <h3 className="mb-3 display text-[34px]">{card.title}</h3>
          <p className="max-w-[380px] text-[15.5px] leading-[1.55] font-semibold text-ink-on-gold">
            {card.body}
          </p>
        </div>
        <div className="relative text-[14.5px] font-extrabold">{card.cta}</div>
      </Link>
    );
  }

  if (card.size === 'full') {
    return (
      <div className="relative flex h-full items-center justify-between gap-6 overflow-hidden rounded-[26px] bg-brand p-8 transition-transform duration-200 hover:-translate-y-0.5">
        <HexagonPattern color="#ffb200" opacity={0.12} />
        <div className="relative">
          <div className="mb-2 data-label text-gold">{card.overline}</div>
          <h3 className="mb-1.5 display text-[26px] text-white">{card.title}</h3>
          <p className="max-w-[520px] text-sm leading-[1.55] text-on-dark-light">{card.body}</p>
        </div>
        <span className="relative shrink-0 text-[44px]">{card.emoji}</span>
      </div>
    );
  }

  if (card.size === 'wide') {
    return (
      <div className="flex h-full items-center justify-between gap-5 rounded-[26px] border border-ink/10 bg-white px-[30px] py-7 shadow-card transition-colors hover:border-orange/50">
        <div>
          <div className="mb-2 data-label text-overline">{card.overline}</div>
          <h3 className="mb-1.5 display text-2xl">{card.title}</h3>
          <p className="max-w-[340px] text-[13.5px] leading-[1.5] text-ink-soft">{card.body}</p>
        </div>
        <div className="data-figure text-[48px] text-cream-600">{card.bigLabel}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-[26px] border border-ink/10 bg-white p-7 shadow-card transition-colors hover:border-orange/50">
      <div className="data-label text-overline">{card.overline}</div>
      <div>
        <h3 className="mb-1.5 display text-2xl">{card.title}</h3>
        <p className="text-[13.5px] leading-[1.5] text-ink-soft">{card.body}</p>
      </div>
    </div>
  );
}

export function DisciplinesBento() {
  return (
    <section id="disciplines" className="scroll-mt-[46px] pt-[50px] pb-24">
      <Container>
        <Reveal className="mb-8">
          <SectionKicker>{disciplinesKicker.kicker}</SectionKicker>
          <Heading className="text-[clamp(30px,4vw,50px)] leading-[1.02]">
            {disciplinesKicker.heading}
          </Heading>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 [grid-auto-rows:minmax(150px,auto)] md:grid-cols-4">
          {disciplines.map((card, index) => (
            <Reveal
              key={card.id}
              delay={index * 0.04}
              className={clsx('h-full', SPAN_CLASSES[card.size])}
            >
              <DisciplineTile card={card} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
