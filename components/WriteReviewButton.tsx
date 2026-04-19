'use client';

import { useState } from 'react';
import ReviewSheet from './ReviewSheet';

interface WriteReviewButtonProps {
  neighborhoodId: string;
  neighborhoodName: string;
}

export default function WriteReviewButton({
  neighborhoodId,
  neighborhoodName,
}: WriteReviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-verde text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition whitespace-nowrap"
      >
        Write a review
      </button>
      {open && (
        <ReviewSheet
          neighborhoodId={neighborhoodId}
          neighborhoodName={neighborhoodName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}