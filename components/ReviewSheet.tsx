'use client';

import { useMemo, useState } from 'react';
import { submitAnonymousReview, claimReview } from '@/lib/neighborhoods';
import { supabase } from '@/lib/supabase';
import type { ScoreCategory } from '@/types/database';
import { weightedOverall, scoreColor } from '@/types/database';

interface ReviewSheetProps {
  neighborhoodId: string;
  neighborhoodName: string;
  onClose: () => void;
}

type Step = 'rate' | 'account' | 'confirm-skip' | 'done';

const CATEGORIES: { key: ScoreCategory; label: string; icon: string }[] = [
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'essentials', label: 'Essentials', icon: '🛍️' },
  { key: 'transport', label: 'Transport', icon: '🚇' },
  { key: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { key: 'value', label: 'Affordability', icon: '💶' },
  { key: 'green_spaces', label: 'Green spaces', icon: '🌳' },
];

const DURATIONS = [
  { key: 'under_1m', label: 'Less than 1 month' },
  { key: '1_to_6m', label: '1–6 months' },
  { key: 'about_1y', label: 'About 1 year' },
  { key: 'over_1y', label: 'Over 1 year' },
  { key: 'former', label: 'Used to live here' },
];

export default function ReviewSheet({
  neighborhoodId,
  neighborhoodName,
  onClose,
}: ReviewSheetProps) {
  const [step, setStep] = useState<Step>('rate');

  // Form state
  const [duration, setDuration] = useState<string>('about_1y');
  const [reviewerName, setReviewerName] = useState('');
  const [categoryScores, setCategoryScores] = useState<Partial<Record<ScoreCategory, number>>>({});

  // Detailed path (per-category text + overall text)
  const [showDetailed, setShowDetailed] = useState(false);
  const [categoryTexts, setCategoryTexts] = useState<Partial<Record<ScoreCategory, string>>>({});
  const [overallText, setOverallText] = useState('');

  // Account state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Submit state
  const [submittedReviewId, setSubmittedReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed overall from weighted categories
  const overall = useMemo(() => weightedOverall(categoryScores), [categoryScores]);

  // Need at least one category scored to submit (overall is computed)
  const ratedCount = Object.keys(categoryScores).length;
  const canSubmitReview = overall != null;

  const canCreateAccount =
    email.trim() && password.length >= 8 && acceptedTerms && acceptedPrivacy && reviewerName.trim();

  async function handleSubmitReview() {
    if (!canSubmitReview) return;
    setSubmitting(true);
    setError(null);
    try {
      const catArr = (Object.keys(categoryScores) as ScoreCategory[]).map((cat) => ({
        category: cat,
        value: categoryScores[cat]!,
        text_comment: showDetailed ? categoryTexts[cat]?.trim() || null : null,
      }));

      const reviewId = await submitAnonymousReview({
        neighborhoodId,
        overallScore: overall!,
        duration,
        reviewerName: reviewerName.trim() || null,
        textComment: overallText.trim() || null,
        categoryScores: catArr,
      });

      setSubmittedReviewId(reviewId);
      setStep('account');
    } catch (e) {
      console.error(e);
      setError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateAccount() {
    if (!canCreateAccount || !submittedReviewId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: reviewerName.trim() },
        },
      });
      if (authErr) {
        setError(parseAuthError(authErr.message));
        setSubmitting(false);
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('consent_records').insert([
          {
            user_id: user.id,
            consent_type: 'terms',
            version: 'terms_v1.0',
            accepted: true,
            ip_address: 'web',
            user_agent: navigator.userAgent,
          },
          {
            user_id: user.id,
            consent_type: 'privacy',
            version: 'privacy_v1.0',
            accepted: true,
            ip_address: 'web',
            user_agent: navigator.userAgent,
          },
        ]);
      }

      await claimReview(submittedReviewId);

      // Web has no session — sign out so users log in fresh from the app
      await supabase.auth.signOut();

      setStep('done');
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Your review is saved; you can create the account later in the app.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkipAccount() {
    setStep('confirm-skip');
  }

  function handleConfirmSkip() {
    setStep('done');
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-inchiostro/50 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center sm:hidden z-10">
          <div className="w-10 h-1 bg-inchiostro/20 rounded-full" />
        </div>

        {step === 'rate' && (
          <RateStep
            neighborhoodName={neighborhoodName}
            duration={duration}
            setDuration={setDuration}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            categoryScores={categoryScores}
            setCategoryScores={setCategoryScores}
            showDetailed={showDetailed}
            setShowDetailed={setShowDetailed}
            categoryTexts={categoryTexts}
            setCategoryTexts={setCategoryTexts}
            overallText={overallText}
            setOverallText={setOverallText}
            overall={overall}
            ratedCount={ratedCount}
            canSubmit={canSubmitReview}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmitReview}
            onClose={onClose}
          />
        )}

        {step === 'account' && (
          <AccountStep
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}
            acceptedPrivacy={acceptedPrivacy}
            setAcceptedPrivacy={setAcceptedPrivacy}
            canSubmit={!!canCreateAccount}
            submitting={submitting}
            error={error}
            onSubmit={handleCreateAccount}
            onSkip={handleSkipAccount}
          />
        )}

        {step === 'confirm-skip' && (
          <ConfirmSkipStep
            onCancel={() => setStep('account')}
            onConfirm={handleConfirmSkip}
          />
        )}

        {step === 'done' && <DoneStep onClose={onClose} />}
      </div>
    </div>
  );
}

