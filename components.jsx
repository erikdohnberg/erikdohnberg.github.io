// components.jsx

// ── Constants ───────────────────────────────────────────────────────────────
const REDUCED_MOTION = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FADE_MS = 360;

// ── Font loading singleton ──────────────────────────────────────────────────
const _fc = { font: null, promise: null };
function loadCaveatFont() {
  if (_fc.font) return Promise.resolve(_fc.font);
  if (!_fc.promise) {
    _fc.promise = fetch('/Caveat.woff')
      .then(r => { if (!r.ok) throw new Error('font 404'); return r.arrayBuffer(); })
      .then(buf => { _fc.font = opentype.parse(buf); return _fc.font; });
  }
  return _fc.promise;
}
loadCaveatFont();

// ── Path utilities ──────────────────────────────────────────────────────────
function cmdsToD(cmds) {
  let d = '';
  for (const c of cmds) {
    switch (c.type) {
      case 'M': d += `M${c.x.toFixed(1)},${c.y.toFixed(1)}`; break;
      case 'L': d += `L${c.x.toFixed(1)},${c.y.toFixed(1)}`; break;
      case 'C': d += `C${c.x1.toFixed(1)},${c.y1.toFixed(1)} ${c.x2.toFixed(1)},${c.y2.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`; break;
      case 'Q': d += `Q${c.x1.toFixed(1)},${c.y1.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`; break;
      case 'Z': d += 'Z'; break;
    }
  }
  return d;
}

// Returns { glyphs: [{maskD, sweepD, strokeW}], totalWidth, totalH }
let _gtId = 0;
function buildGlyphMasks(font, text, fontSize) {
  const scale    = fontSize / font.unitsPerEm;
  const baseline = font.ascender * scale;
  const totalH   = (font.ascender - font.descender) * scale;
  const list     = font.stringToGlyphs(text);
  const glyphs   = [];
  let x = 0;
  for (let i = 0; i < list.length; i++) {
    const g    = list[i];
    const kern = i < list.length - 1
      ? (font.getKerningValue(g, list[i + 1]) || 0) * scale : 0;
    const gw   = (g.advanceWidth || 0) * scale;
    if (g.unicode !== 32) {
      const maskD = cmdsToD(g.getPath(x, baseline, fontSize).commands);
      const bb   = g.getBoundingBox();
      const bby1 = baseline - bb.y2 * scale;
      const bby2 = baseline - bb.y1 * scale;
      const bbx1 = x + bb.x1 * scale;
      const bbx2 = x + bb.x2 * scale;
      const bbH  = bby2 - bby1;
      const bbCY = (bby1 + bby2) * 0.5;
      const sweepD  = `M${(bbx1 - 3).toFixed(1)},${bbCY.toFixed(1)} L${(bbx2 + 3).toFixed(1)},${bbCY.toFixed(1)}`;
      const strokeW = bbH * 1.5;
      if (maskD) glyphs.push({ maskD, sweepD, strokeW });
    }
    x += gw + kern;
  }
  return { glyphs, totalWidth: x, totalH };
}

// ── runTrace: animate a mounted SVG's [data-g] paths ───────────────────────
function runTrace(svgEl, { stagger, glyphDuration }) {
  const pathEls = Array.from(svgEl.querySelectorAll('[data-g]'));
  if (!pathEls.length) return 0;
  let maxEnd = 0;
  pathEls.forEach((el, i) => {
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const delay = i * stagger;
    if (delay + glyphDuration > maxEnd) maxEnd = delay + glyphDuration;
    el.animate(
      [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: glyphDuration, easing: 'ease-out', delay, fill: 'forwards' }
    );
  });
  return maxEnd;
}

