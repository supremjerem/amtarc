import type { Metadata } from 'next';
import { Anton, Manrope } from 'next/font/google';
import './globals.css';

const anton = Anton({
  variable: '--font-anton',
  weight: '400',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AMTARC — Club de tir de Chapas, Meauzac',
  description:
    'Association meauzacaise de tireurs aux armes rayées et de chasse. Cinq disciplines de tir, du 10 mètres au Tir Sportif de Vitesse, au stand de Chapas à Meauzac (82).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${anton.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-page-gradient text-ink font-body">{children}</body>
    </html>
  );
}
