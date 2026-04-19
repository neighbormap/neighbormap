'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Nav() {
  const [logoError, setLogoError] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-inchiostro/[0.05]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* logo.png swap — falls back to green pin while missing */}
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="NeighborMap"
              width={32}
              height={32}
              className="rounded-lg"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-verde flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          )}
          <span className="font-bold text-inchiostro text-lg tracking-tight">
            NeighborMap
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="hidden sm:inline-flex items-center text-inchiostro px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface transition"
          >
            Explore map
          </Link>
          <a
            href="/#get-the-app"
            className="inline-flex items-center bg-verde text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            Get the app
          </a>
        </div>
      </div>
    </nav>
  );
}