// ── HandwrittenReveal ───────────────────────────────────────────────────────
// Replaces GlyphTraceText. Stages: hidden → ready → tracing → fading → done
// Key change: dur + 850ms beat before fading (was dur + 30)
const HandwrittenReveal = ({
  text,
  fontSize,
  strokeColor = '#333333',
  stagger = 45,
  glyphDuration = 280,
  startDelay = 0,
  trigger = 'load',
  active = false,
  onComplete,
  children,
  style = {},
  className,
}) => {
  const containerRef = React.useRef(null);
  const svgRef       = React.useRef(null);
  const triggered    = React.useRef(false);
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  const [glyphData, setGlyphData] = React.useState(null);
  const [phase, setPhase] = React.useState('hidden');
  const uid = React.useMemo(() => 'g' + (_gtId++), []);

  React.useEffect(() => {
    loadCaveatFont()
      .then(font => { setGlyphData(buildGlyphMasks(font, text, fontSize)); setPhase('ready'); })
      .catch(() => setPhase('done'));
  }, [text, fontSize]);

  const startTrace = React.useCallback(() => {
    if (triggered.current) return;
    triggered.current = true;
    if (REDUCED_MOTION) { setPhase('done'); onCompleteRef.current?.(); return; }
    setTimeout(() => setPhase('tracing'), startDelay);
  }, [startDelay]);

  // load trigger
  React.useEffect(() => {
    if (trigger === 'load' && phase === 'ready') startTrace();
  }, [trigger, phase, startTrace]);

  // scroll trigger
  React.useEffect(() => {
    if (trigger !== 'scroll' || phase !== 'ready') return;
    const el = containerRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { startTrace(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, phase, startTrace]);

  // manual trigger
  React.useEffect(() => {
    if (trigger === 'manual' && active && phase === 'ready') startTrace();
  }, [trigger, active, phase, startTrace]);

  // run animation when entering 'tracing'
  React.useEffect(() => {
    if (phase !== 'tracing' || !svgRef.current || !glyphData) return;
    const dur = runTrace(svgRef.current, { stagger, glyphDuration });
    if (!dur) { setPhase('done'); onCompleteRef.current?.(); return; }
    const t = setTimeout(() => {
      setPhase('fading');
      setTimeout(() => { setPhase('done'); onCompleteRef.current?.(); }, FADE_MS);
    }, dur + 850); // 850ms beat — handwritten form sits before font resolves
    return () => clearTimeout(t);
  }, [phase, glyphData, stagger, glyphDuration]);

  if (phase === 'hidden') return (
    <span ref={containerRef} className={className} style={{ ...style, visibility: 'hidden' }}>{children}</span>
  );
  if (phase === 'done') return (
    <span ref={containerRef} className={className} style={style}>{children}</span>
  );

  const { glyphs, totalWidth, totalH } = glyphData;
  return (
    <span ref={containerRef} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <svg ref={svgRef}
        viewBox={`0 0 ${totalWidth.toFixed(1)} ${totalH.toFixed(1)}`}
        width={totalWidth} height={totalH}
        style={{
          display: 'block', overflow: 'visible',
          opacity: phase === 'fading' ? 0 : 1,
          transition: phase === 'fading' ? `opacity ${FADE_MS}ms ease` : 'none',
        }}
      >
        <defs>
          {glyphs.map((g, i) => (
            <mask key={i} id={`${uid}-${i}`} maskUnits="userSpaceOnUse">
              <path d={g.maskD} fill="white" />
            </mask>
          ))}
        </defs>
        {glyphs.map((g, i) => (
          <path key={i} data-g="1" d={g.sweepD}
            fill="none" stroke={strokeColor} strokeWidth={g.strokeW}
            strokeLinecap="butt" mask={`url(#${uid}-${i})`}
          />
        ))}
      </svg>
      <span style={{
        position: 'absolute', top: 0, left: 0,
        opacity: phase === 'fading' ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>{children}</span>
    </span>
  );
};

// ── IteratedTitle ───────────────────────────────────────────────────────────
// stage -1: idle (draft renders as normal h2, no animation)
// On scroll: 750ms pause → stage 0 (strikethrough draws over draft)
// stage 1: draft fades out, final writes in via HandwrittenReveal
const IteratedTitle = ({ draft, final, dark = false }) => {
  const wrapRef    = React.useRef(null);
  const strikeRef  = React.useRef(null);
  const triggered  = React.useRef(false);
  const [stage, setStage] = React.useState(-1);
  const color = dark ? '#f5f0e8' : '#333333';
  const isDraftShort = draft.split(' ').length <= 2;

  // Scroll trigger
  React.useEffect(() => {
    if (stage !== -1) return;
    const el = wrapRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        setTimeout(() => setStage(0), 750);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [stage]);

  // Animate strikethrough when stage=0
  React.useEffect(() => {
    if (stage !== 0 || !strikeRef.current) return;
    const path = strikeRef.current.querySelector('[data-strike]');
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.animate(
      [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }
    );
    const t = setTimeout(() => setStage(1), 700);
    return () => clearTimeout(t);
  }, [stage]);

  const draftVisible = stage <= 0;
  const strikePath = isDraftShort
    ? 'M 5 18 Q 30 14, 60 16 Q 90 18, 115 14'
    : 'M 5 18 Q 50 14, 100 17 Q 150 19, 195 14';
  const strikeVW = isDraftShort ? '0 0 120 30' : '0 0 200 30';

  return (
    <div ref={wrapRef} style={{ marginBottom: '28px' }}>
      {/* Draft row */}
      <div style={{
        display: 'inline-block', position: 'relative',
        opacity: draftVisible ? 1 : 0,
        maxHeight: draftVisible ? '120px' : '0',
        overflow: 'hidden',
        transition: !draftVisible ? 'opacity 0.35s ease, max-height 0.45s ease 0.1s' : 'none',
        marginBottom: draftVisible ? '6px' : 0,
      }}>
        <h2 className={dark ? 'section-header section-header-dark' : 'section-header'}
          style={{ display: 'inline-block', marginBottom: 0 }}>{draft}</h2>
        {stage >= 0 && (
          <svg ref={strikeRef} viewBox={strikeVW}
            style={{ position: 'absolute', top: '45%', left: '-4px', width: 'calc(100% + 8px)', height: '30px', overflow: 'visible', pointerEvents: 'none', transform: 'translateY(-2px)' }}>
            <path data-strike="1" d={strikePath} fill="none" stroke="#ff9900" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Final row */}
      {stage >= 1 && (
        <div style={{ display: 'inline-block' }}>
          <HandwrittenReveal text={final} fontSize={36} strokeColor={color}
            stagger={38} glyphDuration={240} trigger="load" startDelay={100}>
            <h2 className={dark ? 'section-header section-header-dark' : 'section-header'}
              style={{ display: 'inline-block', marginBottom: 0 }}>{final}</h2>
          </HandwrittenReveal>
        </div>
      )}
    </div>
  );
};

// ── Sketchy path generators ─────────────────────────────────────────────────
const sketchyEllipsePath = (cx, cy, rx, ry, seed = 1) => {
  const rand = i => { const x = Math.sin(seed * 9999 + i * 17.3) * 10000; return (x - Math.floor(x)) - .5; };
  const pts = 24;
  let d1 = '', d2 = '';
  for (let i = 0; i <= pts; i++) {
    const t = (i / pts) * Math.PI * 2;
    const w1 = 1 + rand(i) * .06;
    d1 += (i === 0 ? 'M' : 'L') + (cx + Math.cos(t) * rx * w1 + rand(i + 100) * 2.5).toFixed(1) + ',' + (cy + Math.sin(t) * ry * w1 + rand(i + 200) * 2.5).toFixed(1) + ' ';
    const t2 = t + .3, w2 = 1 + rand(i + 500) * .07;
    d2 += (i === 0 ? 'M' : 'L') + (cx + Math.cos(t2) * (rx + 2) * w2 + rand(i + 600) * 3).toFixed(1) + ',' + (cy + Math.sin(t2) * (ry + 1) * w2 + rand(i + 700) * 3).toFixed(1) + ' ';
  }
  return { d1, d2 };
};

const sketchyUnderlinePath = (width, seed = 1) => {
  const rand = i => { const x = Math.sin(seed * 7777 + i * 13.7) * 10000; return (x - Math.floor(x)) - .5; };
  let d = '';
  for (let i = 0; i <= 20; i++) { const x = (i / 20) * width, y = 4 + rand(i) * 3; d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' '; }
  return d;
};

// ── SideNotedSpan ───────────────────────────────────────────────────────────
const SideNotedSpan = ({ children, text, seed = 1, color = '#ff9900', side = 'auto' }) => {
  const targetRef = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState(null);

  React.useEffect(() => {
    const el = targetRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), 200); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const measure = React.useCallback(() => {
    const el = targetRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const wordRect = { left: r.left, right: r.right, top: r.top, bottom: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    let colL = wordRect.left, colR = wordRect.right, walker = el.parentElement;
    while (walker && walker !== document.body) {
      const cs = window.getComputedStyle(walker), mw = parseFloat(cs.maxWidth);
      if (!isNaN(mw) && mw > 0 && mw < window.innerWidth) { const wr = walker.getBoundingClientRect(); colL = wr.left; colR = wr.right; break; }
      walker = walker.parentElement;
    }
    const vw = window.innerWidth, gR = vw - colR, gL = colL, NO = 28, MG = 140;
    const nw = Math.min(180, Math.max(130, Math.max(gR, gL) - NO - 16));
    let pref = side === 'auto' ? (wordRect.cx < (colL + colR) / 2 ? 'left' : 'right') : side;
    let use = pref, pl = 'side';
    if (pref === 'right' && gR < MG) { use = gL >= MG ? 'left' : 'right'; if (gL < MG) pl = 'below'; }
    else if (pref === 'left' && gL < MG) { use = gR >= MG ? 'right' : 'left'; if (gR < MG) pl = 'below'; }
    let nx, ny;
    if (pl === 'side') {
      if (use === 'right') { nx = colR + NO; ny = wordRect.cy - 18; if (nx + nw > vw - 12) nx = vw - nw - 12; }
      else { nx = colL - NO - nw; ny = wordRect.cy - 18; if (nx < 12) nx = 12; }
      setPos({ wordRect, noteX: nx, noteY: ny, sideUsed: use, placement: pl, noteWidth: nw });
    } else {
      const bw = Math.min(140, vw - 24); nx = wordRect.cx - bw / 2 + 50; ny = wordRect.bottom + 32;
      if (nx + bw > vw - 12) nx = vw - bw - 12; if (nx < 12) nx = 12;
      setPos({ wordRect, noteX: nx, noteY: ny, sideUsed: use, placement: pl, noteWidth: bw });
    }
  }, [side]);

  React.useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    const t = setTimeout(measure, 600);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); clearTimeout(t); };
  }, [measure]);

  return (
    <>
      <span ref={targetRef} style={{ position: 'relative', display: 'inline' }}>{children}</span>
      {pos && ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 5 }}>
          <span className="annotation-note" style={{
            position: 'absolute', left: pos.noteX + 'px', top: pos.noteY + 'px', width: pos.noteWidth + 'px',
            fontFamily: "'Caveat', cursive", fontSize: '24px', color, lineHeight: 1.15, pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transform: visible ? 'rotate(-2deg)' : 'translateY(6px) rotate(-2deg)',
            transformOrigin: pos.sideUsed === 'right' || pos.placement === 'below' ? 'left center' : 'right center',
            textAlign: pos.placement === 'below' ? 'left' : (pos.sideUsed === 'right' ? 'left' : 'right'),
            transition: `opacity 0.5s ${EASE_OUT_STRONG} 0.9s, transform 0.5s ${EASE_OUT_STRONG} 0.9s`,
          }}>{text}</span>
        </div>,
        document.body
      )}
    </>
  );
};

