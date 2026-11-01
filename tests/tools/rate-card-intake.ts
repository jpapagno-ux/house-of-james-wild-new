// Rate-card intake CLI: turns an intake JSON (the partner's card, typed up once)
// into the Airtable records to create — table by table, in link order — and
// the SQL that binds the canonical Booking Live units to the new Airtable ids.
//
//   node --experimental-strip-types tests/tools/rate-card-intake.ts intake.json
//
// intake.json has the IntakeInput shape (lib/booking-live/rates/intake.ts);
// scripts/booking-live/intake-example-lion-sands.json is the worked example.
// Create the records with the Airtable MCP (create_records_for_table) one table
// at a time, substituting the record ids the previous table returned for the
// `links` keys; then run the link SQL, approve the card, and sync
// (docs/booking-live/RATE-CARD-PUSH.md).
import { readFileSync } from "node:fs";
import { buildIntake, intakeOrder, type IntakeInput } from "../../lib/booking-live/rates/intake.ts";

const input = JSON.parse(readFileSync(process.argv[2], "utf8")) as IntakeInput;
const plan = buildIntake(input);
if (plan.problems.length) { console.error("Intake refused:\n  " + plan.problems.join("\n  ")); process.exit(1); }
if (plan.perPersonConverted.length) console.error(`Per-person seasons converted to per-room (verify): ${plan.perPersonConverted.join("; ")}`);
for (const table of intakeOrder(plan)) {
  const rows = plan.writes.filter((w) => w.table === table).map((w) => ({ key: w.key, links: w.links, fields: Object.fromEntries(Object.entries(w.fields).filter(([, v]) => v !== undefined)) }));
  console.log(`\n## ${table} (${rows.length})\n${JSON.stringify(rows, null, 1)}`);
}
console.log(`\n## Link SQL (fill the ids once the records exist)\n${plan.linkSql({})}`);
