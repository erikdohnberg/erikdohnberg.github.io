// components.jsx

// ── Constants ───────────────────────────────────────────────────────────────
const REDUCED_MOTION = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FADE_MS = 360;

// ── HandwrittenReveal ───────────────────────────────────────────────────────
// Static stub: renders children immediately, fires onComplete so Hero stage-gates advance
const HandwrittenReveal = ({ children, onComplete }) => {
  const called = React.useRef(false);
  React.useLayoutEffect(() => {
    if (!called.current) { called.current = true; onComplete?.(); }
  }, []);
  return <>{children}</>;
};

// ── IteratedTitle ───────────────────────────────────────────────────────────
// Static: renders the final title directly in Sanchez via section-header class
const IteratedTitle = ({ final, dark = false }) => (
  <div style={{ marginBottom: '28px' }}>
    <h2 className={dark ? 'section-header section-header-dark' : 'section-header'}
      style={{ display: 'inline-block', marginBottom: 0 }}>{final}</h2>
  </div>
);

// ── Annotation / SideNotedSpan ───────────────────────────────────────────────
// Static stubs: render children only, all SVG scribbles and margin notes dropped
const SideNotedSpan = ({ children }) => <>{children}</>;
const Annotation = ({ children }) => <>{children}</>;

// ── FadeSection ─────────────────────────────────────────────────────────────
const EASE_OUT_STRONG = 'cubic-bezier(0.23, 1, 0.32, 1)';
const FadeSection = ({ children, className, style, id, 'data-dark-section': dataDark }) => {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: .1 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, []);
  // Respect prefers-reduced-motion: skip translateY, shorten duration
  const motion = REDUCED_MOTION
    ? { opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease-out' }
    : { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.5s ${EASE_OUT_STRONG}, transform 0.5s ${EASE_OUT_STRONG}` };
  return (
    <section ref={ref} id={id} className={className} data-dark-section={dataDark}
      style={{ ...style, ...motion }}>
      {children}
    </section>
  );
};

// ── TrenchcoatWord ───────────────────────────────────────────────────────────
const TrenchcoatWord = () => <>trenchcoat</>;

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const [stage, setStage] = React.useState(0);

  return (
    <header style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10vw', position: 'relative' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>

        {/* "Hi, I'm" */}
        <div style={{ marginBottom: '8px', minHeight: '36px' }}>
          <HandwrittenReveal text="Hi, I'm" fontSize={22} strokeColor="#333333"
            stagger={40} glyphDuration={200} trigger="load" startDelay={400}
            onComplete={() => setStage(1)}>
            <span style={{ fontFamily: "'Sanchez', serif", fontSize: '22px' }}>Hi, I'm</span>
          </HandwrittenReveal>
        </div>

        {/* "Erik Dohnberg." */}
        <h1 style={{ fontSize: '0', lineHeight: 1.1, marginBottom: '20px' }}>
          {/* Erik */}
          <span style={{ display: 'inline-block', minHeight: `clamp(58px, 9vw, 90px)`, position: 'relative', verticalAlign: 'baseline' }}>
            {stage >= 1 && (
              <HandwrittenReveal onComplete={() => setStage(2)}>
                <span style={{ fontFamily: "'Sanchez', serif", fontSize: `clamp(52px, 8vw, 80px)`, color: '#ff9900', letterSpacing: '-0.01em', lineHeight: 1, marginRight: '0.22em' }}>Erik</span>
              </HandwrittenReveal>
            )}
          </span>

          {/* Dohnberg. */}
          <span style={{ display: 'inline-block', minHeight: `clamp(58px, 9vw, 90px)`, position: 'relative', verticalAlign: 'baseline' }}>
            {stage >= 2 && (
              <HandwrittenReveal onComplete={() => setStage(3)}>
                <span style={{ fontFamily: "'Sanchez', serif", fontSize: `clamp(52px, 8vw, 80px)`, letterSpacing: '-0.01em', lineHeight: 1 }}>Dohnberg.</span>
              </HandwrittenReveal>
            )}
          </span>
        </h1>

        {/* Role */}
        {stage >= 3 && (
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '28px', marginTop: '4px' }}>
            Senior Product Leader · Toronto
          </p>
        )}

        {/* Tagline */}
        <div style={{ position: 'relative', maxWidth: '600px', minHeight: '90px' }}>
          {stage >= 3 && (
            <div>
              <div style={{ lineHeight: 1.6, position: 'relative', display: 'inline-block' }}>
                <HandwrittenReveal onComplete={() => setStage(4)}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: 'clamp(16px, 4.5vw, 20px)', lineHeight: 1.6 }}>
                    Every industry thinks its problems are unique.
                  </span>
                </HandwrittenReveal>
              </div>
              {stage >= 4 && (
                <div style={{ lineHeight: 1.6, marginTop: '4px' }}>
                  <HandwrittenReveal text="They're mostly the same problems in a trenchcoat."
                    fontSize={20} strokeColor="#333333" stagger={28} glyphDuration={180}
                    trigger="load" startDelay={200} onComplete={() => setStage(5)}>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: 'clamp(16px, 4.5vw, 20px)', lineHeight: 1.6 }}>
                      They're mostly{' '}
                      <Annotation type="double-underline" text="" seed={5}>the same problems</Annotation>
                      {' '}in a <TrenchcoatWord />.
                    </span>
                  </HandwrittenReveal>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div style={{
          display: 'flex', gap: '20px', marginTop: '40px',
          opacity: stage >= 5 ? 1 : 0,
          transform: stage >= 5 ? 'translateY(0)' : 'translateY(8px)',
          transition: `opacity 0.6s ${EASE_OUT_STRONG} 0.3s, transform 0.6s ${EASE_OUT_STRONG} 0.3s`,
        }}>
          <a href="https://www.linkedin.com/in/erik-dohnberg/" target="_blank" rel="noopener" className="hero-link">LinkedIn ↗</a>
          <a href="https://substack.com/@heyerikd" target="_blank" rel="noopener" className="hero-link">Substack ↗</a>
          <a href="https://github.com/erikdohnberg" target="_blank" rel="noopener" className="hero-link">GitHub ↗</a>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        opacity: stage >= 5 ? 0.4 : 0, transition: 'opacity 0.8s ease 0.8s',
        fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#333',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <span>scroll</span>
        <span style={{ animation: 'bounceDown 1.6s ease-in-out infinite' }}>↓</span>
      </div>
    </header>
  );
};

// ── FloatingUI ───────────────────────────────────────────────────────────────
const FloatingUI = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [overDark, setOverDark] = React.useState(false);
  React.useEffect(() => {
    const h = () => {
      setShowScrollTop(window.scrollY > window.innerHeight * .8);
      const ds = document.querySelectorAll('[data-dark-section]'), by = window.innerHeight - 60;
      let d = false; ds.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < by && r.bottom > by) d = true; }); setOverDark(d);
    };
    window.addEventListener('scroll', h, { passive: true }); h(); return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top" className="floating-icon scroll-top-btn"
      style={{ position: 'fixed', bottom: '28px', right: '28px', width: '40px', height: '40px', border: 'none',
        background: overDark ? 'rgba(31,29,27,.85)' : 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '50%', cursor: 'pointer', color: overDark ? '#f5f0e8' : '#333', boxShadow: '0 2px 12px rgba(20,14,5,.14)',
        opacity: showScrollTop ? 1 : 0, pointerEvents: showScrollTop ? 'auto' : 'none',
        transition: 'opacity .3s,color .3s,background .3s', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

// ── TopBar ────────────────────────────────────────────────────────────────────
const TopBar = () => {
  const [show, setShow] = React.useState(false);
  const [overDark, setOverDark] = React.useState(false);
  React.useEffect(() => {
    const h = () => {
      setShow(window.scrollY > window.innerHeight * .6);
      const ds = document.querySelectorAll('[data-dark-section]'); let d = false;
      ds.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < 60 && r.bottom > 0) d = true; }); setOverDark(d);
    };
    window.addEventListener('scroll', h, { passive: true }); h(); return () => window.removeEventListener('scroll', h);
  }, []);
  const tc = overDark ? '#f5f0e8' : '#333';
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
      background: overDark ? 'rgba(31,29,27,.82)' : 'rgba(250,246,239,.82)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${overDark ? 'rgba(245,240,232,.08)' : 'rgba(51,51,51,.08)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50,
      opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'opacity .3s,transform .3s,background .3s,border-color .3s',
      pointerEvents: show ? 'auto' : 'none' }}>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'baseline', gap: '6px', color: tc, fontFamily: "'Raleway',sans-serif", transition: 'color .3s' }}
        aria-label="Scroll to top">
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: '14px', fontWeight: 500, letterSpacing: '.02em' }}>Hi, I'm</span>
        <span style={{ fontFamily: "'Sanchez',serif", fontSize: '17px', fontWeight: 600 }}>
          <span style={{ color: '#ff9900' }}>Erik</span>{' '}<span>Dohnberg.</span>
        </span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <a href="https://www.linkedin.com/in/erik-dohnberg/" target="_blank" rel="noopener" aria-label="LinkedIn" className="topbar-icon" style={{ color: tc }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a href="https://substack.com/@heyerikd" target="_blank" rel="noopener" aria-label="Substack" className="topbar-icon" style={{ color: tc }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
          </svg>
        </a>
        <a href="mailto:erikdohnberg@gmail.com" aria-label="Email" className="topbar-icon" style={{ color: tc }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" />
          </svg>
        </a>
      </div>
    </div>
  );
};

// ── About ─────────────────────────────────────────────────────────────────────
const About = () => (
  <FadeSection id="about" className="section section-paper" style={{ padding: '120px 32px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="section-header" style={{ marginBottom: '28px' }}>About</h2>
      <p className="body-text" style={{ marginBottom: '24px' }}>
        I'm a Senior Product Leader based in Toronto. I've shipped products in multiple industries including social media, healthcare, heavily regulated supply-chain software, food operations software, and D2C retail. The contexts look different, but <strong>the actual problems — user adoption, competitor pressure, regulatory fog, constant prioritization under uncertainty — show up time and time again.</strong> Once you've seen the pattern enough times, you can focus on the craft of good product strategy and delivery.
      </p>
      <p className="body-text" style={{ marginBottom: '24px' }}>
        I've been building AI-powered products since 2023 — ML-curated content feeds at 500px, LLM-integrated decision tools, and ML Forecasting Models for enterprise food operators. I'm <strong>outcome-driven, not output-driven.</strong> Code is cheaper than ever. <em>What you choose to build is the whole game.</em> I do my best work on small teams with clear ownership, leadership that's still close to the work, and a bias toward shipping.
      </p>
      <p className="body-text">
        The point isn't just shipping. It's <strong>making someone's day less painful</strong> — for the user, and for the team building it.
      </p>
    </div>
  </FadeSection>
);

// ── Writing ───────────────────────────────────────────────────────────────────
const Writing = () => {
  const [subEmail, setSubEmail] = React.useState('');
  const [subStatus, setSubStatus] = React.useState('idle'); // idle | submitting | done

  const handleSubscribe = e => {
    e.preventDefault();
    if (!subEmail || subStatus === 'submitting') return;
    setSubStatus('submitting');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://heyerikd.substack.com/api/v1/free';
    form.target = '_blank';
    form.style.display = 'none';
    const field = document.createElement('input');
    field.name = 'email'; field.value = subEmail;
    form.appendChild(field);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setSubStatus('done');
  };

  return (
  <FadeSection id="writing" className="section section-dark" data-dark-section="true" style={{ padding: '120px 32px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto' }} data-dark-section="true">
      <IteratedTitle draft="Writing" final="Things I think about" dark={true} />
      <p className="body-text body-text-dark" style={{ marginBottom: '32px', marginTop: '8px' }}>
        Most of what I know I learned from other people in the tech scene. This is me trying to pay it forward. Notes on product, AI, leadership, and the parts of the work that don't fit neatly into a roadmap. New posts land on Substack.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          {
            title: "AI Made Your Junior Team Faster. It Also Made Your Job Harder.",
            desc: "The work didn't disappear. It just moved upstairs.",
            href: "https://substack.com/@heyerikd/note/p-198350792"
          },
          {
            title: "Turning your org's strategic drift into product leverage",
            desc: "The best PM moves don't look heroic. They look like timing."
          },
          {
            title: "The whiteboard remembers what transcripts don't",
            desc: "AI gives you retrieval infrastructure. Whiteboarding gives you encoded memory. They are not substitutes."
          },
        ].map((card, i) => {
          const inner = (
            <>
              {card.href ? (
                <span style={{
                  position: 'absolute', top: '12px', right: '14px',
                  fontFamily: "'Caveat', cursive", fontSize: '14px', color: '#ff9900', lineHeight: 1
                }}>Read ↗</span>
              ) : (
                <span style={{
                  position: 'absolute', top: '12px', right: '14px',
                  fontFamily: "'Caveat', cursive", fontSize: '14px', color: '#ff9900', lineHeight: 1
                }}>coming soon</span>
              )}
              <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '18px', color: '#f5f0e8', margin: '0 0 6px', paddingRight: '80px' }}>{card.title}</h3>
              <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#9a958d', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
            </>
          );
          return card.href ? (
            <a key={i} href={card.href} target="_blank" rel="noopener"
              className="writing-card writing-card-dark" style={{ position: 'relative', display: 'block', textDecoration: 'none', cursor: 'pointer' }}>
              {inner}
            </a>
          ) : (
            <div key={i} className="writing-card writing-card-dark" style={{ position: 'relative' }}>
              {inner}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '32px', borderTop: '1px solid rgba(245,240,232,.12)', paddingTop: '28px' }}>
        {subStatus === 'done' ? (
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: '22px', color: '#ff9900', margin: 0 }}>
            check your inbox ✓
          </p>
        ) : (
          <>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#9a958d', marginBottom: '14px', marginTop: 0, lineHeight: 1.5 }}>
              No digests, no roundups. New posts straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="email" required placeholder="your@email.com" value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                style={{ flex: '1 1 200px', fontFamily: "'Raleway', sans-serif", fontSize: '15px',
                  padding: '11px 14px', border: '1px solid rgba(245,240,232,.2)', borderRadius: '4px',
                  background: 'transparent', color: '#f5f0e8', outline: 'none', minWidth: '0',
                  boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#ff9900'}
                onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,.2)'} />
              <button type="submit" className="substack-btn"
                style={{ opacity: subStatus === 'submitting' ? 0.7 : 1, flexShrink: 0 }}>
                {subStatus === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  </FadeSection>
  );
};

// ── Side Projects ─────────────────────────────────────────────────────────────
const SideProjects = () => (
  <FadeSection id="projects" className="section section-paper" style={{ padding: '120px 32px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="section-header" style={{ marginBottom: '28px' }}>Side Projects</h2>
      <p className="body-text" style={{ marginBottom: '40px' }}>
        Staying on the cutting edge isn't a posture — it's a habit. The fastest way I've found to actually understand a new tool or model is to build something with it. These are the things I'm tinkering on in my (admittedly limited) spare time, mostly to learn.
      </p>
      <div className="project-card">
        <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '26px', color: '#333', margin: '0 0 4px' }}>Helm</h3>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>Keep strategy on course.</p>
        <p className="body-text" style={{ marginBottom: '20px' }}>
          A work-in-progress experiment: an AI layer that connects to the tools a team already uses — meetings, Slack, planning docs — through their existing authentication and permissions, with their choice of AI model (Claude, ChatGPT, or others). It distills those conversations into a clear, structured record of what the team is trying to achieve and why. No new data silo, no vendor lock-in. When day-to-day decisions start drifting from that intent, Helm flags it.
        </p>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', margin: '0 0 20px' }}>Early prototype, source-available. Nights-and-weekends pace.</p>
        <a href="https://github.com/erikdohnberg/helm" target="_blank" rel="noopener" className="inline-link">→ github.com/erikdohnberg/helm</a>
      </div>
    </div>
  </FadeSection>
);

// ── ProjectScreenshot ─────────────────────────────────────────────────────────
// TODO: Add real screenshots for each project in PROUD_WORK_PROJECTS.
// Replace the placeholder container in ProudWork with:
//   <img src="images/<project>.png" alt="<project title> screenshot"
//        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
// Recommended capture: 1440×1080px (4:3), saved to /images/

// ── Proud Work ────────────────────────────────────────────────────────────────
const PROUD_WORK_PROJECTS = [
  {
    title: '500px\'s AI-Personalized Content Feeds',
    tagline: 'The platform\'s largest content discovery overhaul in years — shipped to a global community of 15M+ creators.',
    body: (
      <>
        500px's first AI-personalized feed — replacing legacy Popular and Fresh streams with a unified "For You" experience that mixed recommended photos, photo stories, photographers, and AI-curated{' '}
        <Annotation type="arrow" text="focus on photographers" seed={9}>Mood Galleries</Annotation>
        {'. '}Shipped to 15M+ creators across 195 countries. The Mood Galleries feature was designed to take manual curation off the content team's plate so they could spend their time supporting photographers and growing the community instead.
      </>
    ),
    role: '— Senior PM at 500px, 2023.',
    link: { href: 'https://500px.com/explore', label: '→ 500px.com' },
  },
  {
    title: 'ABB Optical\'s Optometrist-First Lens-Ordering Platform',
    tagline: 'A direct-to-consumer contact lens platform that gave optometrists a stake in the purchases their patients were already making elsewhere.',
    body: (
      <>
        The only PM on the project. Built as a 1-800-Contacts competitor, but with{' '}
        <Annotation type="underline" text="the actual point" seed={4}>the optometrist back in the loop</Annotation>
        {' '}— better margins for doctors, better continuity of care for patients, lower friction than the incumbents. ABB, the buying group behind Hello Abby, represents 23,000+ independent eye care professionals and 700M+ lens purchases annually. Published results: 3× lift in direct-to-patient sales, 300% over initial revenue target during MVP launch.
        <br /><br />
        🏆 MarCom Gold Award — Medical Website Category, 2023
      </>
    ),
    role: '— PM at Bounteous, 2022–2023.',
    link: { href: 'https://helloabby.com', label: '→ helloabby.com' },
  },
  {
    title: 'HomeVisit\'s Pivot to Virtual Property Marketing',
    tagline: 'Real estate visual marketing platform — photography, video, 3D tours, and single property websites.',
    body: (
      <>
        Navigated a mid-roadmap pivot when in-person showings collapsed at the start of the pandemic — shipped configurable per-agent single property websites as demand for virtual property content spiked. The work shipped through the most active US housing cycle since 2006.
      </>
    ),
    role: '— PM at Intersect / CoreLogic, 2019–2022.',
    link: { href: 'https://homevisit.com', label: '→ homevisit.com' },
  },
  {
    title: 'Establishing a Product Practice for the New Cannabis Industry',
    tagline: 'Seed-to-sale compliance platform for 70%+ of Canada\'s licensed producers — built during the legalization of recreational cannabis.',
    body: (
      <>
        The first PM hired at Ample — joined when the company was 25 people and helped grow the product discipline to 6 PMs as headcount scaled past 120. The work happened during the formative years of legal recreational cannabis in Canada: the market grew from $1.19B in 2019 to $3.92B by 2021 (Statistics Canada), and Ample was the primary compliance platform for 70%+ of the country's licensed producers throughout.
      </>
    ),
    role: '— PM at Ample Organics, 2017–2019.',
    link: { href: 'https://ampleorganics.com', label: '→ ampleorganics.com' },
  },
];

const ProudWork = () => {
  const [idx, setIdx] = React.useState(0);
  const total = PROUD_WORK_PROJECTS.length;
  const project = PROUD_WORK_PROJECTS[idx];
  return (
    <FadeSection id="proud" className="section section-light" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <IteratedTitle draft="Selected Work" final="Some work I'm proud of" />
        <p className="body-text" style={{ marginBottom: '48px', marginTop: '8px', maxWidth: '640px' }}>
          Four industries. Real products that shipped, with real teams.
        </p>
        {/* TODO: Restore two-column grid (screenshot + text) once real screenshots are added.
             Add: <div style={{ aspectRatio:'4/3', borderRadius:'6px', overflow:'hidden', boxShadow:'0 18px 40px rgba(20,14,5,0.12)' }}>
                    <img src="images/<project>.png" alt="..." style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div> */}
        <div key={idx + '-txt'} style={{ maxWidth: '640px', animation: 'txtIn 0.5s ease' }}>
          <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '28px', color: '#333', margin: '0 0 6px' }}>{project.title}</h3>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#999', fontStyle: 'italic', margin: '0 0 22px' }}>{project.tagline}</p>
          <p className="body-text" style={{ marginBottom: '20px' }}>{project.body}</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', margin: '0 0 16px', fontStyle: 'italic' }}>{project.role}</p>
          {project.link && <a href={project.link.href} target="_blank" rel="noopener" className="inline-link">{project.link.label}</a>}
        </div>
        {/* Carousel nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '56px' }}>
          <button onClick={() => setIdx(i => (i - 1 + total) % total)} className="carousel-btn" aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', minWidth: '40px', textAlign: 'center' }}>
            {idx + 1}/{total}
          </span>
          <button onClick={() => setIdx(i => (i + 1) % total)} className="carousel-btn" aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', textAlign: 'center', marginTop: '28px' }}>
          <a href="https://www.linkedin.com/in/erik-dohnberg/" target="_blank" rel="noopener" className="inline-link">Full timeline on LinkedIn ↗</a>
        </p>
      </div>
    </FadeSection>
  );
};

// ── Testimonials data ─────────────────────────────────────────────────────────
// Verbatim excerpts from real LinkedIn recommendations. Do NOT edit the quote,
// name, role, or relationship strings — punctuation, ellipses (…), em dashes (—)
// and apostrophes (’) are intentional and must render character-for-character.
const TESTIMONIALS = [
  { id: "laba", tag: "ai",
    quote: "Erik was a huge boon to the team in our transformation to an AI focus and helped all of us level up… Something that I appreciate about Erik’s work was how he established supporting docs, and sustainable approaches that allowed others to build off the work he led.",
    name: "Jonathan Laba", role: "Senior Product Manager, Compass Digital", relationship: "peer" },
  { id: "manson", tag: "ai",
    quote: "While at 500px he delivered a complex content feed experience working with the AI teams, development, and design to launch a personalized feed of posts and photos to millions of 500px users.",
    name: "James Manson", role: "VP of Products, 500px", relationship: "Erik’s direct manager" },
  { id: "sluchevsky", tag: "ai",
    quote: "Erik had a knack for spotting problem spaces where data and AI could make a real difference.",
    name: "Ally Sluchevsky", role: "Senior Director of Product Management, Compass Digital", relationship: "Erik’s manager, Data & AI team" },
  { id: "herzallah", tag: "leadership",
    quote: "Erik stands out as one of the most remarkable managers I’ve had the privilege to work under… He consistently proved himself as the go-to problem solver when the team faced ambiguity, changing priorities, or tight deadlines.",
    name: "Anas Herzallah", role: "Associate Product Manager, Bounteous", relationship: "Erik’s direct report" },
  { id: "mcloughlin", tag: "leadership",
    quote: "I cannot more highly recommend Erik than to say, if I were starting a company tomorrow, I’d be trying to figure out how to hire him today.",
    name: "Kevin McLoughlin", role: "now Chief Product Officer, Dr.Bill", relationship: "met Erik as a Bitmaker student" },
  { id: "stpierre", tag: "leadership",
    quote: "He was our first full time product manager and has worked to help build out the team and establish best practices for building products at Ample.",
    name: "Rigel St Pierre", role: "engineering colleague, Ample Organics", relationship: "now Head of Engineering, Rootly" },
  { id: "badger", tag: "craft",
    quote: "His communication-first mindset to product management ensures that the right opinions are heard up front. Combine that with his focus on ruthlessly defining problems before solving them and you are set up for success.",
    name: "Will Badger", role: "Product Manager, Ample Organics", relationship: "peer" },
  { id: "wiland", tag: "craft",
    quote: "Erik is an incredible master at scoping requirements and specifications… His ability to express intricate technical details into fully scalable enterprise solutions has provided extreme value at Ample Organics.",
    name: "Mike Wiland", role: "infrastructure engineer, Ample Organics", relationship: "engineering colleague" },
  { id: "laws", tag: "craft",
    quote: "He has a remarkable ability to keep team members motivated and positive while challenging assumptions, defining requirements, and adapting to business needs. He is able to navigate complex relationships, both internally and externally, and can sling a pitch deck better than I’ve ever seen.",
    name: "Martin Laws", role: "Founder, Low Tide Consulting", relationship: "colleague" },
  { id: "lee", tag: "collaboration",
    quote: "He never assumed he had the answers up front — he made real room for user insights to shape our direction, and he trusted me as a designer to explore the solution space fully before converging.",
    name: "Joshua Lee", role: "Lead Product Designer, Compass Digital", relationship: "design partner" },
  { id: "antaya", tag: "collaboration",
    quote: "His coaching experience and positive attitude were an asset to the team… His strengths include keeping the team organized, motivated, and focused on tangible project milestones.",
    name: "Matt Antaya", role: "colleague, Nascent Digital", relationship: "now Senior Engineering Manager, Discord" },
  { id: "minhajuddin", tag: "collaboration",
    quote: "He really understands the priorities of the product and makes sure that the team is spending resources on the most important tasks at any point. He has great leadership qualities and can rally the whole team behind a common cause.",
    name: "Khaja Minhajuddin", role: "engineer, Ample Organics", relationship: "now Staff Software Engineer, Instacart" },
];

// Fisher–Yates shuffle (non-mutating)
const shuffleTestimonials = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};

// Order the pool so no two neighbours share a tag. The constraint is circular:
// the rotation loops and shows a sliding 2-up window, so the wrap-around pair
// (last, first) is visible too and must also differ. With 4 tags × 3 quotes a
// valid circular arrangement always exists.
const orderNoAdjacentTag = (items) => {
  const circularOk = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].tag === arr[(i + 1) % arr.length].tag) return false;
    }
    return true;
  };
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = shuffleTestimonials(items);
    if (circularOk(candidate)) return candidate;
  }
  // Greedy fallback: always place the tag with the most remaining quotes that
  // differs from the previously placed one.
  const pool = shuffleTestimonials(items);
  const result = [];
  while (pool.length) {
    const counts = {};
    pool.forEach((x) => { counts[x.tag] = (counts[x.tag] || 0) + 1; });
    const lastTag = result.length ? result[result.length - 1].tag : null;
    let pick = -1, best = -1;
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].tag === lastTag) continue;
      if (counts[pool[i].tag] > best) { best = counts[pool[i].tag]; pick = i; }
    }
    if (pick === -1) pick = 0;
    result.push(pool.splice(pick, 1)[0]);
  }
  return result;
};

const TESTIMONIAL_GAP = 32;      // px, gutter between the two desktop cards
const TESTIMONIAL_ADVANCE = 7000; // ms between auto-advances
const TESTIMONIAL_FADE = 600;     // ms crossfade duration

const TestimonialCard = ({ item, minH }) => (
  <blockquote style={{
    margin: 0, padding: '0 0 0 28px', borderLeft: '3px solid #ff9900',
    minHeight: minH ? minH + 'px' : undefined,
    display: 'flex', flexDirection: 'column',
  }}>
    <p style={{
      fontFamily: "'Raleway', sans-serif", fontSize: '18px', color: '#f5f0e8',
      lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 14px', fontWeight: 300,
      flexGrow: 1,
    }}>
      {item.quote}
    </p>
    <footer style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#9a958d' }}>
      — {item.name}, {item.role}, {item.relationship}
    </footer>
  </blockquote>
);

// ── Testimonials (rotating) ───────────────────────────────────────────────────
const Testimonials = () => {
  const order = React.useMemo(() => orderNoAdjacentTag(TESTIMONIALS), []);
  const N = order.length;

  const getPerView = () =>
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) ? 1 : 2;

  const [perView, setPerView] = React.useState(getPerView);
  const [containerW, setContainerW] = React.useState(0);
  const [minH, setMinH] = React.useState(0);
  const [frame, setFrame] = React.useState({ a: 0, b: 0, active: 'a' });
  const [paused, setPaused] = React.useState(false);

  const gridRef = React.useRef(null);
  const measureRef = React.useRef(null);

  // Track available width + how many cards fit
  React.useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => { setContainerW(el.clientWidth); setPerView(getPerView()); };
    update();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    window.addEventListener('resize', update);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const cardW = perView > 1
    ? Math.max(0, (containerW - TESTIMONIAL_GAP * (perView - 1)) / perView)
    : containerW;

  // Measure the tallest card at the current card width so height is fixed and
  // transitions never cause layout shift.
  React.useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || !cardW) return;
    let max = 0;
    for (const child of el.children) max = Math.max(max, child.offsetHeight);
    if (max && Math.abs(max - minH) > 1) setMinH(max);
  }, [cardW, perView, N]);

  // Re-measure once web fonts have loaded (font swap changes wrapping/height)
  React.useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts || !document.fonts.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const el = measureRef.current;
      if (!el || !cardW) return;
      let max = 0;
      for (const child of el.children) max = Math.max(max, child.offsetHeight);
      if (max && Math.abs(max - minH) > 1) setMinH(max);
    });
    return () => { cancelled = true; };
  }, [cardW]);

  const go = React.useCallback((dir) => {
    setFrame((prev) => {
      const cur = prev.active === 'a' ? prev.a : prev.b;
      const next = ((cur + dir) % N + N) % N;
      return prev.active === 'a'
        ? { a: prev.a, b: next, active: 'b' }
        : { a: next, b: prev.b, active: 'a' };
    });
  }, [N]);

  // Auto-advance — disabled under reduced motion or while paused
  React.useEffect(() => {
    if (REDUCED_MOTION || paused) return;
    const t = setInterval(() => go(1), TESTIMONIAL_ADVANCE);
    return () => clearInterval(t);
  }, [paused, go]);

  const measured = minH > 0;

  const Row = ({ startPos }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))`,
      gap: TESTIMONIAL_GAP + 'px',
      alignItems: 'stretch',
    }}>
      {Array.from({ length: perView }).map((_, i) => {
        const item = order[(startPos + i) % N];
        return <TestimonialCard key={item.id} item={item} minH={minH} />;
      })}
    </div>
  );

  const layerStyle = (name) => {
    if (!measured) {
      // Pre-measurement: render only the active layer in normal flow so the
      // container has a real height (no collapse, no overflow flash).
      return name === frame.active ? {} : { display: 'none' };
    }
    const isActive = name === frame.active;
    return {
      position: 'absolute', top: 0, left: 0, right: 0,
      opacity: isActive ? 1 : 0,
      transition: REDUCED_MOTION ? 'none' : `opacity ${TESTIMONIAL_FADE}ms ease`,
      pointerEvents: isActive ? 'auto' : 'none',
    };
  };

  return (
    <FadeSection id="testimonials" className="section section-dark" data-dark-section="true" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="section-header section-header-dark">What it's like working with me</h2>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          style={{ marginTop: '32px' }}
        >
          {/* Crossfading window of quote cards */}
          <div
            ref={gridRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Testimonials"
            style={{ position: 'relative', height: measured ? minH + 'px' : 'auto' }}
          >
            <div style={layerStyle('a')}><Row startPos={frame.a} /></div>
            <div style={layerStyle('b')}><Row startPos={frame.b} /></div>
          </div>

          {/* Prev / next controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '40px' }}>
            <button onClick={() => go(-1)} className="carousel-btn-dark" aria-label="Previous testimonials">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={() => go(1)} className="carousel-btn-dark" aria-label="Next testimonials">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        {/* Off-screen measurer: every quote rendered at the live card width so we
            can fix the card height to the tallest and avoid layout shift. */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, left: '-99999px', width: cardW ? cardW + 'px' : '440px', visibility: 'hidden', pointerEvents: 'none' }}
        >
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} minH={0} />
          ))}
        </div>
      </div>
    </FadeSection>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: .3 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, []);
  return (
    <footer ref={ref} className="section section-light"
      style={{ padding: '100px 10vw 80px', textAlign: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity .8s,transform .8s' }}>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(20px, 5vw, 26px)', color: '#333', marginBottom: '28px' }}>
        Made in Toronto 🇨🇦 fuelled by espresso ☕️ and built with AI 🤖
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 28px', fontFamily: "'Raleway', sans-serif", fontSize: '14px' }}>
        <a href="https://www.linkedin.com/in/erik-dohnberg/" target="_blank" rel="noopener" className="footer-link">LinkedIn</a>
        <a href="https://substack.com/@heyerikd" target="_blank" rel="noopener" className="footer-link">Substack</a>
        <a href="mailto:erikdohnberg@gmail.com" className="footer-link">erikdohnberg@gmail.com</a>
      </div>
    </footer>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <div>
    <TopBar />
    <Hero />
    <About />
    <ProudWork />
    <Writing />
    <SideProjects />
    <Testimonials />
    <Footer />
    <FloatingUI />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
