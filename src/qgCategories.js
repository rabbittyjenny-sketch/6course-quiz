/**
 * QG_CATEGORIES — single source of truth for what each Question Group code
 * means and which PPACT dimension it rolls up into.
 *
 * Why this file exists: before it, "what does QG-06 cover" and "which PPACT
 * dimension does QG-08 belong to" only lived in scattered comments, a
 * content-audit doc, and hand-derived judgement calls repeated across a long
 * back-and-forth (2569-09-21) — with no single place a future change could
 * be checked against. This file is that place.
 *
 * Keep in sync with academy_hero_work/src/lib/ppact.ts (`PPACT[].qgs`) —
 * that file is the canonical PPACT-dimension definitions (sourced from the
 * printed course books); this one is the canonical QG-level breakdown that
 * feeds it. The two must always agree on which QGs exist and which PPACT
 * key each one maps to.
 *
 * Adding a new QG (a new lesson topic that doesn't fit any existing QG):
 *   1. Add an entry here with a `ppact` key from PPACT_KEYS below.
 *   2. Add the same QG code to the matching dimension's `qgs` array in
 *      ppact.ts.
 *   3. Tag the lesson(s) in Creatr365_LMS_v2.jsx's COURSES object with
 *      `qg: "QG-xx"`.
 *   4. Make sure quiz_bank in Supabase actually has rows for that QG before
 *      shipping the retag — an untested QG with zero questions means an
 *      empty knowledge-check screen for every lesson tagged with it.
 * Nothing else needs to change: getLessonQuiz/getQsByQG/getDiagnosticQuiz
 * all key off QUIZ_BANK's own `qg` field, not this file, so a new QG "just
 * works" for quiz selection the moment matching rows exist in Supabase.
 */

export const PPACT_KEYS = ['communication', 'presence', 'psychology', 'authority', 'trust'];

export const QG_CATEGORIES = {
  'QG-01': { name: 'Attention & Hook Mechanics',                 ppact: 'communication' },
  'QG-02': { name: 'Hook Loop & FOMO Ladder',                    ppact: 'communication' },
  'QG-03': { name: 'Voice, Camera & Trust Architecture',         ppact: 'presence' },
  'QG-04': { name: 'Buyer Psychology — S-O-R & PAD Theory',      ppact: 'psychology' },
  'QG-05': { name: 'Analytics & KPI Calculation',                ppact: 'authority' },
  'QG-06': { name: 'Brand Identity & Production',                ppact: 'trust' },
  'QG-07': { name: 'Business, P&L & Global Strategy',            ppact: 'authority' },
  // Added 2569-09-21 — split out of QG-06 (see academy_hero_work/
  // Creatr365_Session_2026-09-03_5Course_Content_Audit.md §3.2 for the
  // original 5-lesson finding; BH1 and S06 were found later in the same
  // pass and folded in here rather than left mislabeled QG-06).
  'QG-08': { name: 'Ethics, Disclosure & Legal Compliance',      ppact: 'trust' },
  'QG-09': { name: 'Host Identity — Performance Persona',        ppact: 'trust' },
  'QG-10': { name: 'Host Identity — Business Role Positioning',  ppact: 'trust' },
};

export function qgToPpact(qg) {
  return QG_CATEGORIES[qg]?.ppact ?? null;
}
