// Static site copy. Strings are French (visitor-facing content of a French club site);
// keys, types and structure stay in English per project convention.

export type NavLink = {
  href: string;
  label: string;
};

// Root-relative anchors so the nav also works from /matchs and other routes.
export const navLinks: NavLink[] = [
  { href: '/#club', label: 'Le club' },
  { href: '/#disciplines', label: 'Disciplines' },
  { href: '/#tsv', label: 'TSV' },
  { href: '/matchs', label: 'Matchs' },
  { href: '/#actus', label: 'Actualités' },
  { href: '/#infos', label: 'Infos pratiques' },
];

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube';

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
  external: boolean;
  comingSoon: boolean;
};

export const socialLinks: SocialLink[] = [
  {
    platform: 'facebook',
    label: 'Facebook',
    href: 'https://fr-fr.facebook.com/TSV-Amtarc-953914188035594/',
    external: true,
    comingSoon: false,
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/ipsc.amtarc/',
    external: true,
    comingSoon: false,
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    href: '#',
    external: false,
    comingSoon: true,
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    href: '#',
    external: false,
    comingSoon: true,
  },
];

export const hero = {
  badge: 'CLUB DE TIR · MEAUZAC · TARN-ET-GARONNE',
  wordmark: 'AMTARC',
  title: "La précision\nne s'improvise pas.",
  paragraph:
    'Association meauzacaise de tireurs aux armes rayées et de chasse. Du 10 mètres au Tir Sportif de Vitesse, la passion du geste juste depuis le stand de Chapas.',
  ctaPrimary: { href: '#disciplines', label: 'Découvrir le club' },
  ctaSecondary: { href: '#tsv', label: 'La section TSV →' },
  scrollHint: 'DÉFILER',
};

export const announcements = {
  kicker: 'À NE PAS MANQUER',
  heading: 'Les messages du club.',
  moreLink: { href: '#actus', label: 'Toutes les actus →' },
  medicalCertificate: {
    badge: 'OBLIGATOIRE',
    title: 'Certificat médical 2025 / 2026',
    body: 'Un certificat médical est requis pour tous les licenciés. Téléchargez le modèle officiel, faites-le compléter et signer par votre médecin avant la reprise.',
    cta: { href: '#contact', label: 'Télécharger le modèle ↓' },
  },
  membership: {
    kicker: 'SAISON',
    title: 'Adhésions 2026 / 2027',
    body: 'Les inscriptions ouvrent chaque année à la rentrée. Dossier, cotisation et pièces à préparer en amont.',
    cta: { href: '#infos', label: 'Voir les conditions →' },
  },
  merch: {
    kicker: 'BOUTIQUE',
    title: "Aux couleurs de l'AMTARC",
    body: 'Vestes, polos, sweats, t-shirts et casquettes au logo du club. Livraison gratuite au club.',
    cta: { href: '#contact', label: 'Commander →' },
  },
  newsletter: {
    title: '« Chapas News » — la lettre du club',
    body: 'Concours, travaux, bourse aux armes : toute la vie du stand, saison après saison.',
    cta: { href: '#actus', label: 'Lire →' },
  },
};

export type ClubStat = {
  value: number;
  suffix?: string;
  label: string;
  variant: 'light' | 'gold' | 'dark';
};

export const clubStats: ClubStat[] = [
  { value: 5, label: 'disciplines de tir', variant: 'light' },
  { value: 10, label: 'alvéoles TSV', variant: 'gold' },
  { value: 200, suffix: ' m', label: 'distance maximale', variant: 'light' },
  { value: 3, label: 'créneaux / semaine', variant: 'dark' },
];

export const clubIntro = {
  kicker: 'LE CLUB DE CHAPAS',
  heading: 'Un stand complet,\nune communauté sérieuse.',
  paragraph:
    "Niché au lieu-dit Chapas à Meauzac, l'AMTARC réunit tireurs sportifs, passionnés de poudre noire et compétiteurs TSV autour d'une même exigence : la sécurité et la précision. Cinq disciplines, des installations dédiées et un encadrement fédéral.",
  features: ['Encadrement fédéral', 'Moniteurs & arbitres diplômés', 'École de tir'],
};

export type DisciplineCard = {
  id: string;
  size: 'hero' | 'small' | 'wide' | 'full';
  overline?: string;
  badge?: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  bigLabel?: string;
  emoji?: string;
};

export const disciplinesKicker = {
  kicker: 'NOS DISCIPLINES',
  heading: 'Cinq façons de viser juste.',
};

export const disciplines: DisciplineCard[] = [
  {
    id: 'tsv',
    size: 'hero',
    badge: 'DISCIPLINE PHARE',
    title: 'Tir Sportif de Vitesse',
    body: 'Né aux États-Unis (IPSC), le TSV enchaîne des parcours chronométrés au gros calibre, arme au holster. Puissance, mouvement et sang-froid.',
    href: '#tsv',
    cta: 'Explorer la section TSV →',
  },
  {
    id: '10m',
    size: 'small',
    overline: 'ISSF',
    title: '10 mètres',
    body: 'Carabine & pistolet à air comprimé. Le geste de base, à la perfection.',
  },
  {
    id: '25m',
    size: 'small',
    overline: 'ISSF',
    title: '25 mètres',
    body: 'Pistolet vitesse et précision. Rythme et régularité.',
  },
  {
    id: '50-100m',
    size: 'wide',
    overline: 'CARABINE',
    title: '50 – 100 mètres',
    body: 'Le tir à distance, où la lecture du vent et la maîtrise du souffle font la différence.',
    bigLabel: '100m',
  },
  {
    id: '200m',
    size: 'small',
    overline: 'LONGUE DISTANCE',
    title: '200 mètres',
    body: "Notre plus longue ligne de tir. L'exigence absolue.",
  },
  {
    id: 'black-powder',
    size: 'full',
    overline: 'TRADITION',
    title: 'Poudre noire',
    body: 'Armes anciennes et répliques historiques : le tir dans sa forme la plus authentique, entre fumée, rituel et patience.',
    emoji: '🔥',
  },
];