// ── Annotation ──────────────────────────────────────────────────────────────
const Annotation = ({ type, text, delay = 0, seed = 1, children, color = '#ff9900' }) => {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const floor = 900, eff = Math.max(delay, floor);
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), eff); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [delay]);
  const ns = { fontFamily: "'Caveat', cursive", fontSize: '20px', color, whiteSpace: 'nowrap', pointerEvents: 'none' };

  if (type === 'circle') {
    const { d1, d2 } = sketchyEllipsePath(100, 40, 92, 32, seed), len = 580;
    return (
      <span ref={ref} style={{ position: 'relative', display: 'inline' }}>
        {children}
        <svg viewBox="0 0 200 80" style={{ position: 'absolute', top: '-22px', left: '-17px', width: 'calc(100% + 34px)', height: 'calc(100% + 44px)', pointerEvents: 'none', overflow: 'visible' }}>
          <path d={d1} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={len} strokeDashoffset={visible ? 0 : len}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.23, 1, 0.32, 1)', transform: 'rotate(-2deg)', transformOrigin: 'center', opacity: .9 }} />
          <path d={d2} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={len} strokeDashoffset={visible ? 0 : len}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.2s', transform: 'rotate(-1.5deg)', transformOrigin: 'center', opacity: .55 }} />
        </svg>
        {text && <span className="annotation-note" style={{ ...ns, position: 'absolute', top: '-44px', right: '-130px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) rotate(-3deg)' : 'translateY(8px) rotate(-3deg)', transition: 'opacity 0.5s ease 0.7s, transform 0.5s ease 0.7s' }}>
          {text} <span style={{ display: 'inline-block', transform: 'rotate(45deg)' }}>↙</span>
        </span>}
      </span>
    );
  }
  if (type === 'underline' || type === 'arrow') {
    const d = sketchyUnderlinePath(200, seed);
    return (
      <SideNotedSpan text={text} seed={seed} color={color} side="auto">
        <span ref={ref} style={{ position: 'relative', display: 'inline' }}>
          {children}
          <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-6px', left: '0', width: '100%', height: '10px', pointerEvents: 'none' }}>
            <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"
              strokeDasharray="220" strokeDashoffset={visible ? 0 : 220}
              style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.23, 1, 0.32, 1)' }} />
          </svg>
        </span>
      </SideNotedSpan>
    );
  }
  if (type === 'double-underline') {
    const d1 = sketchyUnderlinePath(200, seed);
    const d2 = sketchyUnderlinePath(200, seed + 7);
    // If no text, skip SideNotedSpan wrapper
    const inner = (
      <span ref={ref} style={{ position: 'relative', display: 'inline' }}>
        {children}
        <svg viewBox="0 0 200 18" preserveAspectRatio="none"
          style={{ position: 'absolute', bottom: '-8px', left: '0', width: '100%', height: '14px', pointerEvents: 'none' }}>
          <path d={d1} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset={visible ? 0 : 220}
            style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.23, 1, 0.32, 1)' }} />
          <path d={d2} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset={visible ? 0 : 220}
            style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.23, 1, 0.32, 1) 0.12s' }}
            transform="translate(0,5)" />
        </svg>
      </span>
    );
    if (!text) return inner;
    return (
      <SideNotedSpan text={text} seed={seed} color={color} side="auto">
        {inner}
      </SideNotedSpan>
    );
  }
  return <span ref={ref}>{children}</span>;
};

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

