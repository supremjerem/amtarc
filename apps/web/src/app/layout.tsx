import type { Metadata } from 'next';
import { Archivo, Instrument_Sans, Martian_Mono } from 'next/font/google';
import './globals.css';
import { MotionProvider } from '@/components/ui/MotionProvider';

// Display face. The `wdth` axis is loaded on purpose: headings animate from a
// compressed width to their full width as they scroll in (see `Heading`).
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
});

// Utility face for measured data: dates, start times, capacities, fees, IBAN.
const martianMono = Martian_Mono({
  variable: '--font-martian-mono',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
    <html
      lang="fr"
      className={`${archivo.variable} ${instrumentSans.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page-gradient text-ink font-body">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
