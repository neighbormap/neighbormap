'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Neighborhood, NeighborhoodScores } from '@/types/database';
import { scoreColor } from '@/types/database';
import ForYouWaitlistSheet from './ForYouWaitlistSheet';

// Leaflet must be dynamically imported — it touches window on load
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface">
      <p className="text-sm text-pietra">Loading map…</p>
    </div>
  ),
});

export type NeighborhoodWithScores = Neighborhood & { scores: NeighborhoodScores | null };

interface MapViewProps {
  neighborhoods: NeighborhoodWithScores[];
}

export default function MapView({ neighborhoods }: MapViewProps) {
  const [forYouOpen, setForYouOpen] = useState(false);
  const [hoverNeighborhood, setHoverNeighborhood] = useState<NeighborhoodWithScores | null>(null);

  // Prepare polygons with color based on weighted overall score
  const polygons = useMemo(() => {
    return neighborhoods
      .filter((n) => n.boundary_geojson != null)
      .map((n) => ({
        ...n,
        color: scoreColor(n.scores?.overall_avg ?? null),
      }));
  }, [neighborhoods]);

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        neighborhoods={polygons}
        onHover={setHoverNeighborhood}
      />

      {/* Floating Everyone / For You toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow-md p-1 flex items-center gap-1 border border-inchiostro/[0.06]">
        <button
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-inchiostro text-white"
          disabled
        >
          Everyone
        </button>
        <button
          onClick={() => setForYouOpen(true)}
          className="px-4 py-1.5 text-xs font-semibold rounded-full text-pietra hover:text-inchiostro transition flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          For you
        </button>
      </div>

      {/* Hover tooltip card */}
      {hoverNeighborhood && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-2xl shadow-lg p-4 border border-inchiostro/[0.06] min-w-[240px] pointer-events-none">
          <p className="text-xs text-pietra mb-1">{hoverNeighborhood.zone}</p>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-inchiostro text-base">
              {hoverNeighborhood.name}
            </h3>
            {hoverNeighborhood.scores?.overall_avg != null && (
              <span
                className="text-lg font-bold"
                style={{ color: scoreColor(hoverNeighborhood.scores.overall_avg) }}
              >
                {hoverNeighborhood.scores.overall_avg.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-xs text-pietra mt-1">
            {hoverNeighborhood.scores?.review_count ?? 0} reviews
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-xl shadow-md p-3 border border-inchiostro/[0.06]">
        <p className="text-[10px] uppercase tracking-wider text-pietra font-semibold mb-2">
          Overall score
        </p>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color="#0EC48A" label="4.0+" />
          <LegendDot color="#E5A000" label="3.0–3.9" />
          <LegendDot color="#E8360E" label="<3.0" />
          <LegendDot color="#D4CFCA" label="No data" />
        </div>
      </div>

      {forYouOpen && (
        <ForYouWaitlistSheet onClose={() => setForYouOpen(false)} />
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-pietra">{label}</span>
    </div>
  );
}