// ── UniqueDotRing ────────────────────────────────────────────────────────────
const UniqueDotRing = ({ visible }) => {
  const [dotsVisible, setDotsVisible] = React.useState([]);
  React.useEffect(() => {
    if (!visible) return;
    const timers = [];
    for (let i = 0; i < 12; i++) {
      timers.push(setTimeout(() => setDotsVisible(prev => [...prev, i]), i * 40 + 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const jR = ((Math.sin(i * 17.3 + 3.7) * 10000) % 1000) / 1000 * 0.15 + 0.92;
    const rx = 52 * jR, ry = 18 * jR;
    const x = 54 + Math.cos(angle) * rx;
    const y = 20 + Math.sin(angle) * ry;
    const r = 2.2 + ((Math.sin(i * 9.1) * 10000) % 1000) / 1000 * 0.8;
    return { x, y, r };
  });

  return (
    <svg viewBox="0 0 108 40" style={{
      position: 'absolute', top: '-8px', right: '-12px',
      width: '108px', height: '40px', pointerEvents: 'none', overflow: 'visible'
    }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ff9900"
          opacity={dotsVisible.includes(i) ? 0.85 : 0}
          style={{ transition: 'opacity 0.25s ease' }} />
      ))}
    </svg>
  );
};

// ── TrenchcoatWord ───────────────────────────────────────────────────────────
// Simple underline only, no circle, no annotation
const TrenchcoatWord = () => {
  const ref = React.useRef(null);
  const [drawn, setDrawn] = React.useState(false);
  const ulPath = React.useMemo(() => sketchyUnderlinePath(100, 9), []);
  React.useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => {
    if (!drawn || !ref.current) return;
    const path = ref.current.querySelector('[data-ul]');
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.animate([{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: 600, easing: 'ease-out', fill: 'forwards' });
  }, [drawn]);
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      trenchcoat
      <svg viewBox="0 0 100 8" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: '-3px', left: '-2px', width: 'calc(100% + 4px)', height: '8px', pointerEvents: 'none', overflow: 'visible' }}>
        <path data-ul="1" d={ulPath} fill="none" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
};

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const [stage, setStage] = React.useState(0);
  const [erikSettled, setErikSettled] = React.useState(false);
  const [showDots, setShowDots] = React.useState(false);
  const ulRef = React.useRef(null);
  const heroSize = React.useMemo(() => Math.min(80, Math.max(52, window.innerWidth * 0.08)), []);
  const ulPath = React.useMemo(() => sketchyUnderlinePath(200, 4), []);

  React.useEffect(() => {
    if (!erikSettled || !ulRef.current) return;
    const path = ulRef.current.querySelector('[data-ul]');
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.animate([{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: 700, easing: 'ease-out', delay: 100, fill: 'forwards' });
  }, [erikSettled]);

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
        <h1 style={{ fontSize: '0', lineHeight: 1.1, marginBottom: '20px', whiteSpace: 'nowrap' }}>
          {/* Erik */}
          <span style={{ display: 'inline-block', minHeight: `clamp(58px, 9vw, 90px)`, position: 'relative', verticalAlign: 'baseline' }}>
            {stage >= 1 && (
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <HandwrittenReveal text="Erik" fontSize={heroSize} strokeColor="#ff9900"
                  stagger={55} glyphDuration={320} trigger="load" startDelay={150}
                  onComplete={() => { setErikSettled(true); setStage(2); }}>
                  <span style={{ fontFamily: "'Sanchez', serif", fontSize: `clamp(52px, 8vw, 80px)`, color: '#ff9900', letterSpacing: '-0.01em', lineHeight: 1 }}>Erik</span>
                </HandwrittenReveal>
                <svg ref={ulRef} viewBox="0 0 200 14" preserveAspectRatio="none"
                  style={{ position: 'absolute', bottom: '-6px', left: '-4px', width: 'calc(100% + 8px)', height: '14px', pointerEvents: 'none', overflow: 'visible' }}>
                  <path data-ul="1" d={ulPath} fill="none" stroke="#333333" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </span>

          {/* Space between Erik and Dohnberg */}
          <span style={{ fontSize: `clamp(52px, 8vw, 80px)`, display: 'inline-block', verticalAlign: 'baseline' }}>{' '}</span>

          {/* Dohnberg. */}
          <span style={{ display: 'inline-block', minHeight: `clamp(58px, 9vw, 90px)`, position: 'relative', verticalAlign: 'baseline' }}>
            {stage >= 2 && (
              <HandwrittenReveal text="Dohnberg." fontSize={heroSize} strokeColor="#333333"
                stagger={50} glyphDuration={280} trigger="load" startDelay={100}
                onComplete={() => setStage(3)}>
                <span style={{ fontFamily: "'Sanchez', serif", fontSize: `clamp(52px, 8vw, 80px)`, letterSpacing: '-0.01em', lineHeight: 1 }}>Dohnberg.</span>
              </HandwrittenReveal>
            )}
          </span>
        </h1>

        {/* Tagline */}
        <div style={{ position: 'relative', maxWidth: '600px', minHeight: '90px' }}>
          {stage >= 3 && (
            <div>
              <div style={{ lineHeight: 1.6, position: 'relative', display: 'inline-block' }}>
                <HandwrittenReveal text="Every industry thinks its problems are unique."
                  fontSize={20} strokeColor="#333333" stagger={28} glyphDuration={180}
                  trigger="load" startDelay={300} onComplete={() => { setShowDots(true); setStage(4); }}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '20px', lineHeight: 1.6 }}>
                    Every industry thinks its problems are{' '}
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      unique.
                      <UniqueDotRing visible={showDots} />
                    </span>
                  </span>
                </HandwrittenReveal>
              </div>
              {stage >= 4 && (
                <div style={{ lineHeight: 1.6, marginTop: '4px' }}>
                  <HandwrittenReveal text="They're mostly the same problems in a trenchcoat."
                    fontSize={20} strokeColor="#333333" stagger={28} glyphDuration={180}
                    trigger="load" startDelay={200} onComplete={() => setStage(5)}>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '20px', lineHeight: 1.6 }}>
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
          <a href="https://linkedin.com/in/erikdohnberg" target="_blank" rel="noopener" className="hero-link">LinkedIn ↗</a>
          <a href="https://substack.com/@heyerikd" target="_blank" rel="noopener" className="hero-link">Substack ↗</a>
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
        <a href="https://linkedin.com/in/erikdohnberg" target="_blank" rel="noopener" aria-label="LinkedIn" className="topbar-icon" style={{ color: tc }}>
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
        I'm a Senior PM based in Toronto. I've shipped products in multiple industries including social media, healthcare, heavily regulated supply-chain software, food operations software, and D2C retail. The contexts of each of these products look different. But the actual problems — user adoption, large competitor advantages, a heavy and uncertain regulatory environment, and constant prioritization under uncertainty — show up time and time again. Once you've seen the pattern enough times, you can focus on the craft of good product strategy and delivery.
      </p>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        I've been building AI-powered products since 2023 — ML-curated content feeds at 500px, as well as LLM-integrated decision tools and ML Forecasting Models for enterprise food operators. I'm outcome-driven, not output-driven. Code is cheaper than ever. What you choose to build is the whole game. I do my best work on small teams with clear ownership, leadership that's still close to the work, and a bias toward shipping.
      </p>
      <p className="body-text" style={{ fontFamily: "'Sanchez', serif", fontSize: '20px', lineHeight: 1.5, paddingLeft: '24px', borderLeft: '3px solid #ff9900' }}>
        The point isn't just shipping. It's making someone's day less painful — for the user, and for the team building it.
      </p>
    </div>
  </FadeSection>
);

// ── SubstackModal ─────────────────────────────────────────────────────────────
const SubstackModal = ({ onClose }) => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | submitting | done | error
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);

  // Close on Escape or backdrop click
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!email || status === 'submitting') return;
    setStatus('submitting');
    // Submit to Substack's free-subscribe endpoint via a hidden form POST
    // Opens confirmation in a new tab; we show a "check your inbox" state
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://heyerikd.substack.com/api/v1/free';
    form.target = '_blank';
    form.style.display = 'none';
    const field = document.createElement('input');
    field.name = 'email'; field.value = email;
    form.appendChild(field);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setStatus('done');
  };

  return ReactDOM.createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,13,11,0.72)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '6px', padding: '40px',
        width: '100%', maxWidth: '420px', position: 'relative',
        boxShadow: '0 24px 60px rgba(20,14,5,0.26), 0 4px 12px rgba(20,14,5,0.1)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.95)',
        transition: `opacity 0.28s ${EASE_OUT_STRONG}, transform 0.28s ${EASE_OUT_STRONG}`,
      }}>
        {/* Close */}
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#aaa', fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>✕</button>

        {status === 'done' ? (
          <>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '28px', color: '#ff9900', marginBottom: '10px' }}>check your inbox</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
              Substack just sent you a confirmation email. Click the link in it and you're in.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "'Sanchez', serif", fontSize: '22px', color: '#333', marginBottom: '8px' }}>Get the posts</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
              Drop your email and I'll send each post when it goes live. No digests, no roundups, no nudges to upgrade.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email" required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  display: 'block', width: '100%',
                  fontFamily: "'Raleway', sans-serif", fontSize: '16px',
                  padding: '12px 14px', marginBottom: '12px',
                  border: '1px solid #ddd', borderRadius: '4px',
                  outline: 'none', color: '#333',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#ff9900'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
              <button type="submit" style={{
                display: 'block', width: '100%',
                fontFamily: "'Raleway', sans-serif", fontSize: '15px', fontWeight: 600,
                padding: '13px', borderRadius: '4px', border: 'none',
                background: '#ff9900', color: '#fff', cursor: 'pointer',
                letterSpacing: '0.03em',
                opacity: status === 'submitting' ? 0.7 : 1,
                transition: 'opacity 0.15s ease-out',
              }}>
                {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

// ── Writing ───────────────────────────────────────────────────────────────────
const Writing = () => {
  const [showModal, setShowModal] = React.useState(false);
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
            title: "Turning your org's strategic drift into product leverage",
            desc: "The best PM moves don't look heroic. They look like timing."
          },
          {
            title: "Why your side project should live 12 months ahead of the AI you're building with",
            desc: "Don't build what the platform already does. Build the thing that's just out of reach today."
          },
          {
            title: "The whiteboard remembers what transcripts don't",
            desc: "AI gives you retrieval infrastructure. Whiteboarding gives you encoded memory. They are not substitutes."
          },
        ].map((card, i) => (
          <div key={i} className="writing-card writing-card-dark" style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', top: '12px', right: '14px',
              fontFamily: "'Caveat', cursive", fontSize: '14px', color: '#ff9900', lineHeight: 1
            }}>coming soon</span>
            <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '18px', color: '#f5f0e8', margin: '0 0 6px', paddingRight: '80px' }}>{card.title}</h3>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#9a958d', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button onClick={() => setShowModal(true)} className="substack-btn">
          Subscribe on Substack
        </button>
        {showModal && <SubstackModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  </FadeSection>
  );
};

