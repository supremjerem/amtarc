import Image from 'next/image';
import Link from 'next/link';
import { contact as defaultContact } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { Reveal } from '@/components/ui/Reveal';

export function Contact({
  content: contact = defaultContact,
}: Readonly<{ content?: typeof defaultContact }>) {
  // scroll-mt: no top padding of its own, so it carries the full anchor
  // offset — see the anchor-landing note in globals.css.
  return (
    <section id="contact" className="mb-10 scroll-mt-[96px]">
      <Container>
        <Reveal className="relative overflow-hidden rounded-card-lg bg-gold-gradient-card px-6 py-14 sm:px-12 sm:py-18">
          <HexagonPattern color="#000000" opacity={0.08} />
          <Image
            src="/panther.png"
            alt=""
            aria-hidden="true"
            width={375}
            height={530}
            className="pointer-events-none absolute right-[-10px] bottom-[-30px] h-[118%] w-auto opacity-[0.16]"
          />
          <div className="relative max-w-[640px]">
            <Heading className="mb-[18px] text-[clamp(32px,4.6vw,56px)] leading-none text-ink">
              {contact.heading}
            </Heading>
            <p className="mb-[34px] max-w-[520px] text-lg leading-[1.55] font-semibold text-ink-on-gold">
              {contact.paragraph}
            </p>
            <div className="mb-[30px] flex flex-wrap items-center gap-3.5">
              <Link
                href={`mailto:${contact.email}`}
                className="rounded-pill bg-brand px-[30px] py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-black"
              >
                {contact.email}
              </Link>
            </div>
            <div className="mb-11">
              <SocialLinks variant="contact" />
            </div>
            <div className="flex flex-wrap gap-10">
              <div>
                <div className="mb-1.5 data-label text-overline-on-gold">
                  {contact.address.kicker}
                </div>
                <div className="text-[15px] leading-[1.5] font-bold text-ink">
                  {contact.address.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 data-label text-overline-on-gold">
                  {contact.hours.kicker}
                </div>
                <div className="text-[15px] leading-[1.5] font-bold text-ink">
                  {contact.hours.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
