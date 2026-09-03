# Bible Inspirational & Counselor Agent — KJV 1769

**Canonical Source:** https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)

Takes a natural language prompt describing any life situation and returns biblical characters who walked the same path, what they did, outcome, and a synthesized **Best Strategic Plan** — all cited with verbatim KJV 1769 and Wikisource URLs for verification.

> Example: *Cave of Adullam — 1 Samuel 22:1-2* → David gathered 400 distressed men in a cave and forged them into mighty men. Not a grave, a leadership academy.

## Provenance model
Every verse citation includes:
- `citation`: e.g., `1 Samuel 22:1-2 (KJV 1769)`
- `url`: e.g., `https://en.wikisource.org/wiki/Bible_(King_James)/1_Samuel#22:1`
- `canonical`: `https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)`
Users can verify verbatim text on Wikisource. No hallucinated verses.

## Quick start

```bash
cd /workspace/bible-counselor-agent
node src/cli.js "I am in a cave season, betrayed and hiding"
node src/cli.js "falsely accused and forgotten like Joseph" --format json
node src/cli.js "need courage to speak up like Esther" --llm-prompt

# HTTP API + beautiful HTML UI
npm start
# open http://localhost:8787
# API: curl "http://localhost:8787/counsel?q=cave%20of%20Adullam"
```

## As LLM agent
```js
import { counsel, buildLLMPrompt } from "./src/agent.js";
const result = counsel("I need to rebuild from ruins", { topN: 3 });
console.log(result.bestStrategicPlan);
// or send buildLLMPrompt(query) to any LLM as system + context
```

## Knowledge base
- `data/stories.js` — 20 archetypal stories, expandable to 150+
- `src/provenance.js` — Wikisource URL resolver for all 66 books
- `src/agent.js` — matching engine + plan synthesis
Current taxonomy covers: exile, betrayal, prison, debt, burnout, barrenness, underdog, rebuilding, midnight praise, trapped, etc.

## Extend
Add a story to `data/stories.js`:
```js
{
  id: "new_id",
  title: "Title",
  character: "Name",
  book: "Genesis", chapter: 1, verses: "1-2",
  kjvText: "verbatim...",
  situationTags: ["tag1"],
  keywords: ["kw"],
  summary: "...",
  actions: ["did..."],
  outcome: "...",
  outcomeRef: { book: "Genesis", chapter: 2, verses: "1" },
  strategy: { name: "The ...", steps: ["1. ..."] }
}
```
