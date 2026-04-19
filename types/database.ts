// Minimal types for the tables/enums the web app touches.
// Not auto-generated — hand-maintained to match the schema.

export type UserReason = 'study' | 'work' | 'visiting' | 'other' | 'local';

export type ReviewDuration =
  | 'under_1m'
  | '1_to_6m'
  | 'about_1y'
  | 'over_1y'
  | 'former';

export type ScoreCategory =
  | 'safety'
  | 'transport'
  | 'value'
  | 'nightlife'
  | 'essentials'
  | 'green_spaces';

export type ReviewType = 'overall' | 'detailed';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  zone: string;
  city: string;
  centroid_lat: number;
  centroid_lng: number;
  boundary_geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

export interface NeighborhoodScores {
  neighborhood_id: string;
  neighborhood_name: string;
  neighborhood_slug: string;
  review_count: number;
  overall_avg: number | null;
  detailed_review_count: number;
  safety_avg: number | null;
  transport_avg: number | null;
  value_avg: number | null;
  nightlife_avg: number | null;
  essentials_avg: number | null;
  green_spaces_avg: number | null;
}

export interface Review {
  id: string;
  user_id: string | null;
  neighborhood_id: string;
  review_type: ReviewType;
  duration: ReviewDuration;
  overall_score: number;
  text_comment: string | null;
  reviewer_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewScore {
  id: string;
  review_id: string;
  category: ScoreCategory;
  value: number;
  text_comment: string | null;
}

/** Weighted overall, matching the mobile app's formula */
export function weightedOverall(scores: Partial<Record<ScoreCategory, number | null>>): number | null {
  const weights: Record<ScoreCategory, number> = {
    safety: 2.5,
    essentials: 2.0,
    transport: 1.5,
    nightlife: 1.5,
    value: 0.5,
    green_spaces: 0.5,
  };
  let totalWeight = 0;
  let totalScore = 0;
  for (const cat of Object.keys(weights) as ScoreCategory[]) {
    const val = scores[cat];
    if (val != null) {
      totalScore += val * weights[cat];
      totalWeight += weights[cat];
    }
  }
  if (totalWeight === 0) return null;
  return Math.round((totalScore / totalWeight) * 10) / 10;
}

export function scoreColor(score: number | null): string {
  if (score == null) return '#9A938A';
  if (score >= 4.0) return '#0EC48A';
  if (score >= 3.0) return '#E5A000';
  return '#E8360E';
}