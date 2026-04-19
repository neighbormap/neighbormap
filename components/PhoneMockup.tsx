'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PhoneMockupProps {
  src: string;
  alt: string;
  variant?: 'light' | 'dark';
}

/**
 * Phone-shaped frame around a screenshot.
 * Shows a placeholder gradient if the image is missing, so the layout
 * doesn't break before /screenshot-*.png files are added.
 */
export default function PhoneMockup({ src, alt, variant = 'light' }: PhoneMockupProps) {
  const [errored, setErrored] = useState(false);
  const frameBorder = variant === 'dark' ? 'border-white/20' : 'border-inchiostro/10';

  return (
    <div
      className={`phone-shadow relative w-[260px] md:w-[300px] aspect-[9/19] rounded-[40px] bg-inchiostro p-2 border ${frameBorder}`}
    >
      <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-surface">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-inchiostro rounded-full z-20" />

        {!errored ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 260px, 300px"
            className="object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <PlaceholderMock label={alt} />
        )}
      </div>
    </div>
  );
}

function PlaceholderMock({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-verde/20 via-surface to-verde/5">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-verde/20 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0EC48A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-xs text-pietra max-w-[160px] leading-snug">{label}</p>
      </div>
    </div>
  );
}