// ── Side Projects ─────────────────────────────────────────────────────────────
const SideProjects = () => (
  <FadeSection id="projects" className="section section-light" style={{ padding: '120px 32px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="section-header" style={{ marginBottom: '28px' }}>Side Projects</h2>
      <p className="body-text" style={{ marginBottom: '40px' }}>
        Staying on the cutting edge isn't a posture — it's a habit. The fastest way I've found to actually understand a new tool or model is to build something with it. These are the things I'm tinkering on in my (admittedly limited) spare time, mostly to learn.
      </p>
      <div className="project-card">
        <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '26px', color: '#333', margin: '0 0 4px' }}>Helm</h3>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>Keep strategy on course.</p>
        <p className="body-text" style={{ marginBottom: '20px' }}>
          A work-in-progress experiment: an{' '}
          <Annotation type="circle" text="yes, I'm building this" seed={9}>AI team member</Annotation>
          {' '}that listens where strategy actually happens — meetings, Slack, planning conversations — and turns those signals into Outcome Charters. When alignment fades, Helm nudges teams to refocus.
        </p>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', margin: '0 0 20px' }}>Early prototype, source-available. Nights-and-weekends pace.</p>
        <a href="https://github.com/erikdohnberg/helm" target="_blank" rel="noopener" className="inline-link">→ github.com/erikdohnberg/helm</a>
      </div>
    </div>
  </FadeSection>
);

