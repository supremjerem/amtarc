import Link from 'next/link';
import { practicalInfo as defaultPracticalInfo } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { Reveal } from '@/components/ui/Reveal';

export function PracticalInfo({
  content: practicalInfo = defaultPracticalInfo,
}: Readonly<{ content?: typeof defaultPracticalInfo }>) {
  // scroll-mt: pt-5 (20px) alone would leave the cards under the fixed nav on
  // an anchor jump — see the anchor-landing note in globals.css.
  return (
    <section id="infos" className="scroll-mt-[76px] pt-5 pb-24">
      <Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-[26px] bg-brand p-10">
          <HexagonPattern color="#ffb200" opacity={0.1} />
          <div className="relative">
            <div className="mb-[18px] data-label text-gold">{practicalInfo.hoursKicker}</div>
            <div className="flex flex-col">
              {practicalInfo.hours.map((entry, index) => (
                <div
                  key={entry.day}
                  className={`flex items-center justify-between py-4 ${
                    index < practicalInfo.hours.length - 1 ? 'border-b border-white/[0.12]' : ''
                  }`}
                >
                  <span className="display text-[19px] text-white">{entry.day}</span>
                  <span className="data-figure text-[15px] text-on-dark-lighter">{entry.time}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-[1.5] text-on-dark">{practicalInfo.hoursNote}</p>
          </div>
        </Reveal>

        <Reveal
          delay={0.06}
          className="rounded-[26px] border border-ink/10 bg-white p-10 shadow-card"
        >
          <div className="mb-[18px] data-label text-overline">{practicalInfo.membershipKicker}</div>
          <h3 className="mb-[18px] display text-[22px]">{practicalInfo.membershipHeading}</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {practicalInfo.membershipChecklist.map((item) => (
              <div
                key={item}
                className="flex items-baseline gap-2.5 text-[14.5px] font-semibold text-ink-secondary"
              >
                <span className="text-orange">›</span> {item}
              </div>
            ))}
          </div>
          <p className="mt-[22px] text-sm leading-[1.55] text-ink-soft">
            {practicalInfo.membershipNote}
          </p>
          <Link
            href={practicalInfo.membershipCta.href}
            className="mt-5 inline-block text-[14.5px] font-extrabold text-overline transition-colors hover:text-orange"
          >
            {practicalInfo.membershipCta.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
