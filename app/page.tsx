import Link from 'next/link';
import Image from 'next/image';
import WaitlistForm from '@/components/WaitlistForm';
import PhoneMockup from '@/components/PhoneMockup';

export default function HomePage() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: copy */}
            <div>
              <p className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-5">
                Milan · 88 neighborhoods
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-inchiostro leading-[1.05] tracking-tight mb-6">
                Feel at home
                <br />
                before you move.
              </h1>
              <p className="text-lg text-pietra mb-8 leading-relaxed max-w-lg">
                Milan neighborhoods, reviewed by the people who know them best
                — students at your university, expats from your country,
                professionals in your field.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 bg-verde text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
                >
                  Explore the map
                  <Arrow />
                </Link>
                <a
                  href="#get-the-app"
                  className="inline-flex items-center gap-2 border border-inchiostro/10 text-inchiostro px-6 py-3 rounded-xl text-sm font-semibold hover:bg-surface transition"
                >
                  Get the app
                </a>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="flex justify-center md:justify-end">
              <PhoneMockup
                src="/screenshot-1.png"
                alt="NeighborMap mobile app — map view with personalized reviews"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="bg-surface border-y border-inchiostro/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-inchiostro tracking-tight">
              Three steps to your neighborhood.
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 md:gap-4">
            {/* Connector arcs — desktop only. First dips down, second dips up */}
            <ConnectorArrow className="hidden md:block absolute top-10 left-[22%] w-[22%]" />
            <ConnectorArrow className="hidden md:block absolute top-4 left-[56%] w-[22%]" flip />

            <Step
              number="01"
              title="Explore the map"
              body="Pan across all 88 Milan neighborhoods. See scores at a glance, color-coded by how people like you rate them."
              icon={<StepMapIcon />}
            />
            <Step
              number="02"
              title="Read reviews that match"
              body="Reviews from your university, your country, or your life stage surface first — not tourist blogs."
              icon={<StepPeopleIcon />}
            />
            <Step
              number="03"
              title="Decide with confidence"
              body="Compare two neighborhoods side by side. Save favorites. Move knowing exactly what to expect."
              icon={<StepCheckIcon />}
            />
          </div>
        </div>
      </section>

      {/* ───────── Why it's different ───────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-3">
            Why it&apos;s different
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-inchiostro tracking-tight max-w-2xl mx-auto leading-tight">
            A few reviews from people like you beat hundreds of generic ones.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Feature
            icon={<PeopleIcon />}
            title="Reviews that match you"
            body="Our ranking surfaces opinions from reviewers sharing your context — not the loudest voices."
          />
          <Feature
            icon={<MapIcon />}
            title="The real Milan"
            body="All 88 official NIL neighborhoods with their actual boundaries. No arbitrary zones, no shortcuts."
          />
          <Feature
            icon={<CommunityIcon />}
            title="Built with the community"
            body="Every review comes from someone actually living, studying, or working there. No travel bloggers."
          />
        </div>
      </section>

      {/* ───────── App showcase ───────── */}
      <section className="bg-inchiostro text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-verde uppercase tracking-[0.12em] mb-3">
              The app
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
              Personalization lives in the app.
            </h2>
            <p className="text-white/60 mt-4 max-w-xl mx-auto">
              Turn on For You mode to filter every neighborhood through reviewers who share your background.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-20">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold mb-3">See what matches your situation</h3>
              <p className="text-white/70 leading-relaxed">
                Every neighborhood on the map shows scores filtered to reviewers like you. The number in the purple bubble is how many opinions actually apply to your case.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <PhoneMockup
                src="/screenshot-2.png"
                alt="NeighborMap — neighborhood detail with personalized reviews"
                variant="dark"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="flex justify-center">
              <PhoneMockup
                src="/screenshot-3.png"
                alt="NeighborMap — compare two neighborhoods side by side"
                variant="dark"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Compare two neighborhoods head-to-head</h3>
              <p className="text-white/70 leading-relaxed">
                Can&apos;t decide between Isola and Porta Romana? See them side by side — same categories, same reviewers, a clear winner per metric.
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            <a
              href="#get-the-app"
              className="inline-flex items-center gap-2 bg-verde text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Join the waitlist
              <Arrow />
            </a>
            <p className="text-xs text-white/50">iOS and Android · launching soon</p>
          </div>
        </div>
      </section>

      {/* ───────── Final CTA with blurred map bg ───────── */}
      <section
        id="get-the-app"
        className="relative overflow-hidden"
      >
        {/* Blurred map background layer */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-surface"
            aria-hidden
          />
          {/* Placeholder for a blurred map image — swap /map-preview.jpg to replace */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 blur-sm scale-110"
            style={{ backgroundImage: "url('/map-preview.jpg')" }}
            aria-hidden
          />
          {/* White fade overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" aria-hidden />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-inchiostro tracking-tight mb-5 leading-tight">
            Ready to find your Milan?
          </h2>
          <p className="text-pietra text-lg mb-10 max-w-xl mx-auto">
            Open the map and start exploring. No signup needed to browse.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-verde text-white px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition shadow-lg shadow-verde/20"
            >
              Explore the map
              <Arrow />
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold text-inchiostro mb-3">
              Get notified when the app launches
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </>
  );
}

// ───────── Sub-components ─────────

function Step({
  number,
  title,
  body,
  icon,
}: {
  number: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center text-center px-2">
      {/* Icon tile */}
      <div className="relative z-10 w-20 h-20 rounded-2xl bg-white border border-inchiostro/[0.06] shadow-sm flex items-center justify-center text-verde mb-6">
        {icon}
        <div className="absolute -top-1.5 -right-1.5 bg-verde text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
          {number}
        </div>
      </div>
      <h3 className="font-bold text-inchiostro text-lg mb-2">{title}</h3>
      <p className="text-sm text-pietra leading-relaxed max-w-xs">{body}</p>
    </div>
  );
}

function ConnectorArrow({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 40"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={flip ? 'M0 8 Q100 0 200 20' : 'M0 8 Q100 40 200 20'}
        stroke="#0EC48A"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

function StepMapIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function StepPeopleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function StepCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="p-7 rounded-2xl bg-surface/60 border border-inchiostro/[0.04]">
      <div className="w-11 h-11 rounded-xl bg-verde/10 flex items-center justify-center text-verde mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-inchiostro mb-2">{title}</h3>
      <p className="text-sm text-pietra leading-relaxed">{body}</p>
    </div>
  );
}

// ───────── Icons ─────────

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}