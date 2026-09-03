import React from "react";

const css = `
.lottie-scene * { transform-box: fill-box; }

.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: lb-draw var(--dur, 1s) cubic-bezier(.65,0,.35,1) var(--delay, 0s) forwards;
}
@keyframes lb-draw { to { stroke-dashoffset: 0; } }

.fade-rise {
  opacity: 0;
  animation: lb-fade-rise .7s cubic-bezier(.2,.8,.3,1) var(--delay, 0s) forwards;
}
@keyframes lb-fade-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.win {
  opacity: 0;
  animation: lb-win .45s cubic-bezier(.34,1.56,.64,1) var(--delay, 0s) forwards;
}
@keyframes lb-win {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}

.slide-x { animation: lb-slide 7s ease-in-out infinite alternate; animation-fill-mode: backwards; }
@keyframes lb-slide { from { transform: translateX(-26px); } to { transform: translateX(14px); } }

.bob { animation: lb-bob 3.6s ease-in-out infinite alternate; animation-fill-mode: backwards; }
@keyframes lb-bob { from { transform: translateY(-16px); } to { transform: translateY(14px); } }

.spin-slow { animation: lb-spin 50s linear infinite; }
.spin-rev  { animation: lb-spin-rev 70s linear infinite; }
.fan-spin  { animation: lb-spin 1.2s linear infinite; }
@keyframes lb-spin     { to { transform: rotate(360deg); } }
@keyframes lb-spin-rev { to { transform: rotate(-360deg); } }

.blink { animation: lb-blink 1.6s ease-in-out infinite; animation-fill-mode: backwards; }
@keyframes lb-blink { 0%,100% { opacity:.25; } 50% { opacity:1; } }

.ping { animation: lb-ping 2.4s cubic-bezier(0,.5,.4,1) var(--delay,0s) infinite; animation-fill-mode: backwards; }
@keyframes lb-ping { 0% { opacity:.8; transform:scale(.3); } 100% { opacity:0; transform:scale(1.4); } }

.pulse-glow { transform-origin: center; animation: lb-glow 5s ease-in-out infinite alternate; }
@keyframes lb-glow { from { transform:scale(1); opacity:.5; } to { transform:scale(1.06); opacity:.85; } }

.cloud { animation: lb-cloud var(--cdur, 50s) linear infinite; animation-delay: var(--cdelay, 0s); }
@keyframes lb-cloud { from { transform: translateX(-130px); } to { transform: translateX(620px); } }

.sheet { opacity: 0; animation: lb-sheet var(--sdur, 6s) ease-in-out var(--delay, 4s) infinite; }
@keyframes lb-sheet {
  0%   { opacity: 0;   transform: translateY(0)      rotate(0deg); }
  15%  { opacity: .75; }
  50%  {               transform: translateY(-46px) rotate(6deg); }
  100% { opacity: 0;   transform: translateY(-84px) rotate(-4deg); }
}

@media (prefers-reduced-motion: reduce) {
  .draw { animation: none; stroke-dashoffset: 0; }
  .fade-rise, .win { animation: none; opacity: 1; transform: none; }
  .slide-x, .bob, .spin-slow, .spin-rev, .fan-spin,
  .blink, .ping, .pulse-glow, .cloud, .sheet { animation: none; }
  .sheet { opacity: 0; }
}
`;

const towerWin = [];
{
  const cols = [293, 308, 323, 338];
  let i = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 4; c++) {
      towerWin.push({
        x: cols[c],
        y: 162 + r * 26,
        delay: 2.7 + i * 0.07,
      });
      i++;
    }
  }
}

const officeWin = [];
{
  const cols = [175, 195, 215];
  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      officeWin.push({ x: cols[c], y: 274 + r * 26, delay: 1.6 + i * 0.09 });
      i++;
    }
  }
}

