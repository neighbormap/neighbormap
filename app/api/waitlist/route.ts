import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const source = (body.source as string | undefined) ?? 'web_landing';

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    // Basic email shape check — good enough; Supabase text column is permissive
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      null;
    const userAgent = req.headers.get('user-agent') ?? null;

    const { error } = await supabase.from('waitlist_signups').insert({
      email,
      source,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      // Unique violation = already signed up — treat as success from UX side
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadyOnList: true });
      }
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Could not save' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Waitlist route error:', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}