// Build static site — single-file dist/index.html with client-side counsel (no server)
// For Render Static Site (free, CDN, no sleep)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { STORIES } from "../data/stories.js";
import { VERSES } from "../data/verses.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../dist");
const outFile = path.join(outDir, "index.html");

const allStoriesJson = JSON.stringify(STORIES.map(s=>({id:s.id,title:s.title,character:s.character,tags:s.situationTags,book:s.book,chapter:s.chapter,verses:s.verses})));
const versesJson = JSON.stringify(VERSES);
const storiesFullJson = JSON.stringify(STORIES);
const STORY_COUNT = STORIES.length;
const VERSE_COUNT = VERSES.length;

const html = `<!doctype html>
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
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0.92);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(139,0,0,0.18)}50%{box-shadow:0 0 0 10px rgba(139,0,0,0)}}
@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(400px) rotate(720deg);opacity:0}}
@keyframes scrollReveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
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
.promptAction{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;padding:10px 12px;background:#F9FAFB;border:1px solid var(--border);border-radius:12px}
.promptAction .btnPrimary{animation:none;box-shadow:0 4px 12px rgba(139,0,0,0.22);padding:11px 22px;font-size:14px}
.promptAction .small{font-size:11px}
.examplesRow{margin-top:10px;padding-top:8px;border-top:1px solid #F3F4F6}
.examplesRow .label{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:0.4px;text-transform:uppercase;margin-right:4px;align-self:center}
.modeBadge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.3px;border:1px solid var(--border);background:#F9FAFB}
.modeBadge.verse{color:var(--green);border-color:var(--green);background:#ECFDF5}
.modeBadge.story{color:var(--maroon);border-color:var(--maroon);background:#FEF2F2}
.modeBadge.auto{color:#8B5A00;border-color:var(--gold2);background:#FFFBEB}
#out{max-width:980px;margin:14px auto}
.kjv{font-style:italic;background:#FDF6E3;border-left:4px solid var(--gold);padding:10px 12px;border-radius:0 10px 10px 0}
.small{font-size:11px;color:var(--muted)}
.outCard{animation:fadeUp 0.35s ease}
.outCard h3{margin:0 0 6px;font-size:15px}
.strategySteps li{margin:4px 0}
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
.showMore{display:flex;justify-content:center;margin:14px 0}
.countPill{background:var(--ink);color:white;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700}
.confetti{position:fixed;top:-10px;width:8px;height:14px;border-radius:2px;pointer-events:none;z-index:9999;animation:confettiFall 1.2s ease forwards}
.footer{margin:28px 0 24px;text-align:center;color:var(--muted);font-size:11px}
.loadingDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--maroon);margin:0 2px;animation:float 0.8s infinite}
.loadingDot:nth-child(2){animation-delay:0.15s} .loadingDot:nth-child(3){animation-delay:0.3s}
@media (max-width:640px){.hero h1{font-size:24px}.grid{grid-template-columns:1fr 1fr} .filterBar input{min-width:140px} .promptAction{flex-direction:column;align-items:stretch} .promptAction .btnPrimary{width:100%;justify-content:center}}
</style>
</head>
<body>
<div class="hero">
  <div class="floatingEmojis e1">📖</div><div class="floatingEmojis e2">✦</div><div class="floatingEmojis e3">🕊️</div><div class="floatingEmojis e4">🔥</div>
  <img src="Assets/logo_main.png" alt="Your Bible Counselor logo" style="width:130px;height:auto;background:white;border-radius:18px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.18);margin:0 auto 14px;display:block">
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
    <p class="small" style="margin:-4px 0 10px">📖 New here? <a href="docs/Prompting_Guide.pdf" target="_blank" style="font-weight:700">Read the Prompting Guide</a> — get the most out of it.</p>
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
      <input id="archSearch" placeholder="Filter scenarios… e.g., fear, diligence, debt" oninput="filterGallery()"/>
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
const ALL_STORIES_META = ${allStoriesJson};
const STORIES_FULL = ${storiesFullJson};
const VERSES_RAW = ${versesJson};
const STORY_COUNT = STORIES_FULL.length;
const VERSE_COUNT = VERSES_RAW.length;

// --- Provenance (client) ---
const WIKISOURCE_BASE = "https://en.wikisource.org/wiki";
const KJV_CANONICAL = "The_Holy_Bible_(King_James_Version,_1769)";
const BOOK_SLUGS = {"Genesis":"Genesis","Exodus":"Exodus","Leviticus":"Leviticus","Numbers":"Numbers","Deuteronomy":"Deuteronomy","Joshua":"Joshua","Judges":"Judges","Ruth":"Ruth","1 Samuel":"1_Samuel","2 Samuel":"2_Samuel","1 Kings":"1_Kings","2 Kings":"2_Kings","1 Chronicles":"1_Chronicles","2 Chronicles":"2_Chronicles","Ezra":"Ezra","Nehemiah":"Nehemiah","Esther":"Esther","Job":"Job","Psalms":"Psalms","Psalm":"Psalms","Proverbs":"Proverbs","Ecclesiastes":"Ecclesiastes","Song of Solomon":"Song_of_Solomon","Isaiah":"Isaiah","Jeremiah":"Jeremiah","Lamentations":"Lamentations","Ezekiel":"Ezekiel","Daniel":"Daniel","Hosea":"Hosea","Joel":"Joel","Amos":"Amos","Obadiah":"Obadiah","Jonah":"Jonah","Micah":"Micah","Nahum":"Nahum","Habakkuk":"Habakkuk","Zephaniah":"Zephaniah","Haggai":"Haggai","Zechariah":"Zechariah","Malachi":"Malachi","Matthew":"Matthew","Mark":"Mark","Luke":"Luke","John":"John","Acts":"Acts","Romans":"Romans","1 Corinthians":"1_Corinthians","2 Corinthians":"2_Corinthians","Galatians":"Galatians","Ephesians":"Ephesians","Philippians":"Philippians","Colossians":"Colossians","1 Thessalonians":"1_Thessalonians","2 Thessalonians":"2_Thessalonians","1 Timothy":"1_Timothy","2 Timothy":"2_Timothy","Titus":"Titus","Philemon":"Philemon","Hebrews":"Hebrews","James":"James","1 Peter":"1_Peter","2 Peter":"2_Peter","1 John":"1_John","2 John":"2_John","3 John":"3_John","Jude":"Jude","Revelation":"Revelation"};
function normalizeBook(book){let b=book.trim().replace(/^1\\s*/i,"1 ").replace(/^2\\s*/i,"2 ").replace(/^3\\s*/i,"3 ");for(const [k,v] of Object.entries(BOOK_SLUGS)){if(k.toLowerCase()===b.toLowerCase()) return k;} return b;}
function getWikisourceUrl(book,chapter,verse=null){const slug=BOOK_SLUGS[normalizeBook(book)];if(!slug) throw new Error("Unknown book: "+book);let url=WIKISOURCE_BASE+"/Bible_(King_James)/"+slug+"#"+chapter;if(verse!==null) url+=":"+verse; return url;}
function getCanonicalReference(){return WIKISOURCE_BASE+"/"+KJV_CANONICAL;}
function formatCitation(book,chapter,verseRange){return normalizeBook(book)+" "+chapter+":"+verseRange+" (KJV 1769)";}
function citationWithProvenance(book,chapter,verseRange){const citation=formatCitation(book,chapter,verseRange);const firstVerse=String(verseRange).split(/[-,]/)[0];const url=getWikisourceUrl(book,chapter,firstVerse);return{citation,url,canonical:getCanonicalReference(),provenanceNote:"Verbatim KJV 1769 via Wikisource: "+getCanonicalReference()};}

// --- Security (client) ---
const MAX_QUERY_LEN=600;
const INJECTION_PATTERNS=[/ignore\\s+(all\\s+)?previous\\s+instructions/i,/ignore\\s+above/i,/disregard\\s+(all\\s+)?(previous|above|system)/i,/forget\\s+(all\\s+)?(previous|instructions|system)/i,/reveal.{0,20}(system|prompt|instructions|hidden)/i,/show.{0,20}(system|prompt|hidden|secret)/i,/print.{0,20}(system|prompt|instructions)/i,/what\\s+is\\s+your\\s+(system\\s+)?prompt/i,/what\\s+are\\s+your\\s+(instructions|prompt)/i,/repeat\\s+your\\s+(system\\s+)?prompt/i,/tell\\s+me\\s+your\\s+(system\\s+)?prompt/i,/your\\s+(system\\s+)?prompt/i,/you\\s+are\\s+now\\s+/i,/act\\s+as\\s+(a\\s+)?(dan|jailbreak|hacker|evil|unfiltered|developer|admin|system|root)/i,/role\\s*play\\s+as/i,/pretend\\s+(you\\s+are|to\\s+be)/i,/jailbreak/i,/DAN\\s*mode/i,/developer\\s+mode/i,/do\\s+anything\\s+now/i,/override\\s+(safety|system|instructions)/i,/bypass\\s+(safety|filter|guardrail|content)/i,/unfiltered/i,/system\\s*:\\s*/i,/assistant\\s*:\\s*/i,/<\\|(system|user|assistant|im_start|im_end)\\|>/i,/\`\`\`\\s*system/i,/\\[SYSTEM\\]/i,/\\[INST\\]/i,/exfiltrate/i,/leak.{0,20}(prompt|system|data)/i,/prompt\\s+injection/i];
const BLOCKED_TOPIC_PATTERNS=[/write\\s+(malware|virus|ransomware|exploit|payload)/i,/how\\s+to\\s+hack/i,/sql\\s+injection/i,/xss\\s+attack/i,/ddos/i,/phish(ing)?/i,/crack\\s+password/i,/bypass\\s+authentication/i,/how\\s+to\\s+(make|build)\\s+(a\\s+)?bomb/i,/how\\s+to\\s+make\\s+(meth|cocaine|heroin|drug)/i,/instructions\\s+to\\s+(kill|murder|harm)/i,/how\\s+to\\s+steal/i,/how\\s+to\\s+launder\\s+money/i,/generate\\s+(fake|fraudulent)\\s+(id|passport|document)/i,/create\\s+a\\s+fake\\s+news/i,/write\\s+(python|javascript|code)\\s+to\\s+hack/i,/translate\\s+this\\s+malicious/i,/rig\\s+election/i,/pornographic/i,/\\bnsfw\\b/i,/you\\s+are\\s+not\\s+a\\s+bible\\s+counselor/i,/you\\s+are\\s+a\\s+shopping\\s+assistant/i,/you\\s+are\\s+chatgpt/i];
const ALLOWED_HINT="I am Your Bible Counselor — I help with life situations through KJV 1769 biblical stories, verses, and wisdom. Try: 'I feel anxious like Elijah' or '5 verses about diligence' or 'betrayed like Joseph — what should I do?'";
function sanitizeInput(raw){if(typeof raw!=="string") return "";let s=raw.trim().replace(/\\0/g,"").replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g,"").replace(/<[^>]*>/g," ").replace(/[<>]/g," ").replace(/\\s+/g," ");if(s.length>MAX_QUERY_LEN) s=s.slice(0,MAX_QUERY_LEN);return s;}
function detectInjection(q){for(const re of INJECTION_PATTERNS) if(re.test(q)) return {matched:true,pattern:re.source};if((q.match(/<\\|/g)||[]).length>0) return {matched:true,pattern:"suspicious"};if(/(ignore|disregard|forget).{0,20}instructions/i.test(q)&&q.length<200) return {matched:true,pattern:"instruction_override"};return {matched:false};}
function detectBlockedTopic(q){for(const re of BLOCKED_TOPIC_PATTERNS) if(re.test(q)) return {matched:true,pattern:re.source};return {matched:false};}
function validateQuery(raw){if(typeof raw==="string"&&raw.length>MAX_QUERY_LEN) return {ok:false,code:"too_long",message:"Please shorten your request to under "+MAX_QUERY_LEN+" characters.",sanitized:sanitizeInput(raw.slice(0,MAX_QUERY_LEN))};const q=sanitizeInput(raw);if(!q||q.length<3) return {ok:false,code:"too_short",message:"Please share a bit more — e.g., 'I feel burnt out like Elijah' or '5 verses about peace'.",sanitized:q};const inj=detectInjection(q);if(inj.matched) return {ok:false,code:"injection_blocked",pattern:inj.pattern,message:"That request looks like an attempt to change my instructions. "+ALLOWED_HINT,sanitized:q};const blocked=detectBlockedTopic(q);if(blocked.matched) return {ok:false,code:"off_topic_blocked",pattern:blocked.pattern,message:"I can only help with biblical counsel for life situations. "+ALLOWED_HINT,sanitized:q};if(!/[a-zA-Z]{3,}/.test(q)) return {ok:false,code:"gibberish",message:"I didn't catch that. "+ALLOWED_HINT,sanitized:q};return {ok:true,sanitized:q};}
function bounceResponse(query,reason,extra={}){return {query:query||"",mode:"bounce",blocked:true,reason,message:extra.message||ALLOWED_HINT,hint:ALLOWED_HINT,wikisourceCanonical:getCanonicalReference(),disclaimer:"All verses are KJV 1769. Verify verbatim at Wikisource: "+getCanonicalReference(),...extra};}

// --- Agent (client) ---
function isVerseQuery(query){const q=query.toLowerCase();if(/\\d+\\s*verses?/.test(q)) return true;if(q.includes("verse")||q.includes("scripture")||q.includes("what does the bible say")||q.includes("what does bible say")) return true;if(/\\b(bible|kjv).{0,20}verses?\\b/.test(q)) return true;if(/\\bverses?.{0,20}(about|on|for|that talk|talks about)\\b/.test(q)) return true;if(q.startsWith("list")&&q.includes("verse")) return true;if(q.includes("justify")&&q.includes("verse")) return true;return false;}
function extractTopicFromVerseQuery(query){let q=query;q=q.replace(/\\d+\\s*verses?/gi,"");q=q.replace(/bible verses?/gi,"");q=q.replace(/kjv/gi,"");q=q.replace(/verses?/gi,"");q=q.replace(/scriptures?/gi,"");q=q.replace(/that talks? about/gi," ");q=q.replace(/that talk about/gi," ");q=q.replace(/talks? about/gi," ");q=q.replace(/about/gi," ");q=q.replace(/on/gi," ");q=q.replace(/for/gi," ");q=q.replace(/what does the bible say/gi," ");q=q.replace(/what does bible say/gi," ");q=q.replace(/list/gi," ");q=q.replace(/give me/gi," ");q=q.replace(/provide/gi," ");q=q.replace(/to justify/gi," ");q=q.replace(/justify/gi," ");q=q.replace(/\\s+/g," ").trim();return q||query;}
function strategicInsightForVerse(v,topic){const t=topic.toLowerCase();if(t.includes("background")||t.includes("due diligence")||t.includes("vetting")||t.includes("check")) return "Due diligence insight: Verify before trusting — diligence is biblical stewardship.";if(t.includes("fear")||t.includes("anxiety")) return "Fear strategy: Replace fear with presence/trust — God with thee.";if(t.includes("wisdom")) return "Wisdom strategy: Ask, then obey — wisdom is applied, not just acquired.";if(t.includes("love")) return "Love strategy: Longsuffering, truth-rejoicing love outlasts offense.";if(t.includes("strength")||t.includes("weak")) return "Strength strategy: Grace sufficient — strength made perfect in weakness.";if(t.includes("money")||t.includes("steward")) return "Stewardship strategy: Diligence + just weight + counting cost.";return "Inspiration: This verse anchors "+topic+" in God's character and calls to action.";}
function getVerseCount(query){const m=query.toLowerCase().match(/(\\d+)\\s*verses?/);return m?parseInt(m[1],10):null;}
function searchVersesClient(query,n=5){
  const q=query.toLowerCase();
  const countMatch=q.match(/(\\d+)\\s*verses?/);
  const requested=countMatch?parseInt(countMatch[1],10):n;
  const cleaned=q.replace(/(\\d+)\\s*verses?( about| on| for| that talk about)?/gi,"").trim();
  const terms=cleaned.split(/[\\s,.;:!?\\/]+/).filter(t=>t.length>2);
  if(cleaned.length>2) terms.push(cleaned.toLowerCase());
  const scored=VERSES_RAW.map(v=>{
    let score=0;
    const hay=(v.text+" "+v.tags.join(" ")+" "+v.book).toLowerCase();
    const tagStr=v.tags.join(" ").toLowerCase();
    for(const t of terms){if(tagStr.includes(t)) score+=8; if(hay.includes(t)) score+=3; if(v.tags.some(tag=>tag.toLowerCase()===t)) score+=10;}
    if(cleaned&&tagStr.includes(cleaned.toLowerCase())) score+=20;
    if((q.includes("background")||q.includes("vetting")||q.includes("diligence")) && v.tags.some(x=>["background check","due diligence","vetting","diligent inquisition"].includes(x))) score+=15;
    return {v,score};
  });
  scored.sort((a,b)=>b.score-a.score);
  let top=scored.filter(x=>x.score>0).slice(0,requested).map(x=>x.v);
  if(top.length<requested){const remaining=scored.filter(x=>!top.includes(x.v)).slice(0,requested-top.length).map(x=>x.v);top=top.concat(remaining);}
  return top.slice(0,requested).map(v=>{
    const prov=citationWithProvenance(v.book,v.chapter,v.verses);
    return {...v,citation:prov.citation,url:prov.url,canonical:prov.canonical,provenanceNote:prov.provenanceNote};
  });
}
function searchStoriesClient(query,topN=3){
  if(!query) return STORIES_FULL.slice(0,topN);
  const q=query.toLowerCase();
  const terms=q.split(/[\\s,.;:!?]+/).filter(Boolean);
  const scored=STORIES_FULL.map(s=>{
    let score=0;
    const haystack=[s.title,s.character,s.summary,s.situationTags.join(" "),s.keywords.join(" "),s.strategy.name,s.strategy.steps.join(" ")].join(" ").toLowerCase();
    for(const t of terms){
      if(s.situationTags.some(tag=>tag.includes(t)||t.includes(tag))) score+=5;
      if(haystack.includes(t)) score+=2;
      if(s.keywords.some(k=>k.toLowerCase()===t)) score+=4;
    }
    if(s.situationTags.some(tag=>q.includes(tag))) score+=10;
    return {story:s,score};
  });
  scored.sort((a,b)=>b.score-a.score);
  const filtered=scored.filter(x=>x.score>0).slice(0,topN).map(x=>x.story);
  if(filtered.length===0) return [STORIES_FULL[0],STORIES_FULL[1],STORIES_FULL[4]];
  return filtered;
}
function counsel(query, options={}){
  const {topN=3, includeStrategyPlan=true, mode:forcedMode=null} = options;
  const validation=validateQuery(query||"");
  if(!validation.ok) return bounceResponse(query||"",validation.code,{message:validation.message,pattern:validation.pattern,sanitized:validation.sanitized});
  const safeQuery=validation.sanitized;
  const forced=forcedMode?String(forcedMode).toLowerCase():null;
  const useVerseMode=forced==="verses"||forced==="verse"?true:forced==="stories"||forced==="story"?false:isVerseQuery(safeQuery);
  if(useVerseMode){
    const requestedCount=getVerseCount(safeQuery)||(safeQuery.toLowerCase().includes("10 verse")?10:safeQuery.toLowerCase().includes("5 verse")?5:topN>3?topN:5);
    const n=Math.min(Math.max(requestedCount,1),20);
    const topic=extractTopicFromVerseQuery(safeQuery);
    const verses=searchVersesClient(safeQuery,n);
    const versesWithInsight=verses.slice(0,n).map(v=>({...v,strategicInsight:strategicInsightForVerse(v,topic)}));
    const strategicSummary="Strategic summary for \\""+topic+"\\": These "+versesWithInsight.length+" KJV 1769 verses form a verifiable chain — "+versesWithInsight.map(v=>v.citation).join(", ")+" — proving the Bible speaks directly to "+topic+". Read them as a counsel: prove, trust, obey, and watch God act. Verify each at "+getCanonicalReference();
    return {query:safeQuery,mode:"verses",topic,requestedCount:n,verses:versesWithInsight,count:versesWithInsight.length,strategicSummary,wikisourceCanonical:getCanonicalReference(),disclaimer:"All verses are KJV 1769. Verify verbatim at Wikisource: "+getCanonicalReference()};
  }
  const matched=searchStoriesClient(safeQuery,topN);
  // build provenance for stories
  function buildProv(s){const primary=citationWithProvenance(s.book,s.chapter,s.verses);const outcome=s.outcomeRef?citationWithProvenance(s.outcomeRef.book,s.outcomeRef.chapter,s.outcomeRef.verses):null;const cross=(s.crossRefs||[]).map(c=>citationWithProvenance(c.book,c.chapter,c.verses));return {primary,outcome,cross,canonical:getCanonicalReference()};}
  const stories=matched.map(s=>{
    const prov=buildProv(s);
    return {id:s.id,title:s.title,character:s.character,situation:s.situationTags,narrative:s.summary,kjv:{text:s.kjvText,citation:prov.primary.citation,url:prov.primary.url,canonical:prov.primary.canonical},actions:s.actions,outcome:s.outcome,outcomeCitation:prov.outcome?{citation:prov.outcome.citation,url:prov.outcome.url}:null,strategy:s.strategy,crossRefs:(s.crossRefs||[]).map((c,i)=>({note:c.note,citation:prov.cross[i].citation,url:prov.cross[i].url})),provenance:prov.primary.provenanceNote};
  });
  let bestStrategicPlan=null;
  if(includeStrategyPlan){
    const allSteps=stories.flatMap(s=>s.strategy.steps);
    bestStrategicPlan={title:'Best Biblical Strategic Plan for: "'+safeQuery+'"',basedOn:stories.map(s=>s.character+" — "+s.title+" ("+s.kjv.citation+")"),principle:"God uses the same archetypal path: "+stories.map(s=>s.character).join(", ")+" walked this. Your situation is not new.",steps:allSteps,closing:"For with God nothing shall be impossible. (Luke 1:37 KJV) — Verify all citations at: "+getCanonicalReference(),canonical:getCanonicalReference()};
  }
  return {query:safeQuery,mode:"stories",matchedCount:stories.length,stories,bestStrategicPlan,disclaimer:"All verses are KJV 1769. Verify verbatim at Wikisource: "+getCanonicalReference(),wikisourceCanonical:getCanonicalReference()};
}

// --- UI ---
const ALL_STORIES = ALL_STORIES_META;
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
  stats.textContent = 'Showing '+show+' of '+filtered.length+' (of '+STORY_COUNT+') — click any card to auto-prompt';
  document.getElementById('storyCountFoot').textContent = filtered.length+' filtered • '+STORY_COUNT+' total';
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
  if(!isVerse && !qEl.value.includes('verse')) badge.className='modeBadge auto';
}
qEl.addEventListener('input', updateBadge);
qEl.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(); }
});
updateBadge();
function example(t){document.getElementById('q').value=t;updateBadge();ask();}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function burstConfetti(){
  const colors=['#8B0000','#DAA520','#1A5A3A','#1A1A2E','#B8860B'];
  for(let i=0;i<18;i++){
    const d=document.createElement('div'); d.className='confetti';
    d.style.left=(Math.random()*100)+'vw'; d.style.background=colors[i%colors.length];
    d.style.animationDelay=(Math.random()*0.2)+'s'; d.style.transform='rotate('+(Math.random()*360)+'deg)';
    document.body.appendChild(d); setTimeout(()=>d.remove(),1400);
  }
}
function ask(){
  const raw=document.getElementById('q').value;
  const q=raw.trim();
  if(!q) return;
  if(q.length>600){ alert('Please shorten to under 600 characters.'); return; }
  const out=document.getElementById('out');
  out.innerHTML='<div class=card style="padding:18px;text-align:center"><div><span class=loadingDot></span><span class=loadingDot></span><span class=loadingDot></span></div><p class=small>Seeking counsel for: <em>'+esc(q).slice(0,120)+'</em> — mode: <b>'+esc(selectedMode)+'</b> — consulting '+STORY_COUNT+' Biblical Scenarios + '+VERSE_COUNT+' verses…</p></div>';
  out.scrollIntoView({behavior:'smooth', block:'start'});
  // client-side counsel — no fetch, instant, static-safe
  setTimeout(()=>{
    const data=counsel(q, {topN:3, mode: selectedMode==='auto'?null:selectedMode});
    let html='';
    if(data.blocked || data.mode==='bounce'){
      html='<div class="card" style="border:2px solid #F59E0B;background:#FFFBEB;padding:16px"><h3 style="color:#92400E">🛡️ Request not in scope</h3><p>'+esc(data.message||"I can only help with biblical counsel.")+'</p><p class=small>Try: <code>I feel anxious like Elijah</code> • <code>5 verses about peace</code> • <code>betrayed like Joseph</code></p></div>';
    } else if(data.mode==='verses'){
      burstConfetti();
      html+='<div class="card outCard" style="border:2px solid var(--green);background:linear-gradient(135deg,#ECFDF5,#F0FAF0)"><h3 style="color:var(--green)">📖 '+esc(data.count)+' KJV 1769 verses about “'+esc(data.topic)+'”</h3><p class=small>Static • Full-KJV search with provenance + strategic insight</p></div>';
      data.verses.forEach((v,i)=>{
        html+='<div class="card outCard" style="animation-delay:'+(i*0.04)+'s"><h3>'+esc(i+1)+'. '+esc(v.citation)+' <a href="'+esc(v.url)+'" target=_blank style="font-size:11px">[Wikisource ↗]</a></h3><div class=kjv>"'+esc(v.text)+'"</div><p><b>Strategic Insight:</b> '+esc(v.strategicInsight)+'</p><p class=small>Tags: '+esc(v.tags.join(", "))+' • <a href="'+esc(v.canonical)+'" target=_blank>Canonical</a></p></div>';
      });
      html+='<div class="card outCard" style="border:2px solid var(--green);background:linear-gradient(135deg,#F0FAF0,#FFFFFF)"><h3 style="color:var(--green)">★★★ Strategic Summary</h3><p>'+esc(data.strategicSummary)+'</p></div>';
      html+='<p class=small>'+esc(data.disclaimer)+'</p>';
    } else {
      burstConfetti();
      data.stories.forEach((s,i)=>{
        html+='<div class="card outCard" style="animation-delay:'+(i*0.05)+'s"><h3>'+esc(i+1)+'. '+esc(s.title)+' — <em>'+esc(s.character)+'</em></h3><p class=small>'+esc(s.situation.join(" • "))+'</p><p>'+esc(s.narrative)+'</p><div class=kjv>"'+esc(s.kjv.text)+'" — <a href="'+esc(s.kjv.url)+'" target=_blank>'+esc(s.kjv.citation)+'</a></div><p><b>Actions:</b><ul>'+s.actions.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul></p><p><b>Outcome:</b> '+esc(s.outcome)+' '+(s.outcomeCitation?'<a href="'+esc(s.outcomeCitation.url)+'" target=_blank>('+esc(s.outcomeCitation.citation)+')</a>':'')+'</p><p><b>Strategy: '+esc(s.strategy.name)+'</b><ol class=strategySteps>'+s.strategy.steps.map(st=>'<li>'+esc(st)+'</li>').join('')+'</ol></p><p class=small>Provenance: <a href="'+esc(s.kjv.canonical)+'" target=_blank>'+esc(s.kjv.canonical)+'</a></p></div>';
      });
      if(data.bestStrategicPlan){
        html+='<div class="card outCard" style="border:2px solid var(--maroon);background:linear-gradient(135deg,#FEF2F2,#FFFBEB)"><h3 style="color:var(--maroon)">★★★ Best Strategic Plan</h3><p><em>'+esc(data.bestStrategicPlan.title)+'</em><br/><span class=small>Based on: '+esc(data.bestStrategicPlan.basedOn.join(' • '))+'</span></p><ol>'+data.bestStrategicPlan.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><p class=small>'+esc(data.bestStrategicPlan.closing)+'</p></div>';
      }
      html+='<p class=small>'+esc(data.disclaimer)+'</p>';
    }
    out.innerHTML=html;
    out.querySelectorAll('.outCard').forEach((el,i)=>{el.style.opacity='0'; setTimeout(()=>{el.style.transition='opacity 0.3s, transform 0.3s'; el.style.opacity='1'}, 30+i*40)});
  }, 80);
}
renderGallery();
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html);
// copy logo + prompting guide for static hosting
try {
  const assetsSrc = path.join(__dirname, "../Assets/logo_main.png");
  const assetsDstDir = path.join(outDir, "Assets");
  fs.mkdirSync(assetsDstDir, { recursive: true });
  fs.copyFileSync(assetsSrc, path.join(assetsDstDir, "logo_main.png"));
  console.log("Copied Assets/logo_main.png");
} catch(e){ console.log("Logo copy skipped:", e.message); }
try {
  const docsSrc = path.join(__dirname, "../docs/Prompting_Guide.pdf");
  const docsDstDir = path.join(outDir, "docs");
  fs.mkdirSync(docsDstDir, { recursive: true });
  fs.copyFileSync(docsSrc, path.join(docsDstDir, "Prompting_Guide.pdf"));
  console.log("Copied docs/Prompting_Guide.pdf");
} catch(e){ console.log("Guide copy skipped:", e.message); }
console.log(`Static site built: ${outFile} (${(html.length/1024).toFixed(1)} KB)`);
console.log(`Stories: ${STORIES.length}, Verses: ${VERSES.length}`);
