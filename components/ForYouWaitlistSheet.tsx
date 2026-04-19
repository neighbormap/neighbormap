'use client';

import { useState } from 'react';

interface ForYouWaitlistSheetProps {
  onClose: () => void;
}

export default function ForYouWaitlistSheet({ onClose }: ForYouWaitlistSheetProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setMsg(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'map_foryou' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMsg(data.error || 'Something went wrong');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setMsg('Network error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-inchiostro/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center sm:hidden mb-4">
          <div className="w-10 h-1 bg-inchiostro/20 rounded-full" />
        </div>

        <div className="w-12 h-12 rounded-xl bg-for-you/10 flex items-center justify-center text-for-you mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-inchiostro mb-2 leading-tight">
          See your Milan
        </h2>
        <p className="text-sm text-pietra leading-relaxed mb-6">
          For You filters every neighborhood through reviewers who share your university, country, or life stage. It lives in the app — join the waitlist and we&apos;ll let you know when it launches.
        </p>

        {status === 'done' ? (
          <div className="bg-verde/10 border border-verde/30 rounded-xl p-4 text-sm">
            <strong className="text-verde">You&apos;re on the list.</strong> We&apos;ll email you at launch.
            <button
              onClick={onClose}
              className="block w-full mt-4 bg-inchiostro text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90"
            >
              Keep exploring
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-for-you focus:ring-2 focus:ring-for-you/20 transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-for-you text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
            </button>
            {msg && <p className="text-sm text-coral">{msg}</p>}
            <button
              type="button"
              onClick={onClose}
              className="w-full text-pietra py-2 text-sm hover:text-inchiostro transition"
            >
              Not now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}