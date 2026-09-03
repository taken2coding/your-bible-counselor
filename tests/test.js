import { counsel } from "../src/agent.js";

function assert(cond, msg) { if (!cond) throw new Error("FAIL: " + msg); }

const tests = [
  { q: "cave of Adullam fleeing", expect: "adullam_david" },
  { q: "falsely accused prison Joseph", expect: "joseph_prison_to_palace" },
  { q: "debt creditor oil widow", expect: "widow_oil" },
  { q: "Esther risk speaking up", expect: "esther_risk" },
  { q: "burnout juniper Elijah", expect: "elijah_burnout" },
  { q: "rebuilding wall Nehemiah ruins", expect: "nehemiah_rebuilder" },
  { q: "Job lost everything", expect: "job_loss" },
];

let passed = 0;
for (const t of tests) {
  const r = counsel(t.q);
  const topId = r.stories[0]?.id;
  const ok = topId === t.expect;
  console.log(`${ok ? "✓" : "✗"} Query "${t.q}" => ${topId} (expected ${t.expect}) | provenance: ${r.stories[0]?.kjv.url}`);
  if (!ok) console.log("  Full top 3:", r.stories.map(s=>s.id).join(", "));
  assert(r.stories[0].kjv.canonical.includes("The_Holy_Bible"), "provenance missing");
  assert(r.stories[0].kjv.url.includes("en.wikisource.org/wiki/Bible_(King_James)"), "url not wikisource");
  if (ok) passed++;
}
console.log(`\n${passed}/${tests.length} top-match tests passed`);

// Check strategy synthesis
const s = counsel("I am betrayed and need strategy", { topN: 3 });
assert(s.bestStrategicPlan && s.bestStrategicPlan.steps.length > 0, "strategy missing");
console.log("✓ Strategic plan synthesis works —", s.bestStrategicPlan.steps.length, "steps");
console.log("✓ All verifications use KJV 1769 Wikisource provenance");

if (passed === tests.length) console.log("\nALL TESTS PASSED");
else console.log(`\n${tests.length - passed} TESTS FAILED`);
