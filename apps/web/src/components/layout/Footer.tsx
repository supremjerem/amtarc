import Image from 'next/image';
import Link from 'next/link';
import { footer } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { SocialLinks } from '@/components/ui/SocialLinks';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand">
      <HexagonPattern color="#ffb200" opacity={0.06} />

      <Container className="relative pt-14 pb-10">
        <div className="mb-11 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="#top" className="mb-4 flex items-center gap-3">
              <Image
                src="/panther.png"
                alt="Panthère AMTARC"
                width={27}
                height={38}
                className="h-[38px] w-auto"
              />
              <span className="bg-gold-gradient bg-clip-text display-wordmark text-[26px] leading-none text-transparent">
                AMTARC
              </span>
            </Link>
            <p className="mb-6 max-w-[280px] text-sm leading-relaxed text-on-dark">
              {footer.tagline}
            </p>
            <SocialLinks variant="footer" />
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <div className="mb-4 text-xs font-extrabold tracking-[0.1em] text-white">
                {column.title}
              </div>
              <div className="flex flex-col gap-[11px]">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener' : undefined}
                    className="text-sm text-on-dark transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.12] pt-6">
          <div className="text-[12.5px] text-on-dark-muted">
            © {year} AMTARC · Tous droits réservés
          </div>
          <div className="text-[12.5px] text-on-dark-muted">{footer.location}</div>
        </div>
      </Container>
    </footer>
  );
}