// ─────────── Step components ───────────

function RateStep(props: {
  neighborhoodName: string;
  duration: string;
  setDuration: (d: string) => void;
  reviewerName: string;
  setReviewerName: (n: string) => void;
  categoryScores: Partial<Record<ScoreCategory, number>>;
  setCategoryScores: (s: Partial<Record<ScoreCategory, number>>) => void;
  showDetailed: boolean;
  setShowDetailed: (b: boolean) => void;
  categoryTexts: Partial<Record<ScoreCategory, string>>;
  setCategoryTexts: (s: Partial<Record<ScoreCategory, string>>) => void;
  overallText: string;
  setOverallText: (s: string) => void;
  overall: number | null;
  ratedCount: number;
  canSubmit: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-inchiostro mb-1">
        Rate {props.neighborhoodName}
      </h2>
      <p className="text-sm text-pietra mb-6">
        Anonymous by default — no account needed.
      </p>

      {/* Duration */}
      <Field label="How long have you lived here?">
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => props.setDuration(d.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                props.duration === d.key
                  ? 'bg-verde text-white border-verde'
                  : 'bg-white text-inchiostro border-inchiostro/15 hover:border-verde'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Category sliders */}
      <Field label="Rate by category">
        <div className="space-y-3">
          {CATEGORIES.map((c) => {
            const score = props.categoryScores[c.key];
            const text = props.categoryTexts[c.key] ?? '';
            return (
              <div key={c.key} className="bg-surface rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-inchiostro">
                    {c.icon} {c.label}
                  </span>
                  <StarRatingSmall
                    value={score ?? null}
                    onChange={(v) =>
                      props.setCategoryScores({ ...props.categoryScores, [c.key]: v })
                    }
                  />
                </div>
                {props.showDetailed && score != null && (
                  <input
                    type="text"
                    value={text}
                    onChange={(e) =>
                      props.setCategoryTexts({ ...props.categoryTexts, [c.key]: e.target.value })
                    }
                    placeholder={`Why this score?`}
                    maxLength={200}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg bg-white border border-inchiostro/10 placeholder:text-pietra/70 focus:outline-none focus:border-verde transition"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-pietra mt-2">
          {props.ratedCount === 0
            ? 'Rate at least one category to submit.'
            : `Rated ${props.ratedCount} of ${CATEGORIES.length}. Overall score is weighted from these.`}
        </p>
      </Field>

      {/* Computed overall preview */}
      {props.overall != null && (
        <div className="flex items-center justify-between bg-verde/[0.06] border border-verde/20 rounded-xl px-4 py-3 mb-5">
          <span className="text-sm font-semibold text-inchiostro">Your overall score</span>
          <span
            className="text-2xl font-bold"
            style={{ color: scoreColor(props.overall) }}
          >
            {props.overall.toFixed(1)}
            <span className="text-sm text-pietra/60 font-semibold">/5</span>
          </span>
        </div>
      )}

      {/* Overall text — always shown */}
      <Field label="Anything you'd add overall? (optional)">
        <textarea
          value={props.overallText}
          onChange={(e) => props.setOverallText(e.target.value)}
          placeholder="What stood out — good or bad?"
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition resize-none"
        />
      </Field>

      {/* Detailed toggle — reveals per-category text inputs */}
      {!props.showDetailed ? (
        <button
          type="button"
          onClick={() => props.setShowDetailed(true)}
          className="w-full text-center text-verde text-sm font-semibold py-3 border border-dashed border-verde/40 rounded-xl hover:bg-verde/5 transition mb-5"
        >
          + Add a comment per category
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            props.setShowDetailed(false);
            props.setCategoryTexts({});
          }}
          className="w-full text-center text-pietra text-xs font-medium py-2 hover:text-inchiostro transition mb-5"
        >
          − Hide per-category comments
        </button>
      )}

      {/* Reviewer name */}
      <Field label="Display name (optional)">
        <input
          type="text"
          value={props.reviewerName}
          onChange={(e) => props.setReviewerName(e.target.value)}
          placeholder="Anonymous"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition"
        />
      </Field>

      {props.error && <p className="text-sm text-coral mb-3">{props.error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={props.onClose}
          className="flex-1 bg-white border border-inchiostro/15 text-inchiostro px-5 py-3 rounded-xl text-sm font-semibold hover:bg-surface transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={props.onSubmit}
          disabled={!props.canSubmit || props.submitting}
          className="flex-1 bg-verde text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {props.submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}

function AccountStep(props: {
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  reviewerName: string;
  setReviewerName: (s: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (b: boolean) => void;
  acceptedPrivacy: boolean;
  setAcceptedPrivacy: (b: boolean) => void;
  canSubmit: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="w-12 h-12 rounded-xl bg-verde/10 flex items-center justify-center text-verde mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-inchiostro mb-1">
        Review submitted.
      </h2>
      <p className="text-sm text-pietra mb-6">
        Create an account to save it to your profile. You&apos;ll log in from the app when it launches.
      </p>

      <Field label="Display name">
        <input
          type="text"
          value={props.reviewerName}
          onChange={(e) => props.setReviewerName(e.target.value)}
          placeholder="How you'll appear on reviews"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition"
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={props.email}
          onChange={(e) => props.setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition"
        />
      </Field>

      <Field label="Password">
        <input
          type="password"
          value={props.password}
          onChange={(e) => props.setPassword(e.target.value)}
          placeholder="Min 8 characters"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition"
        />
      </Field>

      <div className="space-y-2 mb-5">
        <Checkbox
          checked={props.acceptedTerms}
          onChange={props.setAcceptedTerms}
          label="I accept the Terms & Conditions"
        />
        <Checkbox
          checked={props.acceptedPrivacy}
          onChange={props.setAcceptedPrivacy}
          label="I accept the Privacy Policy"
        />
      </div>

      {props.error && <p className="text-sm text-coral mb-3">{props.error}</p>}

      <button
        type="button"
        onClick={props.onSubmit}
        disabled={!props.canSubmit || props.submitting}
        className="w-full bg-verde text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 mb-2"
      >
        {props.submitting ? 'Creating…' : 'Create account & save review'}
      </button>
      <button
        type="button"
        onClick={props.onSkip}
        className="w-full text-pietra px-5 py-3 text-sm hover:text-inchiostro transition"
      >
        No thanks
      </button>
    </div>
  );
}

function ConfirmSkipStep({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="p-6 sm:p-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center text-coral mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-inchiostro mb-2">Are you sure?</h2>
      <p className="text-sm text-pietra mb-6">
        Without an account, you won&apos;t be able to edit or delete this review later.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-verde text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          Go back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-white border border-inchiostro/15 text-inchiostro px-5 py-3 rounded-xl text-sm font-semibold hover:bg-surface transition"
        >
          Skip anyway
        </button>
      </div>
    </div>
  );
}

function DoneStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-verde/10 flex items-center justify-center text-verde mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-inchiostro mb-2">Thanks!</h2>
      <p className="text-sm text-pietra mb-6">
        Your review is live. Get the app to see personalized neighborhood reviews and manage your account.
      </p>
      <a
        href="#get-the-app"
        onClick={onClose}
        className="block w-full bg-inchiostro text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition mb-2"
      >
        Get the app
      </a>
      <button
        type="button"
        onClick={onClose}
        className="w-full text-pietra px-5 py-3 text-sm hover:text-inchiostro transition"
      >
        Keep exploring
      </button>
    </div>
  );
}

// ─────────── Primitives ───────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-inchiostro/70 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function StarRatingSmall({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition"
          aria-label={`Rate ${n} of 5`}
        >
          <Star filled={value != null && n <= value} size={20} />
        </button>
      ))}
    </div>
  );
}

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#0EC48A' : 'none'}
      stroke={filled ? '#0EC48A' : '#D4CFCA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-verde cursor-pointer"
      />
      <span className="text-sm text-inchiostro/85 leading-snug">{label}</span>
    </label>
  );
}

function parseAuthError(raw: string): string {
  if (raw.includes('already registered')) return 'An account with this email already exists';
  if (raw.includes('at least')) return 'Password must be at least 8 characters';
  if (raw.includes('validate email')) return 'Please enter a valid email address';
  return 'Something went wrong. Please try again.';
}