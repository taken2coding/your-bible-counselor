// Your Bible Counselor — Animated Fun UI — Dynamic counts from stories/verses
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { counsel, buildLLMPrompt } from "./agent.js";
import { STORIES } from "../data/stories.js";
import { VERSES } from "../data/verses.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8787;

// --- Security headers (defense-in-depth) ---
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Content-Security-Policy", "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
  res.setHeader("X-XSS-Protection", "0");
  // keep ngrok header for tunnel
  res.setHeader("ngrok-skip-browser-warning", "true");
}

function json(res, status, obj) {
  setSecurityHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  res.end(JSON.stringify(obj, null, 2));
}

// --- Rate limiting (in-memory, per-IP) ---
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30; // 30 req/min per IP
const rateMap = new Map();
function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}
function checkRateLimit(req, res) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + RATE_WINDOW_MS; }
  entry.count += 1;
  rateMap.set(ip, entry);
  res.setHeader("X-RateLimit-Limit", String(RATE_MAX));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, RATE_MAX - entry.count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.reset / 1000)));
  if (entry.count > RATE_MAX) {
    json(res, 429, { error: "Too many requests — please slow down. Try again in a minute.", hint: "I am Your Bible Counselor — I help with life situations through KJV 1769 wisdom." });
    return false;
  }
  return true;
}
function isValidMode(m) {
  if (!m) return null;
  const v = String(m).toLowerCase().trim();
  if (["auto","stories","story","verses","verse"].includes(v)) {
    if (v === "story") return "stories";
    if (v === "verse") return "verses";
    return v;
  }
  return null; // invalid -> bounce later as injection attempt
}
function isValidTop(v) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return 3;
  return Math.min(5, Math.max(1, n));
}

function serveStaticFile(res, filePath, contentType) {
  try {
    const abs = path.resolve(filePath);
    // prevent path traversal
    const data = fs.readFileSync(abs);
    setSecurityHeaders(res);
    res.writeHead(200, { "Content-Type": contentType });
    return res.end(data);
  } catch (e) {
    return json(res, 404, { error: "Not found" });
  }
}