// ── ProjectScreenshot ─────────────────────────────────────────────────────────
const ProjectScreenshot = ({ kind, accent }) => {
  if (kind === 'galleries') return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#1a1a1a" />
      <rect x="16" y="16" width="120" height="160" fill="#3d4f5e" />
      <rect x="16" y="16" width="120" height="160" fill="url(#g1)" opacity=".7" />
      <rect x="144" y="16" width="120" height="160" fill="#5c4a3e" />
      <rect x="144" y="16" width="120" height="160" fill="url(#g2)" opacity=".7" />
      <rect x="272" y="16" width="112" height="160" fill="#7a6a52" />
      <rect x="272" y="16" width="112" height="160" fill="url(#g3)" opacity=".7" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7da3c0" /><stop offset="100%" stopColor="#2a3e4f" /></linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c89570" /><stop offset="100%" stopColor="#3d2a1e" /></linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4b878" /><stop offset="100%" stopColor="#5a4a32" /></linearGradient>
      </defs>
      <text x="16" y="208" fill="#eaeaea" fontFamily="'Sanchez', serif" fontSize="18" fontWeight="600">Feeling Shady</text>
      <text x="16" y="228" fill="#999" fontFamily="'Raleway', sans-serif" fontSize="11">Curated · 248 photos</text>
      <rect x="16" y="248" width="60" height="20" rx="10" fill="none" stroke={accent} strokeWidth="1" />
      <text x="46" y="262" fill={accent} fontFamily="'Raleway', sans-serif" fontSize="10" textAnchor="middle">Follow</text>
    </svg>
  );
  if (kind === 'abby') return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="280" fill="#fdf6ee" />
      <ellipse cx="320" cy="100" rx="120" ry="80" fill="#f4dccb" opacity=".7" />
      <ellipse cx="80" cy="220" rx="100" ry="60" fill="#e8c8a8" opacity=".5" />
      <text x="24" y="40" fill="#3d2a1e" fontFamily="'Sanchez', serif" fontSize="22" fontWeight="600">hello, abby</text>
      <text x="24" y="58" fill="#a08070" fontFamily="'Raleway', sans-serif" fontSize="11">contact lenses, made simple</text>
      <rect x="24" y="80" width="160" height="170" rx="8" fill="#fff" stroke="#e8d8c8" />
      <circle cx="104" cy="140" r="36" fill="#a8c8d8" opacity=".4" />
      <circle cx="104" cy="140" r="20" fill="#5c8a9a" opacity=".3" />
      <text x="40" y="200" fill="#3d2a1e" fontFamily="'Sanchez', serif" fontSize="14" fontWeight="600">Daily Comfort</text>
      <text x="40" y="216" fill="#a08070" fontFamily="'Raleway', sans-serif" fontSize="10">30-day supply</text>
      <text x="40" y="234" fill={accent} fontFamily="'Sanchez', serif" fontSize="16" fontWeight="600">$28.00</text>
      <rect x="208" y="160" width="160" height="44" rx="22" fill={accent} />
      <text x="288" y="187" fill="#fff" fontFamily="'Raleway', sans-serif" fontSize="13" fontWeight="600" textAnchor="middle">Order now</text>
      <text x="208" y="100" fill="#3d2a1e" fontFamily="'Sanchez', serif" fontSize="20" fontWeight="600">Eyes feel good?</text>
      <text x="208" y="124" fill="#a08070" fontFamily="'Raleway', sans-serif" fontSize="12">Then your lenses are working.</text>
    </svg>
  );
  return null;
};

