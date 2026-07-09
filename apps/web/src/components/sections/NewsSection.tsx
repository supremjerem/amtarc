import { newsSection, type NewsItem } from '@/lib/content';
import { getPublishedNews } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { HexagonPattern } from '@/components/ui/HexagonPattern';
import { Reveal } from '@/components/ui/Reveal';

const CATEGORY_LABELS: Record<NewsItem['category'], string> = {
  CONCOURS: 'CONCOURS',
  TRAVAUX: 'TRAVAUX',
  EVENEMENT: 'ÉVÉNEMENT',
};

function NewsCard({ item }: Readonly<{ item: NewsItem }>) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-ink/10 bg-white shadow-[0_2px_20px_rgba(20,16,8,0.05)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-card-hover">
      <div className="relative h-[180px] bg-cream-500">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote/admin-uploaded photos, dimensions unknown ahead of time
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <HexagonPattern color="#ff8a00" opacity={0.16} />
            <span className="relative text-xs font-bold tracking-[0.1em] text-on-dark-muted">
              Photo à venir
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-2.5 text-xs font-extrabold tracking-[0.08em] text-overline">
          {CATEGORY_LABELS[item.category]}
        </div>
        <h3 className="mb-2 text-[19px] font-extrabold tracking-[-0.01em]">{item.title}</h3>
        <p className="text-sm leading-[1.55] text-ink-soft">{item.excerpt}</p>
      </div>
    </article>
  );
}

export async function NewsSection() {
  const items = await getPublishedNews();

  return (
    <section id="actus" className="py-24">
      <Container>
        <Reveal className="mb-8">
          <SectionKicker>{newsSection.kicker}</SectionKicker>
          <h2 className="text-[clamp(30px,4vw,50px)] leading-[1.02] font-extrabold tracking-[-0.025em]">
            {newsSection.heading}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.slug} delay={index * 0.06}>
              <NewsCard item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
