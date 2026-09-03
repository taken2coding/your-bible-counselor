#!/usr/bin/env node
// Bible Counselor CLI

import { counsel, buildLLMPrompt } from "./agent.js";

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
Bible Inspirational & Counselor Agent — KJV 1769 (Wikisource Provenance)

Usage:
  node src/cli.js "I am in a cave season, hunted and gathering broken people"
  node src/cli.js --prompt "I was falsely accused" --format json
  node src/cli.js --prompt "need to rebuild after ruins" --llm-prompt

Options:
  --prompt <text>   Natural language situation (or just quote as first arg)
  --format json|pretty  Output format (default: pretty)
  --top <n>         Number of stories (1-5, default 3)
  --llm-prompt      Output LLM-ready counselor prompt instead of JSON
  --help            Show help

Examples:
  node src/cli.js "cave of Adullam, fleeing from Saul"
  node src/cli.js "falsely accused like Joseph"
  node src/cli.js "I need courage to speak up like Esther"
  node src/cli.js "burnout after victory like Elijah"
`);
}

function parseArgs(argv) {
  const opts = { prompt: null, format: "pretty", top: 3, llmPrompt: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else if (a === "--prompt" || a === "-p") { opts.prompt = argv[++i]; }
    else if (a === "--format") { opts.format = argv[++i]; }
    else if (a === "--top") { opts.top = parseInt(argv[++i], 10); }
    else if (a === "--llm-prompt") { opts.llmPrompt = true; }
    else if (!a.startsWith("-") && !opts.prompt) { opts.prompt = a; }
    else if (!a.startsWith("-")) { opts.prompt += " " + a; }
  }
  return opts;
}

function renderPretty(result) {
  if (result.error) {
    console.log(result.error);
    return;
  }
  console.log("=".repeat(78));
  console.log(`BIBLE COUNSELOR — Query: "${result.query}" | Mode: ${result.mode || 'stories'}`);
  console.log(`Canonical: ${result.wikisourceCanonical}`);
  console.log("=".repeat(78));

  if (result.mode === "verses") {
    console.log(`\nTopic: "${result.topic}" — ${result.count} KJV 1769 verses`);
    result.verses.forEach((v, idx) => {
      console.log(`\n[${idx+1}] ${v.citation}`);
      console.log(`    ${v.url}`);
      console.log(`    "${v.text}"`);
      console.log(`    Insight: ${v.strategicInsight}`);
      console.log(`    Tags: ${v.tags.join(", ")}`);
    });
    console.log(`\n★★★ STRATEGIC SUMMARY ★★★`);
    console.log(result.strategicSummary);
    console.log(`\n${result.disclaimer}\n`);
    return;
  }

  result.stories.forEach((s, idx) => {
    console.log(`\n[${idx + 1}] ${s.title}`);
    console.log(`    Character: ${s.character} | Tags: ${s.situation.join(", ")}`);
    console.log(`    Summary: ${s.narrative}`);
    console.log(`\n    KJV — ${s.kjv.citation}`);
    console.log(`    ${s.kjv.url}`);
    console.log(`    "${s.kjv.text}"`);
    console.log(`\n    What they did:`);
    s.actions.forEach(a => console.log(`      • ${a}`));
    console.log(`\n    Outcome: ${s.outcome}`);
    if (s.outcomeCitation) console.log(`    Outcome ref: ${s.outcomeCitation.citation} — ${s.outcomeCitation.url}`);
    console.log(`\n    Strategy: ${s.strategy.name}`);
    s.strategy.steps.forEach(step => console.log(`      ${step}`));
    if (s.crossRefs.length) {
      console.log(`\n    See also:`);
      s.crossRefs.forEach(c => console.log(`      • ${c.citation} — ${c.url} — ${c.note}`));
    }
    console.log(`\n    Provenance: ${s.provenance}`);
    console.log("-".repeat(78));
  });

  if (result.bestStrategicPlan) {
    console.log(`\n★★★ BEST STRATEGIC PLAN ★★★`);
    console.log(`${result.bestStrategicPlan.title}`);
    console.log(`Based on: ${result.bestStrategicPlan.basedOn.join(" | ")}`);
    console.log(`\nPrinciple: ${result.bestStrategicPlan.principle}\n`);
    result.bestStrategicPlan.steps.forEach((st, i) => console.log(`  ${i + 1}. ${st}`));
    console.log(`\n${result.bestStrategicPlan.closing}`);
  }
  console.log(`\n${result.disclaimer}\n`);
}

const opts = parseArgs(args);

if (!opts.prompt) {
  printHelp();
  process.exit(1);
}

if (opts.llmPrompt) {
  console.log(buildLLMPrompt(opts.prompt));
} else {
  const result = counsel(opts.prompt, { topN: opts.top });
  if (opts.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    renderPretty(result);
  }
}