// ── Proud Work ────────────────────────────────────────────────────────────────
const PROUD_WORK_PROJECTS = [
  {
    title: 'The For You Feed',
    tagline: 'A personalized content discovery system for a photography platform.',
    body: (
      <>
        Owned the redesign of 500px's content feeds — replacing legacy Popular and Fresh streams with a unified "For You" feed that mixed recommended photos, photo stories, photographers, and AI-curated{' '}
        <Annotation type="arrow" text="focus on photographers" seed={9}>Mood Galleries</Annotation>
        {'. '}The Mood Galleries feature was designed to take manual curation off the content team's plate so they could spend their time supporting photographers and growing the community instead.
      </>
    ),
    role: '— Senior PM at 500px, 2023.',
    link: { href: 'https://500px.com/explore', label: '→ Live' },
    accent: '#5b8aa8', screenshot: 'galleries',
  },
  {
    title: 'Hello Abby',
    tagline: 'A direct-to-consumer contact lens platform that gave optometrists a stake in the purchases their patients were already making elsewhere.',
    body: (
      <>
        Built as a 1-800-Contacts competitor, but with{' '}
        <Annotation type="underline" text="the actual point" seed={4}>the optometrist back in the loop</Annotation>
        {' '}— better margins for doctors, better continuity of care for patients, lower friction than the incumbents. Launched in several U.S. states with plans for nationwide rollout.
        <br /><br />
        🏆 MarCom Gold Award — Medical Website Category, 2023
      </>
    ),
    role: '— Senior PM at Bounteous, 2022.',
    link: { href: 'https://helloabby.com', label: '→ helloabby.com' },
    accent: '#d68a6a', screenshot: 'abby',
  },
];

