# Creatr365 LMS (6course-quiz) — working notes for Claude

Full system context (3-repo map, the "two diagnostics" naming collision,
the 5-layer completion logic, document authority rules) lives in
`academy_hero_work/CLAUDE.md` — read that first if working across repos.
This file has the process rules (same as there — repeated because sessions
don't always start from the other repo) plus what's specific to this repo.

## Process rules (non-negotiable)

1. **Never edit a file (Edit/Write) without an explicit instruction to do
   so in THIS turn.** "Explain why it's wrong" is not authorization to also
   fix it — always stop after explaining and wait.
2. Check a document's real `ls -la` timestamp before trusting it as current.
3. Check whether a referenced PR actually merged before treating its
   content as accepted design.
4. Never commit or push without an explicit instruction for that push.
5. Don't create a new file to hold a mapping that already has a home here
   (`RADAR_DIMS` in `Creatr365_LMS_v2.jsx` is the canonical QG→PPACT list — keep
   `academy_hero_work/src/lib/ppact.ts`'s `PPACT[].qgs` in sync with it,
   never the other way, never a third file).

## This repo's role

The actual LMS students log into: lesson video → Pre-test → Knowledge Check
per lesson → Diagnostic Quiz on the last lesson. Talks to
`creatr365-academy_broke`'s Supabase edge functions (`save-score`,
`get-enrollment`, `redeem-lms-handoff`, `get-progress`, `lms-state`) for
everything except reading the quiz bank, which now comes straight from
Supabase's `quiz_bank` table (`src/quizBank.js`, with `QUIZ_BANK_FALLBACK`
— the old hardcoded array — as a fallback if that fetch fails).

**Diagnostic Quiz here (`getDiagnosticQuiz()`) is informational only** — it
never gates lesson unlocking or course completion. The actual completion
decision happens server-side in `accept_diagnostic_attempt()` /
`issue_completion_record()` (Supabase SQL functions, in
`academy_hero_work`), which check module completion + the Mandatory
Knowledge Gate — not this quiz's score. See the other repo's CLAUDE.md for
the full breakdown; don't re-derive it from this file's quiz code alone.

## QG list — current state

QG-01 through QG-10, defined in `RADAR_DIMS` in `src/Creatr365_LMS_v2.jsx`
(names in Supabase `quiz_groups`). QG-08/09/10 all roll up into PPACT
Trust. This is the owner-confirmed spec (the 35-lesson table, 2026-09-23):

| QG | Name | Lessons |
|---|---|---|
| QG-08 | Ethics, Disclosure & Legal Compliance | F02, S01, S06, BH4 |
| QG-09 | Host Identity — Performance Persona (incl. 5 Hidden Souls) | F03, BH1 |
| QG-10 | Host Identity — Business Role Positioning | MG03 |

History, so nobody "fixes" it back: an earlier session reverted this split
because it looked like an abandoned PR's proposal. The owner has since
confirmed it as the final spec, and the split is what's merged on main.
Questions were imported into `quiz_bank` on 2026-09-23. Three were set to
`is_active=false` pending content review (QG08-PRE-A-003, QG08-POST-A-005,
QG10-POST-A-004). The existing "5 Hidden Souls" rows moved from QG-06 to
QG-09 (q_ids unchanged).

Still check the current lesson table before adding or retagging any QG.
A lesson whose QG has zero gradable questions goes through
`completeLessonWithoutQuiz`. It is saved to Supabase with score null. It
never gets a fake 100.
