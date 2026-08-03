import Link from 'next/link';
import { announcements as defaultAnnouncements } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { Reveal } from '@/components/ui/Reveal';

export function Announcements({
  content: announcements = defaultAnnouncements,
}: Readonly<{ content?: typeof defaultAnnouncements }>) {
  const { medicalCertificate, membership, merch, newsletter } = announcements;

  return (
    <section id="annonces" className="pt-[88px] pb-5">
      <Container>
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionKicker>{announcements.kicker}</SectionKicker>
            <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.02] font-extrabold tracking-[-0.02em]">
              {announcements.heading}
            </h2>
          </div>
          <Link
            href={announcements.moreLink.href}
            className="text-sm font-bold whitespace-nowrap text-ink-body transition-colors hover:text-overline"
          >
            {announcements.moreLink.label}
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Reveal
            className="relative overflow-hidden rounded-[24px] bg-gold-gradient-card p-9 md:col-span-2"
            delay={0.05}
          >
            <HexagonPattern color="#000000" opacity={0.09} />
            <div className="relative">
              <div className="mb-[18px] inline-block rounded-pill bg-brand px-3 py-[5px] text-[11px] font-extrabold tracking-[0.06em] text-gold">
                {medicalCertificate.badge}
              </div>
              <h3 className="mb-2.5 text-[27px] font-extrabold tracking-[-0.01em] text-ink">
                {medicalCertificate.title}
              </h3>
              <p className="mb-[22px] max-w-[520px] text-[15.5px] leading-[1.55] font-semibold text-ink-on-gold">
                {medicalCertificate.body}
              </p>
              <Link
                href={medicalCertificate.cta.href}
                className="inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-[11px] text-sm font-bold text-white transition-colors hover:bg-brand-black"
              >
                {medicalCertificate.cta.label}
              </Link>
            </div>
          </Reveal>

          <Reveal
            className="flex flex-col justify-between rounded-[24px] border border-ink/10 bg-white p-[34px] shadow-card"
            delay={0.1}
          >
            <div>
              <div className="mb-4 text-xs font-extrabold tracking-[0.12em] text-on-dark">
                {membership.kicker}
              </div>
              <h3 className="mb-2.5 text-[22px] font-extrabold tracking-[-0.01em]">
                {membership.title}
              </h3>
              <p className="text-sm leading-[1.55] text-ink-soft">{membership.body}</p>
            </div>
            <Link
              href={membership.cta.href}
              className="mt-[22px] text-sm font-extrabold text-overline transition-colors hover:text-orange"
            >
              {membership.cta.label}
            </Link>
          </Reveal>

          <Reveal
            className="flex flex-col justify-between rounded-[24px] border border-ink/10 bg-white p-[34px] shadow-card"
            delay={0.12}
          >
            <div>
              <div className="mb-4 text-xs font-extrabold tracking-[0.12em] text-on-dark">
                {merch.kicker}
              </div>
              <h3 className="mb-2.5 text-[22px] font-extrabold tracking-[-0.01em]">
                {merch.title}
              </h3>
              <p className="text-sm leading-[1.55] text-ink-soft">{merch.body}</p>
            </div>
            <Link
              href={merch.cta.href}
              className="mt-[22px] text-sm font-extrabold text-overline transition-colors hover:text-orange"
            >
              {merch.cta.label}
            </Link>
          </Reveal>

          <Reveal
            className="flex items-center gap-5 rounded-[20px] bg-brand px-7 py-5 md:col-span-3"
            delay={0.14}
          >
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-xl font-extrabold text-ink">
              ✉
            </span>
            <div className="flex-1">
              <div className="text-base font-extrabold text-white">{newsletter.title}</div>
              <div className="text-sm text-on-dark">{newsletter.body}</div>
            </div>
            <Link
              href={newsletter.cta.href}
              className="shrink-0 rounded-pill border border-white/25 px-[18px] py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-white/10"
            >
              {newsletter.cta.label}
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
