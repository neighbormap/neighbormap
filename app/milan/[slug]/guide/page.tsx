import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchNeighborhoodBySlug, fetchEditorial } from '@/lib/neighborhoods';
import type { ScoreCategory } from '@/types/database';

export const revalidate = 3600;

const CATEGORIES: {
  key: ScoreCategory;
  label: string;
  icon: string;
  punchlineField: string;
  textField: string;
}[] = [
  { key: 'safety', label: 'Safety', icon: '🛡️', punchlineField: 'safety_punchline', textField: 'safety_text' },
  { key: 'essentials', label: 'Essentials', icon: '🛍️', punchlineField: 'essentials_punchline', textField: 'essentials_text' },
  { key: 'transport', label: 'Transport', icon: '🚇', punchlineField: 'transport_punchline', textField: 'transport_text' },
  { key: 'nightlife', label: 'Nightlife', icon: '🌙', punchlineField: 'nightlife_punchline', textField: 'nightlife_text' },
  { key: 'value', label: 'Affordability', icon: '💶', punchlineField: 'value_punchline', textField: 'value_text' },
  { key: 'green_spaces', label: 'Green spaces', icon: '🌳', punchlineField: 'green_spaces_punchline', textField: 'green_spaces_text' },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await fetchNeighborhoodBySlug(slug);
  if (!n) return { title: 'Not found' };
  const editorial = await fetchEditorial(n.id);
  return {
    title: editorial?.title ?? `${n.name} guide`,
    description:
      editorial?.overview?.slice(0, 160) ??
      `Everything to know about ${n.name} in Milan — safety, transport, nightlife, and more.`,
    openGraph: {
      title: editorial?.title ?? `${n.name} guide`,
      description: editorial?.overview?.slice(0, 160),
      images: editorial?.thumbnail_url ? [editorial.thumbnail_url] : undefined,
      type: 'article',
    },
  };
}

export default async function NeighborhoodGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = await fetchNeighborhoodBySlug(slug);
  if (!n) notFound();

  const editorial = await fetchEditorial(n.id);

  // Unpublished: show back-link + "coming soon" placeholder
  if (!editorial) {
    return (
      <article className="max-w-2xl mx-auto px-5 py-8">
        <BackLink slug={n.slug} name={n.name} />
        <h1 className="text-3xl font-bold text-inchiostro mb-3 mt-6">
          {n.name} guide
        </h1>
        <p className="text-pietra mb-8">
          Editorial coverage for this neighborhood is in progress.
        </p>
        <div className="bg-surface rounded-2xl p-6 text-center">
          <p className="text-pietra text-sm">
            In the meantime, check out{' '}
            <Link href={`/milan/${n.slug}`} className="text-verde font-semibold hover:underline">
              reviews and scores for {n.name}
            </Link>
            .
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-5 py-8">
      <BackLink slug={n.slug} name={n.name} />

      {/* Hero thumbnail */}
      {editorial.thumbnail_url && (
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden mt-6 mb-6 bg-surface">
          <Image
            src={editorial.thumbnail_url}
            alt={editorial.title}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Zone + title */}
      <p className="text-xs text-pietra uppercase tracking-[0.12em] font-semibold mb-2">
        {n.zone} · {n.name}
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-inchiostro tracking-tight leading-tight mb-5">
        {editorial.title}
      </h1>

      {/* Overview */}
      {editorial.overview && (
        <p className="text-inchiostro/85 text-base leading-relaxed mb-8 whitespace-pre-wrap">
          {editorial.overview}
        </p>
      )}

      {/* POIs placeholder — deferred */}
      {/* TODO: POIs section — populated from editorial.pois jsonb */}

      {/* Category sections */}
      <div className="space-y-4">
        {CATEGORIES.map((c) => {
          const punchline = editorial[c.punchlineField as keyof typeof editorial] as string | null;
          const text = editorial[c.textField as keyof typeof editorial] as string | null;
          if (!text) return null;

          return (
            <section
              key={c.key}
              className="bg-surface rounded-2xl p-5 sm:p-6"
            >
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl">{c.icon}</span>
                <h2 className="font-bold text-inchiostro text-lg">{c.label}</h2>
                {punchline && (
                  <span className="text-sm text-pietra italic ml-1">
                    — {punchline}
                  </span>
                )}
              </div>
              <p className="text-inchiostro/85 text-[15px] leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            </section>
          );
        })}
      </div>

      {/* Footer meta */}
      {(editorial.author || editorial.published_at) && (
        <p className="text-xs text-pietra mt-10 pt-6 border-t border-inchiostro/[0.06]">
          {editorial.author && <>By {editorial.author}</>}
          {editorial.author && editorial.published_at && <> · </>}
          {editorial.published_at && (
            <>Published {new Date(editorial.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</>
          )}
        </p>
      )}

      {/* Back to detail */}
      <div className="mt-10">
        <Link
          href={`/milan/${n.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-verde hover:underline"
        >
          See reviews and scores for {n.name}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

function BackLink({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/milan/${slug}`}
      className="text-sm text-pietra hover:text-inchiostro transition inline-flex items-center gap-1 mb-6"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back to {name}
    </Link>
  );
}