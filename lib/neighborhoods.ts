import { supabase } from './supabase';
import type {
  Neighborhood,
  NeighborhoodScores,
  Review,
  ReviewScore,
} from '@/types/database';

/** Fetch all neighborhoods in a city (default milan). Returns id, geo, naming. */
export async function fetchAllNeighborhoods(city = 'milan'): Promise<Neighborhood[]> {
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name, slug, zone, city, centroid_lat, centroid_lng, boundary_geojson')
    .eq('city', city)
    .order('name');
  if (error) throw error;
  return (data as Neighborhood[]) ?? [];
}

export async function fetchNeighborhoodBySlug(slug: string): Promise<Neighborhood | null> {
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name, slug, zone, city, centroid_lat, centroid_lng, boundary_geojson')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Neighborhood) ?? null;
}

/** Aggregate scores for all neighborhoods via the RPC that reads the materialized view */
export async function fetchAllScores(): Promise<NeighborhoodScores[]> {
  const { data, error } = await supabase.rpc('get_neighborhood_scores');
  if (error) throw error;
  return (data as NeighborhoodScores[]) ?? [];
}

export async function fetchScoresForNeighborhood(
  neighborhoodId: string,
): Promise<NeighborhoodScores | null> {
  const all = await fetchAllScores();
  return all.find((s) => s.neighborhood_id === neighborhoodId) ?? null;
}

/** Reviews for a neighborhood, most recent first */
export async function fetchReviews(
  neighborhoodId: string,
  limit = 20,
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Review[]) ?? [];
}

export async function fetchReviewScores(reviewIds: string[]): Promise<ReviewScore[]> {
  if (reviewIds.length === 0) return [];
  const { data, error } = await supabase
    .from('review_scores')
    .select('*')
    .in('review_id', reviewIds);
  if (error) throw error;
  return (data as ReviewScore[]) ?? [];
}

/** Inserts an anonymous review + its category scores.
 *  Returns the review's id so we can later claim it post-signup. */
export async function submitAnonymousReview(params: {
  neighborhoodId: string;
  overallScore: number;
  duration: string;
  reviewerName: string | null;
  textComment: string | null;
  categoryScores: Array<{ category: string; value: number; text_comment: string | null }>;
}): Promise<string> {
  const reviewType = params.categoryScores.length > 0 ? 'detailed' : 'overall';

  const { data: reviewRow, error: reviewErr } = await supabase
    .from('reviews')
    .insert({
      neighborhood_id: params.neighborhoodId,
      review_type: reviewType,
      duration: params.duration,
      overall_score: params.overallScore,
      text_comment: params.textComment,
      reviewer_name: params.reviewerName,
      user_id: null,
    })
    .select('id')
    .single();
  if (reviewErr) throw reviewErr;
  const reviewId = reviewRow.id as string;

  if (params.categoryScores.length > 0) {
    const { error: scoresErr } = await supabase.from('review_scores').insert(
      params.categoryScores.map((s) => ({
        review_id: reviewId,
        category: s.category,
        value: s.value,
        text_comment: s.text_comment,
      })),
    );
    if (scoresErr) throw scoresErr;
  }

  return reviewId;
}

/** Calls the claim_review RPC to tie an anonymous review to the current user */
export async function claimReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('claim_review', { p_review_id: reviewId });
  if (error) throw error;
}

/** Fetch the published editorial for a neighborhood, or null if none */
export async function fetchEditorial(neighborhoodId: string): Promise<Editorial | null> {
  const { data, error } = await supabase
    .from('neighborhood_editorials')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return (data as Editorial) ?? null;
}

export interface Editorial {
  id: string;
  neighborhood_id: string;
  thumbnail_url: string | null;
  title: string;
  overview: string | null;
  safety_punchline: string | null;
  safety_text: string | null;
  essentials_punchline: string | null;
  essentials_text: string | null;
  transport_punchline: string | null;
  transport_text: string | null;
  nightlife_punchline: string | null;
  nightlife_text: string | null;
  value_punchline: string | null;
  value_text: string | null;
  green_spaces_punchline: string | null;
  green_spaces_text: string | null;
  pois: unknown | null;
  author: string | null;
  published_at: string | null;
}