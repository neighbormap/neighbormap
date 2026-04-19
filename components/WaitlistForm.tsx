'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'web_landing' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
        return;
      }

      setStatus(data.alreadyOnList ? 'already' : 'success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Network error');
    }
  }

  if (status === 'success' || status === 'already') {
    return (
      <div className="bg-verde/10 border border-verde/30 rounded-xl p-4 text-sm text-inchiostro">
        {status === 'success' ? (
          <>
            <strong className="text-verde">You&apos;re on the list.</strong> We&apos;ll email you when the app is ready.
          </>
        ) : (
          <>
            <strong className="text-verde">Already on the list.</strong> We&apos;ll be in touch.
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'loading'}
        className="flex-1 px-4 py-3 rounded-xl bg-white border border-inchiostro/10 text-sm text-inchiostro placeholder:text-pietra focus:outline-none focus:border-verde focus:ring-2 focus:ring-verde/20 transition disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-inchiostro text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 whitespace-nowrap"
      >
        {status === 'loading' ? 'Joining…' : 'Join waitlist'}
      </button>
      {status === 'error' && errorMsg && (
        <p className="text-sm text-coral sm:hidden">{errorMsg}</p>
      )}
      {status === 'error' && errorMsg && (
        <p className="text-sm text-coral hidden sm:block absolute mt-14">{errorMsg}</p>
      )}
    </form>
  );
}