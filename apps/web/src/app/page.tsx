import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Announcements } from '@/components/sections/Announcements';
import { ClubStats } from '@/components/sections/ClubStats';
import { DisciplinesBento } from '@/components/sections/DisciplinesBento';
import { TsvShowcase } from '@/components/sections/TsvShowcase';
import { NewsSection } from '@/components/sections/NewsSection';
import { PracticalInfo } from '@/components/sections/PracticalInfo';
import { Contact } from '@/components/sections/Contact';
import { getSiteContent } from '@/lib/site-content';

export default async function Home() {
  const content = await getSiteContent();

  return (
    <div className="relative w-full overflow-hidden bg-page-gradient">
      <Nav />
      <Hero content={content.hero} />
      <Announcements content={content.announcements} />
      <ClubStats />
      <DisciplinesBento />
      <TsvShowcase />
      <NewsSection />
      <PracticalInfo content={content['practical-info']} />
      <Contact content={content.contact} />
      <Footer />
    </div>
  );
}
