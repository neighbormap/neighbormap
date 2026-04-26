import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  fetchNeighborhoodBySlug,
  fetchScoresForNeighborhood,
  fetchReviews,
  fetchReviewScores,
  fetchAllNeighborhoods,
} from '@/lib/neighborhoods';
import { scoreColor, weightedOverall } from '@/types/database';
import type { ScoreCategory } from '@/types/database';
import WriteReviewButton from '@/components/WriteReviewButton';

export const revalidate = 3600;

export async function generateStaticParams() {
  const neighborhoods = await fetchAllNeighborhoods('milan');
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await fetchNeighborhoodBySlug(slug);
  if (!n) return { title: 'Not found' };
  return {
    title: `${n.name}, Milan`,
    description: `Reviews and scores for ${n.name} in Milan. See what people who live, study, and work here are really saying.`,
    openGraph: {
      title: `${n.name}, Milan — NeighborMap`,
      description: `Reviews and scores for ${n.name} in Milan.`,
      type: 'article',
    },
  };
}

const CATEGORIES: { key: ScoreCategory; label: string; icon: string }[] = [
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'transport', label: 'Transport', icon: '🚇' },
  { key: 'value', label: 'Affordability', icon: '💶' },
  { key: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { key: 'essentials', label: 'Essentials', icon: '🛍️' },
  { key: 'green_spaces', label: 'Green spaces', icon: '🌳' },
];

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const neighborhood = await fetchNeighborhoodBySlug(slug);
  if (!neighborhood) notFound();

  const [scores, reviews] = await Promise.all([
    fetchScoresForNeighborhood(neighborhood.id),
    fetchReviews(neighborhood.id, { limit: 20 }),
  ]);
  const scoresByReview = await fetchReviewScores(reviews.map((r) => r.review_id));

  // Group review scores by review id
  const scoresByReviewId = new Map<string, Map<ScoreCategory, { value: number; text: string | null }>>();
  for (const s of scoresByReview) {
    const byCat = scoresByReviewId.get(s.review_id) ?? new Map();
    byCat.set(s.category, { value: s.value, text: s.text_comment });
    scoresByReviewId.set(s.review_id, byCat);
  }

  const overall =
    scores?.overall_avg ??
    weightedOverall({
      safety: scores?.safety_avg ?? null,
      transport: scores?.transport_avg ?? null,
      value: scores?.value_avg ?? null,
      nightlife: scores?.nightlife_avg ?? null,
      essentials: scores?.essentials_avg ?? null,
      green_spaces: scores?.green_spaces_avg ?? null,
    });

  return (
    <>
      {/* Header */}
      <section className="bg-surface border-b border-inchiostro/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <nav className="text-xs text-pietra mb-4">
            <Link href="/map" className="hover:text-inchiostro transition">
              Milan
            </Link>
            <span className="mx-2">·</span>
            <span>{neighborhood.zone}</span>
          </nav>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-inchiostro tracking-tight mb-2">
                {neighborhood.name}
              </h1>
              <p className="text-pietra">
                {scores?.review_count ?? 0}{' '}
                {scores?.review_count === 1 ? 'review' : 'reviews'} from people who know it.
              </p>
            </div>
            {overall != null && (
              <div
                className="rounded-2xl px-6 py-4 text-center"
                style={{ backgroundColor: `${scoreColor(overall)}15` }}
              >
                <p className="text-xs font-semibold text-pietra uppercase tracking-wider mb-1">
                  Overall
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: scoreColor(overall) }}
                >
                  {overall.toFixed(1)}
                  <span className="text-lg text-pietra/60 font-semibold">/5</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category scores */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-4">
          Category scores
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((c) => {
            const val = scores ? (scores[`${c.key}_avg` as keyof typeof scores] as number | null) : null;
            return (
              <div
                key={c.key}
                className="bg-white border border-inchiostro/[0.06] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-sm text-inchiostro">{c.label}</span>
                </div>
                <span
                  className="text-base font-bold"
                  style={{ color: scoreColor(val) }}
                >
                  {val != null ? (
                    <>
                      {val.toFixed(1)}
                      <span className="text-xs text-pietra/60 font-semibold">/5</span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Write a review CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-6">
        <div className="bg-verde/[0.05] border border-verde/20 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-inchiostro text-lg mb-1">
              Live in {neighborhood.name}?
            </h3>
            <p className="text-sm text-pietra">
              Share your experience in 30 seconds — no account required.
            </p>
          </div>
          <WriteReviewButton neighborhoodId={neighborhood.id} neighborhoodName={neighborhood.name} />
        </div>
      </section>

      {/* Editorial link */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <Link
          href={`/milan/${neighborhood.slug}/guide`}
          className="block bg-surface hover:bg-surface/80 border border-inchiostro/[0.04] rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-inchiostro mb-1">
                Read our guide to {neighborhood.name}
              </h3>
              <p className="text-sm text-pietra">
                History, vibe, rent, who it&apos;s for.
              </p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-pietra group-hover:text-inchiostro transition"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Reviews */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-5">
          Community reviews
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-pietra mb-3">
              No reviews yet. Be the first.
            </p>
            <WriteReviewButton neighborhoodId={neighborhood.id} neighborhoodName={neighborhood.name} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r) => {
              const catScores = scoresByReviewId.get(r.review_id);
              const displayName =
                r.reviewer_name || r.profile_display_name || 'Anonymous';
              const profileTag = formatProfileTag(r);
              return (
                <div
                  key={r.review_id}
                  className="bg-white border border-inchiostro/[0.06] rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-inchiostro">
                        {displayName}
                      </p>
                      <p className="text-xs text-pietra mt-0.5">
                        {profileTag ? `${profileTag} · ` : ''}
                        {formatDuration(r.duration)}
                      </p>
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: scoreColor(r.overall_score) }}
                    >
                      {r.overall_score.toFixed(1)}
                    </span>
                  </div>
                  {r.text_comment && (
                    <p className="text-sm text-inchiostro/90 leading-relaxed mt-3">
                      {r.text_comment}
                    </p>
                  )}
                  {catScores && catScores.size > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Array.from(catScores.entries()).map(([cat, s]) => (
                        <span
                          key={cat}
                          className="text-[11px] px-2 py-1 rounded-md font-medium"
                          style={{
                            backgroundColor: `${scoreColor(s.value)}15`,
                            color: scoreColor(s.value),
                          }}
                        >
                          {CATEGORIES.find((c) => c.key === cat)?.label ?? cat} {s.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function formatDuration(d: string): string {
  switch (d) {
    case 'under_1m':
      return 'Less than 1 month';
    case '1_to_6m':
      return '1–6 months';
    case 'about_1y':
      return 'About 1 year';
    case 'over_1y':
      return 'Over 1 year';
    case 'former':
      return 'Used to live here';
    default:
      return d;
  }
}

/** Builds a short profile descriptor like "Bocconi student from Italy" or "Local from Italy".
 *  Returns null for anonymous reviews (no profile data). */
function formatProfileTag(r: {
  profile_reason: string | null;
  profile_country_code: string | null;
  profile_university_name: string | null;
}): string | null {
  if (!r.profile_reason && !r.profile_country_code && !r.profile_university_name) {
    return null;
  }

  const parts: string[] = [];

  if (r.profile_reason === 'study' && r.profile_university_name) {
    parts.push(`${r.profile_university_name} student`);
  } else if (r.profile_reason === 'work') {
    parts.push('Working in Milan');
  } else if (r.profile_reason === 'visiting') {
    parts.push('Visiting');
  } else if (r.profile_reason === 'local') {
    parts.push('Local');
  } else if (r.profile_reason === 'other') {
    parts.push('Other');
  }

  if (r.profile_country_code) {
    parts.push(`from ${r.profile_country_code}`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}