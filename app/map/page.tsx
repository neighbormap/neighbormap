import { fetchAllNeighborhoods, fetchAllScores } from '@/lib/neighborhoods';
import MapView from '@/components/MapView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Milan',
  description:
    'All 88 Milan neighborhoods on one map. Click any area to see reviews from people who actually know it.',
};

// Rebuild every hour so new reviews show up without full redeploy
export const revalidate = 3600;

export default async function MapPage() {
  const [neighborhoods, scores] = await Promise.all([
    fetchAllNeighborhoods('milan'),
    fetchAllScores(),
  ]);

  // Merge scores onto neighborhoods for quick access
  const scoresById = new Map(scores.map((s) => [s.neighborhood_id, s]));
  const data = neighborhoods.map((n) => ({
    ...n,
    scores: scoresById.get(n.id) ?? null,
  }));

  return (
    <div className="relative h-[calc(100vh-57px)] w-full">
      <MapView neighborhoods={data} />
    </div>
  );
}