function ArchitectBlueprint() {
  return (
    <>
      <style>{css}</style>

      <svg
        viewBox="0 0 480 480"
        className="lottie-scene w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SUN + GLOW */}
        <circle cx="76" cy="84" r="40" fill="#fbbf24" className="pulse-glow" />
        <circle cx="76" cy="84" r="26" fill="#fbbf24" className="fade-rise" style={{ "--delay": ".2s" }} />

        {/* ROTATING DRAFTING ORBITS */}
        <circle cx="290" cy="210" r="175" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeDasharray="5 10" className="spin-slow" />
        <circle cx="290" cy="210" r="142" stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeDasharray="3 9" className="spin-rev" />
        <circle cx="90" cy="380" r="118" stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="4 8" className="spin-rev" />

        {/* CLOUDS */}
        <g className="cloud" style={{ "--cdur": "55s" }}>
          <ellipse cx="240" cy="70" rx="34" ry="12" fill="#ffffff" opacity=".10" />
          <ellipse cx="264" cy="62" rx="22" ry="10" fill="#ffffff" opacity=".08" />
        </g>
        <g className="cloud" style={{ "--cdur": "70s", "--cdelay": "-30s" }}>
          <ellipse cx="150" cy="120" rx="28" ry="9" fill="#ffffff" opacity=".08" />
        </g>

        {/* GROUND LINE + RULER TICKS + PIVOT CROSSHAIR */}
        <path d="M28 396 H452" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"
          pathLength="1" className="draw" style={{ "--delay": ".1s", "--dur": ".9s" }} />
        {[...Array(10)].map((_, i) => (
          <line key={i} x1={40 + i * 42} y1="396" x2={40 + i * 42} y2={i % 4 === 0 ? 384 : 389}
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity=".7"
            className="fade-rise" style={{ "--delay": `${0.5 + i * 0.05}s` }} />
        ))}
        <g className="fade-rise" style={{ "--delay": ".4s" }} stroke="#fbbf24" strokeWidth="1.5">
          <path d="M78 380 H102" /><path d="M90 368 V392" /><circle cx="90" cy="380" r="5" />
        </g>

        {/* CRANE */}
        <rect x="86" y="206" width="8" height="174" fill="#475569" stroke="#94a3b8" strokeWidth="1.5"
          pathLength="1" className="draw" style={{ "--delay": ".2s", "--dur": ".6s" }} />
        <path d="M30 205 H190" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round"
          pathLength="1" className="draw" style={{ "--delay": ".5s", "--dur": ".5s" }} />
        <polygon points="82,172 106,172 94,152" fill="#475569" stroke="#94a3b8" strokeWidth="1.5"
          className="fade-rise" style={{ "--delay": ".8s" }} />
        <path d="M94 158 L46 203 M94 158 L184 203" stroke="#94a3b8" strokeWidth="1.5"
          pathLength="1" className="draw" style={{ "--delay": ".9s", "--dur": ".4s" }} />
        <rect x="34" y="192" width="20" height="20" rx="2" fill="#475569" stroke="#94a3b8"
          className="fade-rise" style={{ "--delay": "1s" }} />
        <rect x="100" y="188" width="14" height="12" rx="2" fill="#475569" stroke="#94a3b8"
          className="fade-rise" style={{ "--delay": "1.1s" }} />
        <circle cx="94" cy="148" r="3" fill="#fbbf24" className="blink" style={{ "--delay": "1.6s" }} />

        {/* crane trolley + cable + lifted beam */}
        <g className="slide-x">
          <g className="bob" style={{ "--delay": "2.2s" }}>
            <rect x="149" y="198" width="16" height="7" rx="2" fill="#475569" stroke="#94a3b8" />
            <path d="M157 205 V300" stroke="#cbd5e1" strokeWidth="1.5"
              pathLength="1" className="draw" style={{ "--delay": "1.3s", "--dur": ".5s" }} />
            <path d="M157 300 L132 307 M157 300 L182 307" stroke="#cbd5e1" strokeWidth="1.5"
              pathLength="1" className="draw" style={{ "--delay": "1.6s", "--dur": ".3s" }} />
            <rect x="124" y="305" width="66" height="9" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5"
              className="fade-rise" style={{ "--delay": "1.7s" }} />
            <circle cx="157" cy="301" r="3" fill="#fbbf24" className="blink" style={{ "--delay": "2s" }} />
          </g>
        </g>

        {/* SHORT OFFICE BUILDING */}
        <path d="M161 380 V262 H249 V380" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
          fill="#334155" pathLength="1" className="draw" style={{ "--delay": ".9s", "--dur": "1s" }} />
        <path d="M155 262 H255" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"
          className="fade-rise" style={{ "--delay": "1.3s" }} />
        {/* rooftop AC + spinning fan */}
        <g className="fade-rise" style={{ "--delay": "1.6s" }}>
          <rect x="204" y="244" width="24" height="16" rx="3" fill="#475569" stroke="#94a3b8" />
          <g className="fan-spin">
            <path d="M216 247 V257 M211 252 H221 M212.8 248.8 L219.2 255.2 M219.2 248.8 L212.8 255.2"
              stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <circle cx="216" cy="252" r="6.5" stroke="#94a3b8" strokeWidth="1.5" />
        </g>
        {officeWin.map((w, idx) => (
          <rect key={idx} x={w.x} y={w.y} width="12" height="16" rx="2" fill="#fbbf24"
            className="win" style={{ "--delay": `${w.delay}s` }} />
        ))}
        <path d="M197 380 v-22 a8 8 0 0 1 16 0 v22 Z" fill="#1e293b"
          className="fade-rise" style={{ "--delay": "2s" }} />

        {/* MAIN TOWER */}
        <path d="M285 380 V152 H361 V380" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
          fill="#334155" pathLength="1" className="draw" style={{ "--delay": "1.1s", "--dur": "1.3s" }} />
        <path d="M279 150 H367" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"
          className="fade-rise" style={{ "--delay": "1.6s" }} />
        <rect x="293" y="134" width="20" height="16" rx="2" fill="#475569" stroke="#94a3b8"
          className="fade-rise" style={{ "--delay": "2s" }} />
        {/* antenna + signal + beacon */}
        <path d="M331 150 V122" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
          pathLength="1" className="draw" style={{ "--delay": "2.4s", "--dur": ".3s" }} />
        <circle cx="331" cy="118" r="3.5" fill="#fbbf24" className="blink" style={{ "--delay": "3.2s" }} />
        <path d="M321 114 A10 10 0 0 1 341 114" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" className="ping" />
        <path d="M313 112 A18 18 0 0 1 349 112" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"
          className="ping" style={{ "--delay": "1.2s" }} />
        {towerWin.map((w, idx) => (
          <rect key={idx} x={w.x} y={w.y} width="11" height="14" rx="2" fill="#fbbf24"
            className="win" style={{ "--delay": `${w.delay}s` }} />
        ))}

        {/* FLOATING BLUEPRINT SHEETS */}
        <g transform="translate(348 138)">
          <g className="sheet" style={{ "--delay": "4.4s", "--sdur": "6s" }}>
            <rect width="26" height="18" rx="2" fill="#e2e8f0" opacity=".9" />
            <path d="M18 18 v-6 h8" fill="#94a3b8" />
            <path d="M5 6 h12 M5 10 h9" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>
        <g transform="translate(386 178)">
          <g className="sheet" style={{ "--delay": "5.2s", "--sdur": "7s" }}>
            <rect width="26" height="18" rx="2" fill="#e2e8f0" opacity=".9" />
            <path d="M5 6 h12 M5 10 h9" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>
        <g transform="translate(206 232)">
          <g className="sheet" style={{ "--delay": "5.8s", "--sdur": "6.5s" }}>
            <rect width="24" height="17" rx="2" fill="#e2e8f0" opacity=".9" />
            <path d="M5 6 h11 M5 10 h8" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </>
  );
}

export default ArchitectBlueprint;