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

/** Reviews for a neighborhood, with public profile data joined.
 *  Optional filters narrow by reviewer profile (excludes anonymous reviews when set).
 *  Calls the get_reviews_with_profile RPC — RLS-bypassed via SECURITY DEFINER,
 *  but only safe public columns are exposed. */
export async function fetchReviews(
  neighborhoodId: string,
  options: {
    limit?: number;
    offset?: number;
    filterReason?: string | null;
    filterCountryCode?: string | null;
    filterUniversityId?: string | null;
  } = {},
): Promise<ReviewWithProfile[]> {
  const { data, error } = await supabase.rpc('get_reviews_with_profile', {
    p_neighborhood_id: neighborhoodId,
    p_filter_reason: options.filterReason ?? null,
    p_filter_country_code: options.filterCountryCode ?? null,
    p_filter_university_id: options.filterUniversityId ?? null,
    p_limit: options.limit ?? 20,
    p_offset: options.offset ?? 0,
  });
  if (error) throw error;
  return (data as ReviewWithProfile[]) ?? [];
}

export interface ReviewWithProfile {
  review_id: string;
  neighborhood_id: string;
  review_type: 'overall' | 'detailed';
  overall_score: number;
  text_comment: string | null;
  duration: string;
  reviewer_name: string | null;
  created_at: string;
  // Null for anonymous reviews
  profile_reason: string | null;
  profile_country_code: string | null;
  profile_university_name: string | null;
  profile_display_name: string | null;
  profile_avatar_url: string | null;
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
      anonymous_session_id: crypto.randomUUID(),
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