/**
 * Loads the real quiz bank from Supabase (`quiz_bank` table, ~166 rows and
 * growing) instead of the ~81-question array that used to be hardcoded in
 * Creatr365_LMS_v2.jsx. See BIBLE Z2.1: the hardcoded array was the actual
 * root cause of "questions repeat too often" — not the selection logic.
 *
 * RLS on `quiz_bank` already exposes only gradable, active rows
 * (`is_active AND auto_gradable`), so no auth beyond the anon key is
 * required — this mirrors the existing edge-function calls in this file,
 * which are also called with no bearer token.
 */

const SUPABASE_URL = "https://exybvjqjdqxonhesydhk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eWJ2anFqZHF4b25oZXN5ZGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzI1MTQsImV4cCI6MjA5NDUwODUxNH0.GPOJYTdWw_YXQnJkd_2RGErHnEWDF7YBtu_MevdmCtE";

const QUIZ_BANK_SELECT =
  "q_id,qg,phase,question_type,question,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation,progression_level";

/**
 * Fetch every gradable question from Supabase and reshape each row into the
 * exact object shape the LMS already expects (same keys the old hardcoded
 * QUIZ_BANK used): { id, qg, phase, type, q, a, b, c, d, ans, exp, rec, lvl }.
 *
 * `rec` (which courses to upsell on a weak QG) is intentionally left "" for
 * every row here: `recommended_courses` in Supabase still uses the retired
 * 6-course names (MICRO EXPRESS/MATRIX/...), not the live LMS course codes,
 * and translating that is a separate, not-yet-done mapping task. Shipping
 * the untranslated old names into `rec` would silently no-op every upsell
 * suggestion (they'd never match `enrolledCourses`) without saying so —
 * leaving it blank is the same runtime behavior but honest about why.
 *
 * Returns null (never throws) on any failure — network error, non-2xx
 * response, or an empty table — so the caller can fall back to the bundled
 * QUIZ_BANK_FALLBACK array without the app crashing.
 */
export async function loadQuizBank() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/quiz_bank?select=${QUIZ_BANK_SELECT}&question_type=in.(MCQ,True_False)`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      console.error(`[quizBank] Supabase ตอบกลับ ${res.status}, ใช้ชุดสำรองในโค้ดแทน`);
      return null;
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      console.error("[quizBank] Supabase คืนค่าว่าง, ใช้ชุดสำรองในโค้ดแทน");
      return null;
    }

    const questions = rows.map(r => ({
      id: r.q_id,
      qg: r.qg,
      phase: r.phase,
      type: r.question_type,
      q: r.question,
      a: r.choice_a ?? "",
      b: r.choice_b ?? "",
      c: r.choice_c ?? "",
      d: r.choice_d ?? "",
      ans: r.correct_choice,
      exp: r.explanation ?? "",
      rec: "",
      lvl: r.progression_level ?? "",
    }));

    console.log(`[quizBank] โหลดจาก Supabase สำเร็จ ${questions.length} ข้อ`);
    return questions;
  } catch (err) {
    console.error("[quizBank] โหลดจาก Supabase ล้มเหลว, ใช้ชุดสำรองในโค้ดแทน:", err);
    return null;
  }
}