function htmlHome() {
  const STORY_COUNT = STORIES.length;
  const VERSE_COUNT = VERSES.length;
  const allStoriesJson = JSON.stringify(STORIES.map(s=>({id:s.id,title:s.title,character:s.character,tags:s.situationTags,book:s.book,chapter:s.chapter,verses:s.verses})));
  const STORY_COUNT_CLIENT = STORIES.length;
  const VERSE_COUNT_CLIENT = VERSES.length;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Your Bible Counselor — KJV 1769 • ${STORY_COUNT} Biblical Scenarios</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root{--maroon:#8B0000;--maroon2:#A52A2A;--cream:#FFFAF0;--gold:#B8860B;--gold2:#DAA520;--green:#1A5A3A;--green2:#0F3D26;--ink:#1A1A2E;--muted:#6B7280;--card:#FFFFFF;--border:#E5E7EB;--radius:16px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Inter',system-ui,sans-serif;background:var(--cream);color:var(--ink);line-height:1.6;overflow-x:hidden}
a{color:var(--maroon);text-decoration:none}a:hover{text-decoration:underline}
/* Animations */
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0.92);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(139,0,0,0.18)}50%{box-shadow:0 0 0 10px rgba(139,0,0,0)}}
@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(400px) rotate(720deg);opacity:0}}
@keyframes scrollReveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
/* Header */
.hero{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--maroon) 0%,#5A0A0A 60%,#1A1A2E 100%);color:white;padding:36px 20px 44px;text-align:center}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(600px 300px at 20% 0%, rgba(218,165,32,0.18), transparent 60%), radial-gradient(500px 400px at 90% 100%, rgba(255,255,255,0.06), transparent 60%)}
.hero > *{position:relative}
.hero h1{font-family:'Cinzel',serif;font-size:32px;margin:0;letter-spacing:0.5px;animation:fadeUp 0.7s ease}
.hero h1 span{background:linear-gradient(90deg,var(--gold2),#FFEC9C,var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero .sub{opacity:0.9;margin:8px 0 6px;font-size:14px;animation:fadeUp 0.7s 0.1s both}
.badgeRow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px;animation:fadeUp 0.7s 0.2s both}
.badge{background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);backdrop-filter:blur(6px);padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.2px}
.badge.gold{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#1A1A2E;border-color:transparent}
.floatingEmojis{position:absolute;font-size:22px;opacity:0.18;animation:float 5s ease-in-out infinite;pointer-events:none}
.floatingEmojis.e1{top:18px;left:6%} .floatingEmojis.e2{top:28px;right:8%;animation-delay:1s} .floatingEmojis.e3{bottom:16px;left:12%;animation-delay:2s} .floatingEmojis.e4{bottom:22px;right:10%;animation-delay:0.5s}
/* Container */
.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 20px rgba(0,0,0,0.06);transition:transform 0.18s, box-shadow 0.18s}
.card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.08)}
.promptCard{margin:-22px auto 18px;max-width:980px;padding:20px 20px 16px;position:relative;z-index:2;animation:pop 0.5s ease}
.promptCard h2{margin:0 0 4px;font-size:16px;color:var(--ink)} .promptCard p{margin:0 0 10px;color:var(--muted);font-size:13px}
textarea{width:100%;min-height:92px;padding:14px 14px 14px 44px;border:1.5px solid var(--border);border-radius:12px;font-size:15px;font-family:inherit;resize:vertical;outline:none;transition:border 0.15s, box-shadow 0.15s;background:#FFFEFB}
textarea:focus{border-color:var(--maroon);box-shadow:0 0 0 3px rgba(139,0,0,0.12)}
.textWrap{position:relative}
.textWrap::before{content:'✦';position:absolute;left:14px;top:14px;font-size:18px;opacity:0.5}
.btnRow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.btn{border:0;padding:10px 16px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer;transition:transform 0.12s, box-shadow 0.12s, filter 0.12s}
.btn:active{transform:scale(0.98)}
.btnPrimary{background:linear-gradient(135deg,var(--maroon),var(--maroon2));color:white;box-shadow:0 6px 16px rgba(139,0,0,0.28);animation:pulseGlow 2.6s infinite}
.btnPrimary:hover{filter:brightness(1.06)}
.btnGhost{background:white;border:1px solid var(--border);color:var(--ink)}
.btnGhost:hover{border-color:var(--maroon);color:var(--maroon)}
.btnGreen{background:linear-gradient(135deg,var(--green),var(--green2));color:white}
/* Mode Toggle — NEW */
.modeToggle{display:flex;gap:6px;padding:4px;background:#F3F4F6;border:1px solid var(--border);border-radius:999px;width:fit-content;margin:6px 0 10px}
.modeToggle button{border:0;padding:7px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer;background:transparent;color:var(--muted);transition:all 0.15s}
.modeToggle button.active{background:white;border:1px solid var(--border);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.modeToggle button.active[data-mode='stories']{background:linear-gradient(135deg,#FEF2F2,#FFF);border-color:var(--maroon);color:var(--maroon)}
.modeToggle button.active[data-mode='verses']{background:linear-gradient(135deg,#ECFDF5,#FFF);border-color:var(--green);color:var(--green)}
.modeToggle button.active[data-mode='auto']{background:linear-gradient(135deg,#FFFBEB,#FFF);border-color:var(--gold);color:#8B5A00}
.modeTips{background:#FFFEFB;border:1px dashed var(--border);border-radius:12px;padding:10px 12px;margin:0 0 10px;font-size:12px;line-height:1.5;transition:all 0.2s}
.modeTips strong{font-size:12px}
.modeTips code{background:#F3F4F6;padding:2px 6px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;border:1px solid var(--border)}
.modeTips.verses{border-color:var(--green);background:#F0FAF0}
.modeTips.stories{border-color:var(--maroon);background:#FEF2F2}
.modeTips.auto{border-color:var(--gold2);background:#FFFBEB}
/* Prompt action — button close to prompt box */
.promptAction{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;padding:10px 12px;background:#F9FAFB;border:1px solid var(--border);border-radius:12px}
.promptAction .btnPrimary{animation:none;box-shadow:0 4px 12px rgba(139,0,0,0.22);padding:11px 22px;font-size:14px}
.promptAction .small{font-size:11px}
.examplesRow{margin-top:10px;padding-top:8px;border-top:1px solid #F3F4F6}
.examplesRow .label{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:0.4px;text-transform:uppercase;margin-right:4px;align-self:center}
.modeBadge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.3px;border:1px solid var(--border);background:#F9FAFB}
.modeBadge.verse{color:var(--green);border-color:var(--green);background:#ECFDF5}
.modeBadge.story{color:var(--maroon);border-color:var(--maroon);background:#FEF2F2}
.modeBadge.auto{color:#8B5A00;border-color:var(--gold2);background:#FFFBEB}
/* Output */
#out{max-width:980px;margin:14px auto}
.kjv{font-style:italic;background:#FDF6E3;border-left:4px solid var(--gold);padding:10px 12px;border-radius:0 10px 10px 0}
.small{font-size:11px;color:var(--muted)}
.outCard{animation:fadeUp 0.35s ease}
.outCard h3{margin:0 0 6px;font-size:15px}
.strategySteps li{margin:4px 0}
/* Scenarios Gallery */
.galleryHead{display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:22px 0 10px}
.galleryHead h2{margin:0;font-family:'Cinzel',serif;color:var(--maroon);font-size:20px}
.filterBar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.filterBar input, .filterBar select{padding:9px 12px;border:1.5px solid var(--border);border-radius:999px;font-size:13px;outline:none;background:white;min-width:180px}
.filterBar input:focus, .filterBar select:focus{border-color:var(--maroon);box-shadow:0 0 0 3px rgba(139,0,0,0.1)}
.stats{font-size:12px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.archCard{padding:14px 14px 12px;cursor:pointer;position:relative;overflow:hidden;animation:scrollReveal 0.4s ease}
.archCard::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold2),var(--maroon),var(--green));opacity:0;transition:opacity 0.18s}
.archCard:hover::after{opacity:1}
.archCard:hover{transform:translateY(-3px) scale(1.01)}
.archTop{font-size:11px;font-weight:700;letter-spacing:0.4px;color:var(--maroon);text-transform:uppercase}
.archTitle{font-weight:700;font-size:13px;line-height:1.3;margin:4px 0 4px;color:var(--ink)}
.archChar{font-size:12px;color:var(--muted);font-style:italic}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.tag{font-size:10px;font-weight:600;padding:3px 7px;border-radius:999px;background:#F3F4F6;border:1px solid var(--border);color:#374151}
.tag.more{background:var(--ink);color:white;border-color:var(--ink)}
.archCta{margin-top:8px;font-size:11px;font-weight:700;color:var(--maroon);display:flex;align-items:center;gap:4px}
.archCta span{transition:transform 0.15s} .archCard:hover .archCta span{transform:translateX(3px)}
/* Pagination */
.showMore{display:flex;justify-content:center;margin:14px 0}
.countPill{background:var(--ink);color:white;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700}
/* Confetti */
.confetti{position:fixed;top:-10px;width:8px;height:14px;border-radius:2px;pointer-events:none;z-index:9999;animation:confettiFall 1.2s ease forwards}
/* Footer */
.footer{margin:28px 0 24px;text-align:center;color:var(--muted);font-size:11px}
.shimmer{background:linear-gradient(90deg,#FFF 25%,#F3F4F6 50%,#FFF 75%);background-size:200% 100%;animation:shimmer 1.2s infinite}
.loadingDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--maroon);margin:0 2px;animation:float 0.8s infinite}
.loadingDot:nth-child(2){animation-delay:0.15s} .loadingDot:nth-child(3){animation-delay:0.3s}
@media (max-width:640px){.hero h1{font-size:24px}.grid{grid-template-columns:1fr 1fr} .filterBar input{min-width:140px} .promptAction{flex-direction:column;align-items:stretch} .promptAction .btnPrimary{width:100%;justify-content:center}}
</style>
</head>
<body>
<div class="hero">
  <div class="floatingEmojis e1">📖</div><div class="floatingEmojis e2">✦</div><div class="floatingEmojis e3">🕊️</div><div class="floatingEmojis e4">🔥</div>
  <img src="/Assets/logo_main.png" alt="Your Bible Counselor logo" style="width:130px;height:auto;background:white;border-radius:18px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.18);margin:0 auto 14px;display:block;animation:fadeUp 0.6s ease">
  <h1>Your <span>Bible Counselor</span></h1>
  <div class="sub">Simple, proven wisdom for every part of your life</div>
  <div class="badgeRow">
    <span class="badge gold">✦ ${STORY_COUNT} Biblical Scenarios</span>
    <span class="badge">📜 ${VERSE_COUNT} Verses</span>
  </div>
</div>

<div class="wrap">
  <div class="card promptCard" id="promptCard">
    <h2>What do you need today?</h2>
    <p>Pick a mode — see live prompting tips — then Seek Counsel. <b>Auto</b> detects, or force <b>Stories</b> / <b>Verses</b>.</p>
    <p class="small" style="margin:-4px 0 10px">📖 New here? <a href="/docs/Prompting_Guide.pdf" target="_blank" style="font-weight:700">Read the Prompting Guide</a> — get the most out of it.</p>
    <div class="modeToggle" role="tablist" aria-label="Prompt mode">
      <button data-mode="auto" class="active" onclick="setMode('auto')" aria-selected="true">⚡ Auto</button>
      <button data-mode="stories" onclick="setMode('stories')">📖 Stories</button>
      <button data-mode="verses" onclick="setMode('verses')">📜 Verses</button>
    </div>
    <div id="modeTips" class="modeTips auto">
      <strong>⚡ Auto —</strong> Describe a situation <em>or</em> ask for verses. E.g. <code>10 verses about diligence</code> or <code>I am in a cave like David at Adullam</code> — we auto-detect, never muddle. Tip: include a number + "verses" for verses; include emotion/situation for stories.
    </div>
    <div class="textWrap">
      <textarea id="q" placeholder="Try: 10 verses about peace  — or —  I feel forgotten like Joseph in prison...">I feel overwhelmed and burnt out after a big win, like Elijah after Mount Carmel — how do I find fresh strength?</textarea>
    </div>
    <div class="promptAction">
      <button class="btn btnPrimary" onclick="ask()">✦ Seek Counsel — <span id="actionModeLabel">Auto</span></button>
      <span class="small">↵ Enter to send • Shift+↵ newline • Mode controls tips &amp; results</span>
      <span id="modeBadge" class="modeBadge auto">● Auto</span>
    </div>
    <div class="btnRow examplesRow" id="examplesRow">
      <span class="label">Try:</span>
      <button class="btn btnGhost" onclick="example('10 verses about diligence')">10 verses diligence</button>
      <button class="btn btnGhost" onclick="example('5 verses that talk about fear')">5 verses fear</button>
      <button class="btn btnGreen" onclick="example('10 verses to justify background checks')">Background checks</button>
      <button class="btn btnGhost" onclick="example('falsely accused and forgotten in prison like Joseph')">Falsely accused</button>
      <button class="btn btnGhost" onclick="example('need courage to speak up like Esther, afraid')">Esther courage</button>
      <button class="btn btnGhost" onclick="document.getElementById('gallery').scrollIntoView({behavior:'smooth'})">↓ ${STORY_COUNT} Biblical Scenarios</button>
    </div>
  </div>

  <div id="out"></div>

  <div class="galleryHead" id="gallery">
    <div>
      <h2>📚 Explore All ${STORY_COUNT} Biblical Scenarios</h2>
      <div class="stats" id="galleryStats">Showing 24 of ${STORY_COUNT} — click any card to auto-prompt</div>
    </div>
    <div class="filterBar">
      <input id="archSearch" placeholder="Filter archetypes… e.g., fear, diligence, debt" oninput="filterGallery()"/>
      <select id="archSort" onchange="filterGallery()"><option value="relevance">Sort: Relevance</option><option value="alpha">A → Z</option><option value="book">By Book</option></select>
      <button class="btn btnGhost" style="padding:8px 12px" onclick="shuffleGallery()">🎲 Shuffle</button>
      <button class="btn btnGhost" style="padding:8px 12px" onclick="toggleGallery()">Show all</button>
    </div>
  </div>
  <div class="grid" id="archGrid"></div>
  <div class="showMore"><span class="countPill" id="countPill">24 shown • 126 hidden — click “Show all”</span></div>
</div>

<div class="footer">All verses KJV 1769 • Verify at <a href="https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)" target="_blank">Wikisource KJV 1769</a> • <span id="storyCountFoot"></span><br><span style="margin-top:8px;display:inline-block">Has this project blessed you in any way, we would be glad to read from you. Email the curator on: <a href="mailto:sirp4all@gmail.com">sirp4all@gmail.com</a></span></div>

<script>
const ALL_STORIES = ${allStoriesJson};
let galleryExpanded=false;
let filtered = [...ALL_STORIES];
let selectedMode='auto';

const MODE_TIPS = {
  auto: '<strong>⚡ Auto —</strong> Describe a situation <em>or</em> ask for verses. E.g. <code>10 verses about diligence</code> or <code>I am in a cave like David at Adullam</code> — we auto-detect, never muddle. Tip: include a number + "verses" for verses; include emotion/situation for stories.',
  stories: '<strong>📖 Stories —</strong> Describe your <em>situation + emotion</em> for archetype matching. Good prompts: <code>falsely accused and forgotten in prison like Joseph</code>, <code>burnout after victory like Elijah at Horeb</code>, <code>need courage to speak up like Esther, afraid</code>, <code>cave season, betrayed and hiding — what should I do?</code> You will get 2–3 biblical characters, actions, outcomes & a Best Strategic Plan.',
  verses: '<strong>📜 Verses —</strong> Ask for topical KJV with count. Good prompts: <code>10 verses about diligence</code>, <code>5 verses that talk about fear</code>, <code>what does the bible say about stewardship</code>, <code>7 verses on forgiveness</code>, <code>verses to justify due diligence / background checks</code>. You will get exact count, verbatim KJV, Wikisource URLs & strategic insight per verse.'
};
const MODE_PLACEHOLDERS = {
  auto: 'Try: 10 verses about diligence  — or —  I am betrayed and hiding like David in Adullam...',
  stories: 'E.g., I am falsely accused and forgotten like Joseph in prison — need a strategy...',
  verses: 'E.g., 10 verses about diligence — or — 5 verses that talk about fear...'
};

function setMode(mode){
  selectedMode = mode;
  document.querySelectorAll('.modeToggle button').forEach(b=>{
    b.classList.toggle('active', b.dataset.mode===mode);
    b.setAttribute('aria-selected', b.dataset.mode===mode ? 'true':'false');
  });
  const tipsEl=document.getElementById('modeTips');
  tipsEl.innerHTML = MODE_TIPS[mode] || MODE_TIPS.auto;
  tipsEl.className = 'modeTips ' + mode;
  document.getElementById('actionModeLabel').textContent = mode==='auto' ? 'Auto' : mode==='stories' ? 'Stories' : 'Verses';
  const qEl=document.getElementById('q');
  qEl.placeholder = MODE_PLACEHOLDERS[mode];
  updateBadge();
  // update examples visibility hint
  burstConfetti();
}

function renderGallery(){
  const grid=document.getElementById('archGrid');
  const countPill=document.getElementById('countPill');
  const stats=document.getElementById('galleryStats');
  const show = galleryExpanded ? filtered.length : Math.min(24, filtered.length);
  const slice = filtered.slice(0, show);
  grid.innerHTML='';
  slice.forEach((s,i)=>{
    const tags = s.tags.slice(0,3).map(t=>'<span class=tag>'+t+'</span>').join('') + (s.tags.length>3?'<span class=tag more>+'+(s.tags.length-3)+'</span>':'');
    const card=document.createElement('div');
    card.className='card archCard';
    card.style.animationDelay=(i*0.02)+'s';
    card.innerHTML='<div class=archTop>'+s.book+' '+s.chapter+':'+s.verses+'</div><div class=archTitle>'+s.title+'</div><div class=archChar>'+s.character+'</div><div class=tags>'+tags+'</div><div class=archCta>Ask about this <span>→</span></div>';
    card.onclick=()=>{
      setMode('stories');
      example(s.title + ' — ' + s.character);
      document.getElementById('promptCard').scrollIntoView({behavior:'smooth', block:'center'});
      card.animate([{transform:'scale(1.02)'},{transform:'scale(1)'}],{duration:180});
    };
    grid.appendChild(card);
  });
  countPill.textContent = galleryExpanded ? filtered.length+' shown • all visible' : show+' shown • '+(filtered.length-show)+' hidden — click “Show all”';
  stats.textContent = 'Showing '+show+' of '+filtered.length+' (of ${STORY_COUNT}) — click any card to auto-prompt';
  document.getElementById('storyCountFoot').textContent = filtered.length+' filtered • ${STORY_COUNT} total';
}

function filterGallery(){
  const q=document.getElementById('archSearch').value.toLowerCase().trim();
  const sort=document.getElementById('archSort').value;
  filtered = ALL_STORIES.filter(s=>{
    if(!q) return true;
    const hay=(s.title+' '+s.character+' '+s.tags.join(' ')+' '+s.book).toLowerCase();
    return hay.includes(q);
  });
  if(sort==='alpha') filtered.sort((a,b)=>a.title.localeCompare(b.title));
  else if(sort==='book') filtered.sort((a,b)=> (a.book+a.chapter).localeCompare(b.book+b.chapter));
  galleryExpanded=false;
  renderGallery();
}
function shuffleGallery(){
  for(let i=filtered.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[filtered[i],filtered[j]]=[filtered[j],filtered[i]]}
  renderGallery();
  burstConfetti();
}
function toggleGallery(){ galleryExpanded=!galleryExpanded; renderGallery(); if(galleryExpanded) burstConfetti(); }

// Mode badge — now respects selectedMode
const qEl=document.getElementById('q'), badge=document.getElementById('modeBadge');
function updateBadge(){
  if(selectedMode!=='auto'){
    const isVerses = selectedMode==='verses';
    badge.textContent = isVerses ? '● Verses (forced)' : '● Stories (forced)';
    badge.className = isVerses ? 'modeBadge verse' : 'modeBadge story';
    return;
  }
  const q=qEl.value.toLowerCase();
  const isVerse=/\\d+\\s*verses?/.test(q) || q.includes('verse') || q.includes('scripture') || q.includes('what does') || q.includes('justify');
  badge.textContent = isVerse ? '● Verses (auto)' : '● Stories (auto)';
  badge.className = isVerse ? 'modeBadge verse' : 'modeBadge story';
  // also hint badge border for auto
  if(!isVerse && !qEl.value.includes('verse')) badge.className='modeBadge auto';
}
qEl.addEventListener('input', updateBadge);
qEl.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(); }
});
updateBadge();

// Ask — now passes selectedMode
function example(t){
  // keep current mode unless t is clearly verse-like and mode is auto
  document.getElementById('q').value=t;
  if(selectedMode==='auto') updateBadge();
  else updateBadge();
  ask();
}

function burstConfetti(){
  const colors=['#8B0000','#DAA520','#1A5A3A','#1A1A2E','#B8860B'];
  for(let i=0;i<18;i++){
    const d=document.createElement('div'); d.className='confetti';
    d.style.left=(Math.random()*100)+'vw'; d.style.background=colors[i%colors.length];
    d.style.animationDelay=(Math.random()*0.2)+'s'; d.style.transform='rotate('+(Math.random()*360)+'deg)';
    document.body.appendChild(d); setTimeout(()=>d.remove(),1400);
  }
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
async function ask(){
  const raw=document.getElementById('q').value;
  const q=raw.trim();
  if(!q) return;
  if(q.length>600){ alert('Please shorten to under 600 characters.'); return; }
  const out=document.getElementById('out');
  const modeParam = selectedMode==='auto' ? '' : '&mode='+selectedMode;
  out.innerHTML='<div class=card style="padding:18px;text-align:center"><div><span class=loadingDot></span><span class=loadingDot></span><span class=loadingDot></span></div><p class=small>Seeking counsel for: <em>'+esc(q).slice(0,120)+'</em> — mode: <b>'+esc(selectedMode)+'</b> — consulting ${STORY_COUNT} archetypes + ${VERSE_COUNT} verses…</p></div>';
  out.scrollIntoView({behavior:'smooth', block:'start'});
  const res=await fetch('/counsel?q='+encodeURIComponent(q)+modeParam, {headers:{'ngrok-skip-browser-warning':'true'}});
  const text=await res.text();
  let data; try{ data=JSON.parse(text);}catch(e){ out.innerHTML='<div class=card style="border:2px solid #DC2626;padding:16px"><b>Error parsing response</b><pre style="white-space:pre-wrap">'+esc(text).slice(0,1400)+'</pre></div>'; return;}
  const isBounce = data && (data.blocked || data.mode==='bounce');
  if(!res.ok && !isBounce){
    if(res.status===429){
      out.innerHTML='<div class="card" style="border:2px solid #F59E0B;background:#FFFBEB;padding:16px"><h3>⏳ Too many requests</h3><p>'+esc(data.error||'Please slow down.')+'</p></div>';
      return;
    }
    out.innerHTML='<div class=card style="border:2px solid #DC2626;padding:16px"><b>Server error '+res.status+'</b><pre>'+esc(JSON.stringify(data,null,2)).slice(0,1600)+'</pre></div>'; return;
  }
  let html='';
  if(isBounce){ html='<div class="card" style="border:2px solid #F59E0B;background:#FFFBEB;padding:16px"><h3 style="color:#92400E">🛡️ Request not in scope</h3><p>'+esc(data.message||data.error||"I can only help with biblical counsel.")+'</p><p class=small>Try: <code>I feel anxious like Elijah</code> • <code>5 verses about peace</code> • <code>betrayed like Joseph</code></p></div>'; }
  else if(data.error){ html='<div class=card style="padding:16px">'+esc(data.error)+'</div>';}
  else if(data.mode==='verses'){
    burstConfetti();
    html+='<div class="card outCard" style="border:2px solid var(--green);background:linear-gradient(135deg,#ECFDF5,#F0FAF0)"><h3 style="color:var(--green)">📖 '+esc(data.count)+' KJV 1769 verses about “'+esc(data.topic)+'”</h3><p class=small>Mode: verses — full-KJV search with provenance + strategic insight • Click any verse citation to verify on Wikisource • Forced mode: '+esc(selectedMode)+'</p></div>';
    data.verses.forEach((v,i)=>{
      html+='<div class="card outCard" style="animation-delay:'+(i*0.04)+'s"><h3>'+esc(i+1)+'. '+esc(v.citation)+' <a href="'+esc(v.url)+'" target=_blank style="font-size:11px">[Wikisource ↗]</a></h3><div class=kjv>"'+esc(v.text)+'"</div><p><b>Strategic Insight:</b> '+esc(v.strategicInsight)+'</p><p class=small>Tags: '+esc(v.tags.join(", "))+' • <a href="'+esc(v.canonical)+'" target=_blank>Canonical</a></p></div>';
    });
    html+='<div class="card outCard" style="border:2px solid var(--green);background:linear-gradient(135deg,#F0FAF0,#FFFFFF)"><h3 style="color:var(--green)">★★★ Strategic Summary</h3><p>'+esc(data.strategicSummary)+'</p></div>';
    html+='<p class=small>'+esc(data.disclaimer)+'</p>';
  } else {
    burstConfetti();
    data.stories.forEach((s,i)=>{
      html+='<div class="card outCard" style="animation-delay:'+(i*0.05)+'s"><h3>'+(i+1)+'. '+s.title+' — <em>'+s.character+'</em></h3><p class=small>'+s.situation.join(" • ")+'</p><p>'+s.narrative+'</p><div class=kjv>"'+s.kjv.text+'" — <a href="'+s.kjv.url+'" target=_blank>'+s.kjv.citation+'</a></div><p><b>Actions:</b><ul>'+s.actions.map(a=>'<li>'+a+'</li>').join('')+'</ul></p><p><b>Outcome:</b> '+s.outcome+' '+(s.outcomeCitation?'<a href="'+s.outcomeCitation.url+'" target=_blank>('+s.outcomeCitation.citation+')</a>':'')+'</p><p><b>Strategy: '+s.strategy.name+'</b><ol class=strategySteps>'+s.strategy.steps.map(st=>'<li>'+st+'</li>').join('')+'</ol></p><p class=small>Provenance: <a href="'+s.kjv.canonical+'" target=_blank>'+s.kjv.canonical+'</a></p></div>';
    });
    if(data.bestStrategicPlan){
      html+='<div class="card outCard" style="border:2px solid var(--maroon);background:linear-gradient(135deg,#FEF2F2,#FFFBEB)"><h3 style="color:var(--maroon)">★★★ Best Strategic Plan</h3><p><em>'+data.bestStrategicPlan.title+'</em><br/><span class=small>Based on: '+data.bestStrategicPlan.basedOn.join(' • ')+'</span></p><ol>'+data.bestStrategicPlan.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol><p class=small>'+data.bestStrategicPlan.closing+'</p></div>';
    }
    html+='<p class=small>'+data.disclaimer+'</p>';
  }
  out.innerHTML=html;
  out.querySelectorAll('.outCard').forEach((el,i)=>{el.style.opacity='0'; setTimeout(()=>{el.style.transition='opacity 0.3s, transform 0.3s'; el.style.opacity='1'}, 30+i*40)});
}

// init gallery
renderGallery();
</script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  setSecurityHeaders(res);
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning" });
    return res.end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, ngrok-skip-browser-warning");

  // Rate limit every request
  if (!checkRateLimit(req, res)) return;

  // Validate URL length (prevent abuse)
  if (req.url && req.url.length > 2000) {
    return json(res, 414, { error: "Request too long.", hint: "Keep your prompt under 600 characters." });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(htmlHome());
  }
  if (url.pathname === "/health") return json(res, 200, { ok: true, stories: STORIES.length, canonical: "https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)" });
  if (url.pathname === "/stories") return json(res, 200, { count: STORIES.length, stories: STORIES.map(s => ({ id: s.id, title: s.title, character: s.character, tags: s.situationTags })) });
  // Static assets — logo + prompting guide
  if (url.pathname === "/Assets/logo_main.png" || url.pathname === "/assets/logo_main.png" || url.pathname === "/logo.png" || url.pathname === "/logo_main.png") {
    return serveStaticFile(res, path.join(__dirname, "../Assets/logo_main.png"), "image/png");
  }
  if (url.pathname === "/docs/Prompting_Guide.pdf" || url.pathname === "/Prompting_Guide.pdf" || url.pathname === "/prompting_guide.pdf") {
    return serveStaticFile(res, path.join(__dirname, "../docs/Prompting_Guide.pdf"), "application/pdf");
  }

  if (url.pathname === "/counsel") {
    if (req.method === "GET") {
      const q = url.searchParams.get("q") || url.searchParams.get("query");
      const top = isValidTop(url.searchParams.get("top") || "3");
      const rawMode = url.searchParams.get("mode") || url.searchParams.get("m") || null;
      const mode = rawMode ? isValidMode(rawMode) : null;
      // Detect invalid mode as injection attempt
      if (rawMode && mode === null) {
        return json(res, 400, { blocked: true, mode: "bounce", reason: "invalid_mode", message: "Invalid mode. Use auto, stories, or verses. " + "I am Your Bible Counselor — I help with life situations through KJV 1769 wisdom." });
      }
      const llm = url.searchParams.get("llm") === "1";
      if (!q) return json(res, 400, { error: "Missing ?q=your situation" });
      if (llm) {
        // llm-prompt is sensitive — sanitize and bound
        setSecurityHeaders(res);
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end(buildLLMPrompt(q));
      }
      const result = counsel(q, { topN: top, mode });
      // If agent bounced, return 400 for injection/off-topic so client shows bounce UI
      if (result.blocked) return json(res, 400, result);
      return json(res, 200, result);
    }
    if (req.method === "POST") {
      let body = "";
      let tooLarge = false;
      req.on("data", chunk => {
        body += chunk;
        if (body.length > 10_000) { tooLarge = true; }
      });
      req.on("end", () => {
        if (tooLarge) return json(res, 413, { error: "Payload too large. Keep prompt under 600 characters." });
        try {
          const data = JSON.parse(body);
          const q = data.query || data.q || data.prompt;
          if (!q) return json(res, 400, { error: "Missing query field" });
          const top = isValidTop(data.topN || data.top || "3");
          const rawMode = data.mode || data.m || null;
          const mode = rawMode ? isValidMode(rawMode) : null;
          if (rawMode && mode === null) return json(res, 400, { blocked: true, mode: "bounce", reason: "invalid_mode", message: "Invalid mode. Use auto, stories, or verses." });
          const result = counsel(q, { topN: top, mode });
          if (result.blocked) return json(res, 400, result);
          return json(res, 200, result);
        } catch (e) {
          return json(res, 400, { error: "Invalid JSON: " + e.message });
        }
      });
      return;
    }
  }

  if (url.pathname === "/llm-prompt") {
    const q = url.searchParams.get("q");
    if (!q) return json(res, 400, { error: "Missing ?q=" });
    // Bound length before building prompt
    if (q.length > 600) return json(res, 400, { error: "Prompt too long. Keep under 600 characters." });
    const result = buildLLMPrompt(q);
    // If buildLLMPrompt bounced, return bounce as plain text
    setSecurityHeaders(res);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(result);
  }

  json(res, 404, { error: "Not found", try: ["/", "/counsel?q=...", "/stories", "/health"] });
});

server.listen(PORT, () => {
  console.log(`Your Bible Counselor running at http://localhost:${PORT}`);
  console.log(`Canonical KJV: https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)`);
  console.log(`Try: curl "http://localhost:${PORT}/counsel?q=cave%20of%20Adullam%20fleeing"`);
});
