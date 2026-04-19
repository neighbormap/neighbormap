import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://neighbormap.io'),
  title: {
    default: 'NeighborMap — Feel at home before you move',
    template: '%s · NeighborMap',
  },
  description:
    'Milan neighborhoods, reviewed by people like you. Students at your university, expats from your country, professionals in your field — sharing what each area is really like.',
  keywords: [
    'Milan neighborhoods',
    'where to live in Milan',
    'Milan expat guide',
    'Milan student housing',
    'best neighborhoods Milan',
    'Milano quartieri',
  ],
  openGraph: {
    title: 'NeighborMap — Feel at home before you move',
    description:
      'Milan neighborhoods, reviewed by people like you.',
    url: 'https://neighbormap.io',
    siteName: 'NeighborMap',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeighborMap — Feel at home before you move',
    description: 'Milan neighborhoods, reviewed by people like you.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}