export const tsvShowcase = {
  badge: '★ NOTRE FIERTÉ',
  heading: 'Le TSV,\nnotre signature.',
  paragraphs: [
    "Le Tir Sportif de Vitesse propose des actions chronométrées au pistolet de gros calibre — jamais inférieur à 9 mm — arme portée dans un étui à la ceinture. Une discipline spectaculaire, née de l'IPSC américain.",
    "Le club dispose d'une dizaine d'alvéoles de tailles variées, bordées de buttes de terre qui garantissent la sécurité. Un plateau technique rare, encadré par des moniteurs et arbitres fédéraux.",
  ],
  stats: [
    { value: '≥9 mm', label: 'gros calibre' },
    { value: 'HOLSTER', label: 'départ à la ceinture' },
    { value: 'CHRONO', label: 'classement au temps' },
  ],
  ctaPrimary: { href: '#infos', label: "Découvrir l'entraînement" },
  ctaSecondary: { href: '#contact', label: 'Venir essayer' },
};

export type NewsCategory = 'CONCOURS' | 'TRAVAUX' | 'EVENEMENT';

export type NewsItem = {
  slug: string;
  category: NewsCategory;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
};

// Fallback content shown until the news API is wired in (mirrors the API seed data).
export const fallbackNews: NewsItem[] = [
  {
    slug: 'concours-interne-fin-de-saison',
    category: 'CONCOURS',
    title: 'Concours interne de fin de saison',
    excerpt:
      "Retrouvez le calendrier des compétitions et les classements du club, mis à jour tout au long de l'année.",
    imageUrl: null,
  },
  {
    slug: 'amelioration-continue-du-stand',
    category: 'TRAVAUX',
    title: 'Amélioration continue du stand',
    excerpt:
      'Pas de tir, alvéoles, buttes : les bénévoles entretiennent et modernisent les installations en permanence.',
    imageUrl: null,
  },
  {
    slug: 'bourse-aux-armes',
    category: 'EVENEMENT',
    title: 'Bourse aux armes',
    excerpt:
      'Un rendez-vous attendu des passionnés. Achat, vente et échange dans le respect de la réglementation.',
    imageUrl: null,
  },
];

export const newsSection = {
  kicker: 'VIE DU CLUB',
  heading: 'Ce qui se passe à Chapas.',
};

export const practicalInfo = {
  hoursKicker: "HORAIRES D'OUVERTURE",
  hours: [
    { day: 'Lundi', time: '14 h 00 – 18 h 00' },
    { day: 'Mercredi', time: '14 h 00 – 18 h 00' },
    { day: 'Samedi', time: '14 h 00 – 18 h 00' },
  ],
  hoursNote:
    'Saison sportive du 1ᵉʳ septembre au 31 août. Inscription obligatoire au cahier de présence à chaque venue.',
  membershipKicker: "DOSSIER D'ADHÉSION",
  membershipHeading: 'À prévoir pour votre licence',
  membershipChecklist: [
    'Certificat médical',
    "Photos d'identité",
    "Pièce d'identité",
    'Extrait casier judiciaire 3',
    'Justificatif de domicile',
    'Cotisation annuelle',
  ],
  membershipNote:
    "Un droit d'entrée est demandé à tout nouvel adhérent. La cotisation est fixée par le bureau avant chaque saison.",
  membershipCta: { href: '#contact', label: 'Nous contacter pour adhérer →' },
};

export const contact = {
  heading: 'Venez tirer avec nous.',
  paragraph:
    'Débutant curieux ou tireur confirmé, poussez la porte du stand de Chapas. On vous explique tout — de la sécurité au premier plomb.',
  email: 'contact@amtarc.fr',
  address: {
    kicker: 'ADRESSE',
    lines: ['AMTARC — lieu-dit « Chapas »', '82290 Meauzac, Tarn-et-Garonne'],
  },
  hours: {
    kicker: 'OUVERTURE',
    lines: ['Lundi · Mercredi · Samedi', '14 h 00 – 18 h 00'],
  },
};

export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const footer: { tagline: string; columns: FooterColumn[]; location: string } = {
  tagline:
    'Association meauzacaise de tireurs aux armes rayées et de chasse. Stand de tir de Chapas, Meauzac (82).',
  columns: [
    {
      title: 'DISCIPLINES',
      links: [
        { href: '#disciplines', label: '10 mètres' },
        { href: '#disciplines', label: '25 mètres' },
        { href: '#disciplines', label: '50 – 200 mètres' },
        { href: '#disciplines', label: 'Poudre noire' },
        { href: '#tsv', label: 'Tir Sportif de Vitesse' },
      ],
    },
    {
      title: 'LE CLUB',
      links: [
        { href: '#club', label: 'Présentation' },
        { href: '#infos', label: 'Horaires' },
        { href: '#infos', label: 'Adhésion' },
        { href: '#actus', label: 'Actualités' },
      ],
    },
    {
      title: 'FÉDÉRATIONS',
      links: [
        { href: 'http://www.fftir.org', label: 'Fédération Française de Tir', external: true },
        {
          href: 'http://www.liguetirmidipyrenees.fr/',
          label: 'Ligue Midi-Pyrénées',
          external: true,
        },
        { href: 'mailto:contact@amtarc.fr', label: 'contact@amtarc.fr', external: false },
      ],
    },
  ],
  location: 'Meauzac · Tarn-et-Garonne · Occitanie',
};
