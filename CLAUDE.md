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
   (`RADAR_DIMS` in `Creatr365_LMS_v2.jsx` is the canonical QG list — keep
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

QG-01 through QG-07 only. Defined in `RADAR_DIMS` in
`src/Creatr365_LMS_v2.jsx`. Do not add a QG without first checking the
current BIBLE's course-lesson table (see other repo's CLAUDE.md for why —
a QG-08/09/10 split was tried and reverted the same day for exactly this
reason).
