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
<link rel="icon" href="/Assets/favicon.ico" type="image/x-icon">
<link rel="icon" href="/Assets/favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/Assets/apple-touch-icon.png" sizes="180x180">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#FDFCF8;
  --bg-soft:#FFF7ED;
  --surface:#FFFFFF;
  --surface-2:#F9F6F0;
  --surface-3:#F1EDE8;
  --ink:#1E293B;
  --ink-2:#334155;
  --muted:#6B7280;
  --faint:#9CA3AF;
  --border:#E7E0D6;
  --border-strong:#D6CFC2;
  --primary:#6B1F2A;
  --primary-hover:#8B2D2B;
  --primary-soft:#FDF2F2;
  --primary-ring:rgba(107,31,42,0.13);
  --accent:#8B5E34;
  --accent-soft:#FDF6E3;
  --accent-ring:rgba(139,94,52,0.13);
  --success:#2E5E4E;
  --success-soft:#E8F5F0;
  --success-ring:rgba(46,94,78,0.13);
  --radius:14px;
  --radius-lg:18px;
  --radius-xl:22px;
  --radius-pill:999px;
  --shadow-xs:0 1px 2px rgba(15,23,42,0.04);
  --shadow-sm:0 2px 8px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04);
  --shadow-md:0 4px 16px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.06);
  --shadow-lg:0 12px 32px rgba(15,23,42,0.08), 0 32px 64px rgba(15,23,42,0.10);
  --ease:cubic-bezier(0.16,1,0.3,1);
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#0B0F14;
    --bg-soft:#0F172A;
    --surface:#111A23;
    --surface-hover:#1A2532;
    --surface-2:#1E2D3D;
    --ink:#F1F5F9;
    --ink-soft:#E2E8F0;
    --muted:#94A3B8;
    --subtle:#64748B;
    --border:#1E293B;
    --border-strong:#334155;
  }
  .kjv{background:linear-gradient(180deg, #1E293B 0%, #0F172A 100%) !important;border-color:#334155 !important;color:#F1F5F9 !important}
  .modeTips{background:#1E2D3D !important;border-color:#1E293B !important;color:#F1F5F9 !important}
  .badge{background:#1E2D3D !important;border-color:#1E293B !important;color:#F1F5F9 !important}
  textarea{background:#111A23 !important;color:#F1F5F9 !important}
}
[data-theme="dark"]{
  --bg:#0B0F14;
  --bg-soft:#0F172A;
  --surface:#111A23;
  --surface-hover:#1A2532;
  --surface-2:#1E2D3D;
  --ink:#F1F5F9;
  --ink-soft:#E2E8F0;
  --muted:#94A3B8;
  --subtle:#64748B;
  --border:#1E293B;
  --border-strong:#334155;
}
[data-theme="dark"] .kjv{background:linear-gradient(180deg, #1E293B 0%, #0F172A 100%) !important;border-color:#334155 !important;color:var(--ink) !important}
[data-theme="dark"] .kjv a{color:#93C5FD}
[data-theme="dark"] .modeTips{background:var(--surface-2) !important;border-color:var(--border) !important;color:var(--ink) !important}
[data-theme="dark"] .modeTips.verses{background:#0F2A1F !important;border-color:#14532D !important}
[data-theme="dark"] .modeTips.stories{background:#2A1111 !important;border-color:#7C2D2B !important}
[data-theme="dark"] .modeTips.auto{background:#2A2111 !important;border-color:#8B5E34 !important}
[data-theme="dark"] .modeTips code{background:var(--surface) !important;border-color:var(--border) !important;color:var(--ink) !important}
[data-theme="dark"] .badge{background:var(--surface-2) !important;border-color:var(--border) !important;color:var(--ink) !important}
[data-theme="dark"] .badge.gold{background:linear-gradient(180deg, #2A2111 0%, #3B2F14 100%) !important;border-color:#8B5E34 !important;color:#FDE68A !important}
[data-theme="dark"] .promptCard{background:color-mix(in srgb, var(--surface) 96%, transparent) !important}
[data-theme="dark"] .archCard{border-color:var(--border) !important}
[data-theme="dark"] textarea{background:var(--surface) !important;color:var(--ink) !important}
[data-theme="dark"] textarea::placeholder{color:var(--subtle) !important}
[data-theme="light"]{
  --bg:#FDFCF8;
  --bg-soft:#FFF7ED;
  --surface:#FFFFFF;
  --surface-hover:#F9F6F0;
  --surface-2:#F9F6F0;
  --ink:#1E293B;
  --ink-soft:#334155;
  --muted:#6B7280;
  --subtle:#9CA3AF;
  --border:#E7E0D6;
  --border-strong:#D6CFC2;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility}
body{margin:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;overflow-x:hidden}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
::selection{background:rgba(124,10,2,0.12)}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(520px) rotate(720deg);opacity:0}}
@keyframes pulseSoft{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
/* Header — intense maroon for brand */
.siteHeader{position:sticky;top:0;z-index:40;background:var(--primary);border-bottom:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 16px rgba(107,31,42,0.18);transition:background 0.2s, border-color 0.2s}
.siteHeader .inner{max-width:1120px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-0.01em;color:white;text-decoration:none}
.brand img{width:32px;height:32px;border-radius:10px;object-fit:contain;background:transparent;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18))}
.brand span{font-family:'Fraunces',serif;font-size:14px;color:white}
.brand span small{color:rgba(255,255,255,0.72) !important}
.navLinks{display:flex;align-items:center;gap:8px}
.navLink{padding:7px 12px;border-radius:var(--radius-pill);font-size:12px;font-weight:600;color:rgba(255,255,255,0.88);border:1px solid rgba(255,255,255,0.14);transition:all 0.15s}
.navLink:hover{color:white;background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.22);text-decoration:none}
.themeToggle{width:32px;height:32px;display:grid;place-items:center;border-radius:var(--radius-pill);border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.10);color:white;cursor:pointer;transition:all 0.15s}
.themeToggle:hover{color:white;border-color:rgba(255,255,255,0.28);background:rgba(255,255,255,0.16);transform:translateY(-1px)}
/* Hero */
.hero{position:relative;overflow:hidden;background:
  radial-gradient(900px 500px at 12% -10%, rgba(180,83,9,0.14), transparent 60%),
  radial-gradient(800px 600px at 92% 10%, rgba(124,10,2,0.10), transparent 60%),
  radial-gradient(700px 400px at 50% 120%, rgba(6,95,70,0.08), transparent 60%),
  linear-gradient(180deg, var(--bg-soft) 0%, var(--bg) 65%);
  border-bottom:1px solid var(--border);
}
.hero::before{content:'';position:absolute;inset:0;background:
  linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px);
  background-size:32px 32px;mask:radial-gradient(900px 500px at 50% 0%, black 30%, transparent 72%);opacity:0.6;pointer-events:none}
.heroInner{max-width:760px;margin:0 auto;padding:36px 18px 28px;text-align:center;position:relative}
.heroLogo{width:112px;height:auto;display:block;margin:0 auto 14px;filter:drop-shadow(0 12px 24px rgba(15,23,42,0.12));animation:fadeUp 0.6s var(--ease)}
.hero h1{font-family:'Cinzel',serif;font-size:32px;line-height:1;letter-spacing:0.5px;margin:0;font-weight:600;color:var(--ink);animation:fadeUp 0.6s 0.08s both}
.hero h1 span{font-style:italic;font-weight:600;color:var(--primary)}
.hero .sub{max-width:560px;margin:10px auto 0;font-size:15px;line-height:1.5;color:var(--muted);animation:fadeUp 0.6s 0.14s both}
.badgeRow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px;animation:fadeUp 0.6s 0.2s both}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:var(--radius-pill);font-size:11px;font-weight:700;letter-spacing:0.02em;border:1px solid var(--border);background:var(--surface);color:var(--ink);box-shadow:var(--shadow-xs)}
.badge.gold{background:linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%);border-color:#FDE68A;color:#92400E}
.badge.muted{color:var(--muted);background:var(--surface-2)}
.heroCtas{display:flex;gap:10px;justify-content:center;margin-top:18px;animation:fadeUp 0.6s 0.26s both}
.floatingDot{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--primary);opacity:0.12;animation:float 6s ease-in-out infinite}
/* Shell */
.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
.sectionGap{height:18px}
/* Prompt Card — glass + depth */
.promptCard{
  margin:-18px auto 18px;max-width:860px;
  background:color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter:blur(16px) saturate(1.1);
  border:1px solid var(--border);
  border-radius:var(--radius-xl);
  box-shadow:var(--shadow-lg);
  padding:18px;
  position:relative;z-index:2;
  animation:pop 0.5s var(--ease);
}
.promptHead{display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:12px}
.promptHead h2{margin:0;font-family:'Fraunces',serif;font-size:18px;letter-spacing:-0.02em;color:var(--ink);line-height:1.2}
.promptHead p{margin:4px 0 0;color:var(--muted);font-size:13px;line-height:1.4}
.promptHead .headIcon{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:var(--primary-soft);color:var(--primary);border:1px solid #FECACA;flex:0 0 auto}
.guideLink{font-size:12px;font-weight:600;white-space:nowrap}
.modeLabel{font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--primary);display:flex;align-items:center;gap:6px;margin:12px 0 8px}
.modeLabel::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 6px var(--primary-ring);animation:pulseSoft 2s infinite}
.modeToggle{position:relative;display:flex;gap:2px;padding:4px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-pill);width:fit-content;max-width:100%;overflow:auto;scrollbar-width:none}
.modeToggle::-webkit-scrollbar{display:none}
.modeToggle button{position:relative;z-index:1;border:0;padding:8px 14px;border-radius:var(--radius-pill);font-weight:700;font-size:12px;cursor:pointer;background:transparent;color:var(--muted);transition:color 0.18s;white-space:nowrap}
.modeToggle button.active{color:var(--ink)}
.modeIndicator{position:absolute;top:4px;bottom:4px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-pill);box-shadow:var(--shadow-sm);transition:transform 0.28s var(--ease), width 0.28s var(--ease);will-change:transform,width}
.modeToggle:has([data-mode='stories'].active) .modeIndicator{border-color:var(--primary);box-shadow:0 2px 8px rgba(124,10,2,0.08)}
.modeToggle:has([data-mode='verses'].active) .modeIndicator{border-color:var(--success);box-shadow:0 2px 8px rgba(6,95,70,0.08)}
.modeTips{margin:10px 0 12px;padding:10px 12px;border-radius:12px;border:1px dashed var(--border);background:var(--surface-2);font-size:12px;line-height:1.5;transition:all 0.2s}
.modeTips.verses{border-color:var(--success);background:var(--success-soft)}
.modeTips.stories{border-color:var(--primary);background:var(--primary-soft)}
.modeTips.auto{border-color:#F59E0B;background:var(--accent-soft)}
.modeTips code{background:var(--surface);padding:2px 6px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;border:1px solid var(--border)}
.textWrap{position:relative}
textarea{
  width:100%;min-height:112px;max-height:220px;
  padding:14px 44px 14px 16px;
  border:1.5px solid var(--border);border-radius:14px;
  font-size:15px;line-height:1.5;font-family:'Inter',sans-serif;
  resize:none;outline:none;transition:border-color 0.15s, box-shadow 0.15s, background 0.15s;
  background:var(--surface);color:var(--ink);
}
textarea::placeholder{color:var(--subtle)}
textarea:focus{border-color:var(--primary);box-shadow:0 0 0 4px var(--primary-ring);background:var(--surface)}
.textMeta{position:absolute;right:10px;bottom:10px;display:flex;gap:6px;align-items:center}
.charCount{font-size:11px;font-weight:600;color:var(--subtle);padding:2px 6px;border-radius:var(--radius-pill);background:var(--surface-2);border:1px solid var(--border)}
.charCount.warn{color:var(--accent);border-color:#FDE68A;background:var(--accent-soft)}
.charCount.over{color:#B91C1C;border-color:#FECACA;background:#FEF2F2}
.clearBtn{width:28px;height:28px;display:grid;place-items:center;border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;font-size:14px;line-height:1;transition:all 0.15s}
.clearBtn:hover{color:var(--ink);border-color:var(--border-strong);background:var(--surface-hover)}
.promptAction{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:14px}
.btn{border:0;padding:10px 16px;border-radius:var(--radius-pill);font-weight:700;font-size:13px;cursor:pointer;transition:transform 0.12s, box-shadow 0.12s, filter 0.12s, background 0.15s, border-color 0.15s;display:inline-flex;align-items:center;gap:8px;justify-content:center;white-space:nowrap}
.btn:active{transform:translateY(1px) scale(0.98)}
.btnPrimary{background:linear-gradient(180deg, var(--primary) 0%, #5A0A0A 100%);color:white;box-shadow:0 6px 16px rgba(124,10,2,0.24), 0 2px 4px rgba(124,10,2,0.2);min-height:40px}
.btnPrimary:hover{filter:brightness(1.06);box-shadow:0 8px 20px rgba(124,10,2,0.28)}
.btnGhost{background:var(--surface);border:1px solid var(--border);color:var(--ink);box-shadow:var(--shadow-xs)}
.btnGhost:hover{border-color:var(--border-strong);background:var(--surface-hover);transform:translateY(-1px);box-shadow:var(--shadow-sm)}
.btnGreen{background:linear-gradient(180deg, var(--success) 0%, #064E3B 100%);color:white;box-shadow:0 6px 16px rgba(6,95,70,0.20)}
.examplesRow{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.examplesRow .label{font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--subtle)}
.modeBadge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:var(--radius-pill);font-size:11px;font-weight:700;letter-spacing:0.02em;border:1px solid var(--border);background:var(--surface-2);color:var(--muted)}
.modeBadge.verse{color:var(--success);border-color:var(--success);background:var(--success-soft)}
.modeBadge.story{color:var(--primary);border-color:var(--primary);background:var(--primary-soft)}
.modeBadge.auto{color:var(--accent);border-color:#F59E0B;background:var(--accent-soft)}
/* Results */
#out{max-width:860px;margin:16px auto}
.kjv{font-style:italic;background:linear-gradient(180deg, #FFFBEB 0%, #FFF7ED 100%);border-left:3px solid #F59E0B;padding:12px 14px;border-radius:0 12px 12px 0;border-top:1px solid #FDE68A;border-right:1px solid #FDE68A;border-bottom:1px solid #FDE68A}
.small{font-size:11px;color:var(--muted);line-height:1.4}
.outCard{animation:fadeUp 0.4s var(--ease);border-radius:var(--radius-lg);overflow:hidden}
.outCard h3{margin:0 0 6px;font-size:15px;letter-spacing:-0.01em}
.strategySteps{margin:8px 0 0;padding-left:18px}
.strategySteps li{margin:6px 0;font-size:13px;line-height:1.5}
.resultMeta{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.metaPill{font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:4px 8px;border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface-2);color:var(--muted)}
.copyBtn{margin-left:auto;padding:6px 10px;border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface);font-size:11px;font-weight:700;cursor:pointer;color:var(--muted)}
.copyBtn:hover{color:var(--ink);border-color:var(--border-strong)}
/* Gallery */
.galleryHead{display:flex;align-items:end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:28px 0 14px}
.galleryHead h2{margin:0;font-family:'Cinzel',serif;font-size:20px;letter-spacing:0.2px;color:var(--ink)}
.filterBar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.filterBar input, .filterBar select{padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-pill);font-size:13px;outline:none;background:var(--surface);color:var(--ink);min-width:200px;transition:border-color 0.15s, box-shadow 0.15s}
.filterBar input:focus, .filterBar select:focus{border-color:var(--primary);box-shadow:0 0 0 4px var(--primary-ring)}
.filterBar input{padding-left:36px;background-image:url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.2-4.2' stroke='%2364748B' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:12px center}
.stats{font-size:12px;color:var(--muted);margin-top:4px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.archCard{
  padding:16px 16px 14px;cursor:pointer;position:relative;overflow:hidden;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
  box-shadow:var(--shadow-xs);transition:transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s;
}
.archCard::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg, #F59E0B, var(--primary), var(--success));opacity:0;transition:opacity 0.18s}
.archCard:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--border-strong)}
.archCard:hover::after{opacity:1}
.archCard:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.archTop{font-size:10px;font-weight:700;letter-spacing:0.06em;color:var(--primary);text-transform:uppercase;display:flex;align-items:center;gap:6px}
.archTop::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--primary);opacity:0.9}
.archTitle{font-weight:700;font-size:13.5px;line-height:1.35;margin:6px 0 4px;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:36px}
.archChar{font-size:12px;color:var(--muted);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.tag{font-size:10px;font-weight:600;padding:4px 8px;border-radius:var(--radius-pill);background:var(--surface-2);border:1px solid var(--border);color:var(--muted);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tag.more{background:var(--ink);color:white;border-color:var(--ink)}
.archCta{margin-top:10px;font-size:11px;font-weight:700;color:var(--primary);display:flex;align-items:center;gap:6px}
.archCta span{transition:transform 0.15s var(--ease)} .archCard:hover .archCta span{transform:translateX(4px)}
.showMore{display:flex;justify-content:center;margin:18px 0}
.countPill{background:var(--ink);color:white;padding:8px 14px;border-radius:var(--radius-pill);font-size:12px;font-weight:700;box-shadow:var(--shadow-sm)}
.confetti{position:fixed;top:-10px;width:8px;height:14px;border-radius:2px;pointer-events:none;z-index:9999;animation:confettiFall 1.2s var(--ease) forwards}
.footer{margin:36px 0 28px;text-align:center;color:var(--muted);font-size:12px;line-height:1.6}
.footer a{color:var(--muted);text-decoration:underline;text-underline-offset:3px}
.footer a:hover{color:var(--ink)}
.loadingDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--primary);margin:0 2px;animation:float 0.8s ease-in-out infinite}
.loadingDot:nth-child(2){animation-delay:0.15s} .loadingDot:nth-child(3){animation-delay:0.3s}
.skeleton{height:12px;background:linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;border-radius:8px}
@media (max-width:720px){
  .heroInner{padding:28px 16px 22px}
  .hero h1{font-size:28px}
  .promptCard{margin:-14px auto 16px;padding:16px}
  .grid{grid-template-columns:1fr}
  .filterBar input{min-width:0;flex:1 1 100%}
  .promptAction{flex-direction:column;align-items:stretch}
  .promptAction .btnPrimary{width:100%}
  .siteHeader .inner{padding:10px 14px}
}
</style>
</head>
<body>
<div class="hero">
  <div class="floatingDot" style="top:18%;left:8%;animation-delay:0s"></div>
  <div class="floatingDot" style="top:22%;right:10%;animation-delay:1.2s"></div>
  <div class="floatingDot" style="bottom:18%;left:14%;animation-delay:0.6s"></div>
  <div class="heroInner">
    <img src="Assets/logo_main.png" alt="Your Bible Counselor logo" style="width:120px;height:auto;background:transparent;border-radius:0;padding:0;filter:drop-shadow(0 10px 28px rgba(15,23,42,0.14));margin:0 auto 14px;display:block">
    <h1>Your <span>Bible Counselor</span></h1>
    <p class="sub">Simple, proven wisdom for every part of your life.</p>
    <div class="badgeRow">
      <span class="badge gold">✦ ${STORY_COUNT} Biblical Scenarios</span>
      <span class="badge">📜 ${VERSE_COUNT} Verses</span>
      <span class="badge muted">✓ Wikisource Provenance</span>
    </div>
    <div class="heroCtas">
      <a class="btn btnPrimary" href="#promptCard" style="text-decoration:none">✦ Seek Counsel</a>
      <a class="btn btnGhost" href="#gallery" style="text-decoration:none">Explore scenarios ↓</a>
    </div>
  </div>
</div>

<div class="wrap">
  <div class="card promptCard" id="promptCard">
    <h2>What do you need today?</h2>
    <p>Pick a mode — see live prompting tips — then Seek Counsel. <b>Auto</b> detects, or force <b>Stories</b> / <b>Verses</b>.</p>
    <p class="small" style="margin:-4px 0 10px">📖 New here? <a href="/docs/Prompting_Guide.pdf" target="_blank" style="font-weight:700">Read the Prompting Guide</a> — get the most out of it.</p>
    <div class="small" style="margin:0 0 6px;color:var(--maroon);font-weight:700;display:flex;align-items:center;gap:6px;animation:fadeUp 0.7s 0.15s both">👉 Select preferred mode:</div>
    <div class="modeToggle" role="tablist" aria-label="Prompt mode">
      <button data-mode="auto" class="active" onclick="setMode('auto')" aria-selected="true">⚡ Auto</button>
      <button data-mode="stories" onclick="setMode('stories')">📖 Stories</button>
      <button data-mode="verses" onclick="setMode('verses')">📜 Verses</button>
    </div>
    <div id="modeTips" class="modeTips auto">
      <strong>⚡ Auto —</strong> Describe a situation <em>or</em> ask for verses. E.g. <code>10 verses about diligence</code> or <code>I am in a cave like David at Adullam</code> — we auto-detect, never muddle. Tip: include a number + "verses" for verses; include emotion/situation for stories.
    </div>
    <div class="textWrap">
      <textarea id="q" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="true" placeholder="Try: 10 verses about peace  — or —  I feel forgotten like Joseph in prison..."></textarea>
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
const charCountEl = document.getElementById('charCount');
const clearBtnEl = document.getElementById('clearBtn');
function updateCharCount(){
  const len = qEl.value.length;
  if (charCountEl) {
    charCountEl.textContent = len + ' / 600';
    charCountEl.classList.toggle('warn', len > 480 && len <= 580);
    charCountEl.classList.toggle('over', len > 580);
  }
  if (clearBtnEl) clearBtnEl.style.display = len > 0 ? 'grid' : 'none';
  qEl.style.height = 'auto';
  qEl.style.height = Math.min(qEl.scrollHeight, 260) + 'px';
}
qEl.addEventListener('input', () => { updateBadge(); updateCharCount(); });
qEl.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(); }
});
if (clearBtnEl) {
  clearBtnEl.addEventListener('click', () => { qEl.value=''; updateBadge(); updateCharCount(); qEl.focus(); });
  clearBtnEl.style.display = 'none';
}
qEl.value = '';
try { if (sessionStorage.getItem('bc_q')) sessionStorage.removeItem('bc_q'); } catch(e){}
window.addEventListener('pageshow', () => { qEl.value = ''; updateBadge(); updateCharCount(); });
qEl.addEventListener('focus', () => { /* placeholder auto-hides on typing */ });
updateBadge();
updateCharCount();

// Theme switcher — persists, respects system, intense maroon header stays maroon in both themes
const themeToggle = document.getElementById('themeToggle');
function getPreferredTheme(){
  try { const s = localStorage.getItem('bc_theme'); if (s) return s; } catch(e){}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('bc_theme', t); } catch(e){}
  if (themeToggle) {
    themeToggle.textContent = t === 'dark' ? '☀' : '◐';
    themeToggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.title = t === 'dark' ? 'Switch to light' : 'Switch to dark';
  }
}
applyTheme(getPreferredTheme());
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}

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
  // Static assets — logo + prompting guide + favicon
  if (url.pathname === "/Assets/logo_main.png" || url.pathname === "/assets/logo_main.png" || url.pathname === "/logo.png" || url.pathname === "/logo_main.png") {
    return serveStaticFile(res, path.join(__dirname, "../Assets/logo_main.png"), "image/png");
  }
  if (url.pathname === "/favicon.ico" || url.pathname === "/Assets/favicon.ico" || url.pathname === "/assets/favicon.ico") {
    return serveStaticFile(res, path.join(__dirname, "../Assets/favicon.ico"), "image/x-icon");
  }
  if (url.pathname === "/favicon.png" || url.pathname === "/Assets/favicon.png" || url.pathname === "/assets/favicon.png") {
    return serveStaticFile(res, path.join(__dirname, "../Assets/favicon.png"), "image/png");
  }
  if (url.pathname === "/apple-touch-icon.png" || url.pathname === "/Assets/apple-touch-icon.png" || url.pathname === "/assets/apple-touch-icon.png") {
    return serveStaticFile(res, path.join(__dirname, "../Assets/apple-touch-icon.png"), "image/png");
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
