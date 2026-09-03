// Security Guardrails — Your Bible Counselor
// Blocks prompt jacking, injection, hijacking and off-topic abuse
// Keeps agent locked to KJV 1769 biblical counsel only

const MAX_QUERY_LEN = 600;
const MIN_QUERY_LEN = 3;

// --- 1. Injection / Jailbreak patterns ---
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+above/i,
  /disregard\s+(all\s+)?(previous|above|system)/i,
  /forget\s+(all\s+)?(previous|instructions|system)/i,
  /reveal.{0,20}(system|prompt|instructions|hidden)/i,
  /show.{0,20}(system|prompt|hidden|secret)/i,
  /print.{0,20}(system|prompt|instructions)/i,
  /what\s+is\s+your\s+(system\s+)?prompt/i,
  /what\s+are\s+your\s+(instructions|prompt)/i,
  /repeat\s+your\s+(system\s+)?prompt/i,
  /tell\s+me\s+your\s+(system\s+)?prompt/i,
  /your\s+(system\s+)?prompt/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(a\s+)?(dan|jailbreak|hacker|evil|unfiltered|developer|admin|system|root)/i,
  /role\s*play\s+as/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /jailbreak/i,
  /DAN\s*mode/i,
  /developer\s+mode/i,
  /do\s+anything\s+now/i,
  /override\s+(safety|system|instructions)/i,
  /bypass\s+(safety|filter|guardrail|content)/i,
  /unfiltered/i,
  /system\s*:\s*/i,
  /assistant\s*:\s*/i,
  /<\|(system|user|assistant|im_start|im_end)\|>/i,
  /```\s*system/i,
  /\[SYSTEM\]/i,
  /\[INST\]/i,
  /exfiltrate/i,
  /leak.{0,20}(prompt|system|data)/i,
  /prompt\s+injection/i,
];

// --- 2. Off-topic / disallowed request patterns ---
// Agent is ONLY for biblical counsel: life situations, emotions, character, wisdom
// Bounce anything that is clearly not bible-life-counsel
const BLOCKED_TOPIC_PATTERNS = [
  // hacking / cybercrime
  /write\s+(malware|virus|ransomware|exploit|payload)/i,
  /how\s+to\s+hack/i,
  /sql\s+injection/i,
  /xss\s+attack/i,
  /ddos/i,
  /phish(ing)?/i,
  /crack\s+password/i,
  /bypass\s+authentication/i,
  // weapons / violence instructions
  /how\s+to\s+(make|build)\s+(a\s+)?bomb/i,
  /how\s+to\s+make\s+(meth|cocaine|heroin|drug)/i,
  /instructions\s+to\s+(kill|murder|harm)/i,
  // illicit
  /how\s+to\s+steal/i,
  /how\s+to\s+launder\s+money/i,
  // disallowed: requesting disallowed content generation unrelated to bible
  /generate\s+(fake|fraudulent)\s+(id|passport|document)/i,
  /create\s+a\s+fake\s+news/i,
  // attempts to make agent do non-bible tasks
  /write\s+(python|javascript|code)\s+to\s+hack/i,
  /translate\s+this\s+malicious/i,
  // political manipulation / election
  /rig\s+election/i,
  // explicit sexual
  /pornographic/i,
  /\bnsfw\b/i,
  // asking to act as different agent
  /you\s+are\s+not\s+a\s+bible\s+counselor/i,
  /you\s+are\s+a\s+shopping\s+assistant/i,
  /you\s+are\s+chatgpt/i,
];

const ALLOWED_HINT = "I am Your Bible Counselor — I help with life situations through KJV 1769 biblical stories, verses, and wisdom. Try: 'I feel anxious like Elijah' or '5 verses about diligence' or 'betrayed like Joseph — what should I do?'";

export function sanitizeInput(raw) {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  // remove null bytes, control chars except newline/tab
  s = s.replace(/\0/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // strip HTML tags to neutralize XSS attempts (defense in depth — frontend also escapes)
  s = s.replace(/<[^>]*>/g, " ");
  // strip angle brackets leftover
  s = s.replace(/[<>]/g, " ");
  // collapse whitespace
  s = s.replace(/\s+/g, " ");
  // limit length
  if (s.length > MAX_QUERY_LEN) s = s.slice(0, MAX_QUERY_LEN);
  return s;
}

export function detectInjection(query) {
  for (const re of INJECTION_PATTERNS) {
    if (re.test(query)) return { matched: true, pattern: re.source };
  }
  // heuristic: excessive special tokens
  const suspiciousTokens = (query.match(/<\|/g) || []).length + (query.match(/\[SYSTEM\]/gi) || []).length;
  if (suspiciousTokens > 0) return { matched: true, pattern: "suspicious_tokens" };
  // many repeated instruction-like phrases
  if (/(ignore|disregard|forget).{0,20}instructions/i.test(query) && query.length < 200) {
    return { matched: true, pattern: "instruction_override_phrase" };
  }
  return { matched: false };
}

export function detectBlockedTopic(query) {
  for (const re of BLOCKED_TOPIC_PATTERNS) {
    if (re.test(query)) return { matched: true, pattern: re.source };
  }
  return { matched: false };
}

export function validateQuery(raw) {
  if (typeof raw === "string" && raw.length > MAX_QUERY_LEN) {
    return { ok: false, code: "too_long", message: `Please shorten your request to under ${MAX_QUERY_LEN} characters.`, sanitized: sanitizeInput(raw.slice(0, MAX_QUERY_LEN)) };
  }
  const q = sanitizeInput(raw);
  if (!q || q.length < MIN_QUERY_LEN) {
    return { ok: false, code: "too_short", message: "Please share a bit more — e.g., 'I feel burnt out like Elijah' or '5 verses about peace'.", sanitized: q };
  }
  const inj = detectInjection(q);
  if (inj.matched) {
    return {
      ok: false,
      code: "injection_blocked",
      pattern: inj.pattern,
      message: "That request looks like an attempt to change my instructions. " + ALLOWED_HINT,
      sanitized: q,
    };
  }
  const blocked = detectBlockedTopic(q);
  if (blocked.matched) {
    return {
      ok: false,
      code: "off_topic_blocked",
      pattern: blocked.pattern,
      message: "I can only help with biblical counsel for life situations. " + ALLOWED_HINT,
      sanitized: q,
    };
  }
  // Allow everything else that passed injection/block — bible counsel is broad,
  // so we don't hard-gate low-relevance; we let stories/verses search handle it.
  // But bounce pure gibberish / no letters
  if (!/[a-zA-Z]{3,}/.test(q)) {
    return { ok: false, code: "gibberish", message: "I didn't catch that. " + ALLOWED_HINT, sanitized: q };
  }
  return { ok: true, sanitized: q };
}

export function bounceResponse(query, reason, extra = {}) {
  return {
    query: query || "",
    mode: "bounce",
    blocked: true,
    reason,
    message: extra.message || ALLOWED_HINT,
    hint: ALLOWED_HINT,
    wikisourceCanonical: "https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)",
    disclaimer: "All verses are KJV 1769. Verify verbatim at Wikisource: https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)",
    ...extra,
  };
}

export const SECURITY_CONFIG = {
  MAX_QUERY_LEN,
  MIN_QUERY_LEN,
  ALLOWED_HINT,
};