const ProudWork = () => {
  const [idx, setIdx] = React.useState(0);
  const total = PROUD_WORK_PROJECTS.length;
  const project = PROUD_WORK_PROJECTS[idx];
  return (
    <FadeSection id="proud" className="section section-paper" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <IteratedTitle draft="Selected Work" final="Some work I'm proud of" />
        <p className="body-text" style={{ marginBottom: '48px', marginTop: '8px', maxWidth: '640px' }}>
          A small selection. Real products that shipped, with real teams.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '48px', alignItems: 'start' }} className="proud-carousel-grid">
          {/* Screenshot */}
          <div style={{ position: 'relative' }}>
            <div key={idx + '-shot'} className="proud-shot" style={{
              position: 'relative',
              aspectRatio: '4 / 3',
              background: '#fff',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 18px 40px rgba(20,14,5,0.12), 0 4px 10px rgba(20,14,5,0.07)',
              border: '1px solid rgba(180,150,100,0.1)',
            }}>
              <ProjectScreenshot kind={project.screenshot} accent={project.accent} />
            </div>
          </div>
          {/* Text */}
          <div key={idx + '-txt'} style={{ animation: 'txtIn 0.5s ease' }}>
            <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: '28px', color: '#333', margin: '0 0 6px' }}>{project.title}</h3>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '15px', color: '#999', fontStyle: 'italic', margin: '0 0 22px' }}>{project.tagline}</p>
            <p className="body-text" style={{ marginBottom: '20px' }}>{project.body}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#888', margin: '0 0 16px', fontStyle: 'italic' }}>{project.role}</p>
            <a href={project.link.href} target="_blank" rel="noopener" className="inline-link">{project.link.label}</a>
          </div>
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
      </div>
    </FadeSection>
  );
};

// ── Testimonials ──────────────────────────────────────────────────────────────
const Testimonials = () => (
  <FadeSection id="testimonials" className="section section-dark" data-dark-section="true" style={{ padding: '120px 32px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="section-header section-header-dark">What it's like working with me</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '24px' }}>
        {[
          { quote: "Erik is the glue that holds the place together. His enthusiasm infects the whole place with a sense of purpose.", name: "Kevin McLoughlin", title: "CPO at Dr.Bill" },
          { quote: "Can sling a pitch deck better than I've ever seen.", name: "Martin Laws", title: "Fractional CTO" },
          { quote: "His leadership style marries strategic vision with tactical expertise.", name: "Anas Herzallah", title: "Sales Manager (formerly Erik's report)" },
        ].map((t, i) => (
          <blockquote key={i} style={{ margin: 0, padding: '0 0 0 28px', borderLeft: '3px solid #ff9900' }}>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '19px', color: '#f5f0e8', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 10px', fontWeight: 300 }}>
              "{t.quote}"
            </p>
            <footer style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: '#9a958d' }}>
              — {t.name}, {t.title}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  </FadeSection>
);

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
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: '26px', color: '#333', marginBottom: '28px' }}>
        Built in Toronto 🇨🇦, fuelled by espresso ☕️, and built with AI 🤖
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontFamily: "'Raleway', sans-serif", fontSize: '14px' }}>
        <a href="https://linkedin.com/in/erikdohnberg" target="_blank" rel="noopener" className="footer-link">LinkedIn</a>
        <span style={{ color: '#ccc' }}>·</span>
        <a href="https://substack.com/@heyerikd" target="_blank" rel="noopener" className="footer-link">Substack</a>
        <span style={{ color: '#ccc' }}>·</span>
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
    <Writing />
    <SideProjects />
    <ProudWork />
    <Testimonials />
    <Footer />
    <FloatingUI />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
