import Image from 'next/image';
import { tsvShowcase } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { PillButton } from '@/components/ui/PillButton';
import { Reveal } from '@/components/ui/Reveal';

export function TsvShowcase() {
  return (
    <section id="tsv" className="relative overflow-hidden bg-tsv-gradient py-26">
      <HexagonPattern color="#ff8a00" opacity={0.14} />
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="mb-[22px] inline-flex items-center gap-[9px] rounded-pill bg-brand px-3.5 py-1.5 data-label text-gold">
              {tsvShowcase.badge}
            </div>
            <Heading className="mb-[22px] text-[clamp(34px,4.6vw,58px)] leading-none whitespace-pre-line">
              {tsvShowcase.heading}
            </Heading>
            {tsvShowcase.paragraphs.map((paragraph, index) => (
              <p key={paragraph.slice(0, 24)} className={paragraphClassName(index)}>
                {paragraph}
              </p>
            ))}
            <div className="mb-[34px] flex flex-wrap gap-5">
              {tsvShowcase.stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-5">
                  {index > 0 && <div className="h-9 w-px bg-ink/15" />}
                  <div>
                    <div className="data-figure text-[26px] text-ink">{stat.value}</div>
                    <div className="text-[12.5px] font-bold text-[#8a744a]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3.5">
              <PillButton href={tsvShowcase.ctaPrimary.href} variant="dark">
                {tsvShowcase.ctaPrimary.label}
              </PillButton>
              <PillButton href={tsvShowcase.ctaSecondary.href} variant="outline">
                {tsvShowcase.ctaSecondary.label}
              </PillButton>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative flex items-center justify-center">
            <div className="absolute h-[min(94%,460px)] w-[min(94%,460px)] rounded-full bg-[radial-gradient(circle,rgba(255,138,0,0.4),rgba(255,138,0,0)_68%)]" />
            <Image
              src="/panther.png"
              alt="Panthère AMTARC"
              width={698}
              height={760}
              className="relative h-auto w-[min(80%,400px)] drop-shadow-[0_28px_46px_rgba(20,16,8,0.38)]"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function paragraphClassName(index: number) {
  return index === 0
    ? 'mb-5 max-w-[520px] text-[17.5px] leading-[1.62] font-medium text-[#5a4a2a]'
    : 'mb-8 max-w-[520px] text-base leading-[1.62] font-medium text-[#7a6a48]';
}
