/**
 * ============================================================
 * CREATR365 LMS — v3.0 | May 2026
 * ============================================================
 * FLOW ที่ถูกต้อง (ตามที่ตกลงกัน):
 *   Login → Dashboard (คอร์สที่ซื้อ) → Pre-test (baseline)
 *   → ดูคลิปบทที่ 1 → KC Quiz ≥70% → unlock บทที่ 2
 *   → ดูคลิปบทที่ N → KC Quiz → จบคอร์ส
 *   → Results: Radar 5 มิติ + Host Level + แนะนำคอร์ส (max 3)
 *
 * สิ่งที่ตัดออก: Standalone Diagnostic Screen, Peer Review,
 *   Live Section, Short Answer, Post-test Delta logic
 * ============================================================
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

// ============================================================
// ⚙️  CONFIG
// ============================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYnuFfq6E3GsU0fYznj9jrdM6hl3736ET1i3k4iZGCK5-2fyRTjF9ANHaAYdtIgV6XJQ/exec";

const SUPABASE_ENROLL_URL = "https://exybvjqjdqxonhesydhk.supabase.co/functions/v1/get-enrollment";

const IMG = {
  favicon: "https://ik.imagekit.io/ideas365logo/creatr365_favicon.png?updatedAt=1778430978942",
  center: "https://ik.imagekit.io/ideas365logo/creatr365_center.png?updatedAt=1778430978987",
  concept: "https://ik.imagekit.io/ideas365logo/creatr365_concept_center.png?updatedAt=1778430978985",
};
// ↑ ใส่ URL จาก Apps Script v2 ที่ Deploy แล้ว

const CFG = {
  passThreshold:   70,   // % เกณฑ์ผ่าน KC Quiz ทุกคอร์ส
  upsellGuard:     80,   // % ถ้าสูงกว่านี้ ไม่แนะนำคอร์สซ้ำ
  retakeDays:      30,   // วันที่ retake ได้โดยไม่ต้องดูคลิปใหม่
  maxWatchCount:   5,    // ดูซ้ำได้สูงสุดกี่ครั้งก่อนแจ้ง
  useApi:          true,
};

// ============================================================
// 📚  COURSE CONFIG — 6 คอร์ส
// ============================================================
const COURSES = {
  MICRO_EXPRESS: {
    id: "MICRO_EXPRESS", name: "MICRO EXPRESS", badge: "STARTER", type: "online",
    duration: "3 ชั่วโมง",
    desc: "30-Sec Hook Formula — หยุดนิ้วผู้ชมได้ใน 3 วินาที",
    pretestQGs: ["QG-01"], pretestCount: 5,
    lessons: [
      { id:"M01", name:"Why Hook คือทุกอย่าง",          dur:"8 นาที",  url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
      { id:"M02", name:"30-Sec Hook Formula ชั้นที่ 1", dur:"10 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
      { id:"M03", name:"Formula ชั้นที่ 2-3",            dur:"12 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
      { id:"M04", name:"Host คือใคร? 5 ประเภท",         dur:"8 นาที",  url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-05" },
      { id:"M05", name:"Live Commerce 101",               dur:"10 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-05" },
    ],
    // Submission optional (Hook เขียน)
    submission: { enabled: true, rubric:"RUB-07", label:"ส่ง Hook เขียน 1 ชิ้น" },
  },

  SIGNAL: {
    id: "SIGNAL", name: "SIGNAL", badge: "ENTRY A", type: "online",
    duration: "6 ชั่วโมง",
    desc: "Hook · Voice · Camera Presence — เพิ่ม Watch Time ≥30%",
    pretestQGs: ["QG-01","QG-03","QG-04"], pretestCount: 15,
    lessons: [
      { id:"S01", name:"Hook Architecture",   dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
      { id:"S02", name:"S-O-R + PAD Theory",  dur:"90 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-04" },
      { id:"S03", name:"Vocal Dynamics",       dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-03" },
      { id:"S04", name:"Camera Mastery",       dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-03" },
      { id:"S05", name:"Trust Architecture",   dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-03" },
      { id:"S06", name:"Narrative Selling",    dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
    ],
    submission: { enabled: true, rubric:"RUB-01", label:"ส่ง Hook Video 30-45 วินาที" },
  },

  MATRIX: {
    id: "MATRIX", name: "MATRIX", badge: "ENTRY B", type: "online",
    duration: "6 ชั่วโมง",
    desc: "Platform Analytics · AI Tools — Live Score >75",
    pretestQGs: ["QG-05"], pretestCount: 10,
    lessons: [
      { id:"MT01", name:"Algorithm Intel",       dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-01" },
      { id:"MT02", name:"FOMO System",            dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-02" },
      { id:"MT03", name:"Dashboard Analytics",    dur:"90 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-05" },
      { id:"MT04", name:"Reporting & GMV",        dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-05" },
      { id:"MT05", name:"AI Tools",               dur:"60 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-05" },
      { id:"MT06", name:"Compliance (PDPA/ETDA)", dur:"30 นาที", url:"https://www.youtube.com/embed/QbuyU8EGMjU?si=npNmAGbOt4I0Almb", qg:"QG-07" },
    ],
    submission: { enabled: true, rubric:null, label:"ส่ง Data Analysis Report (3 จุด + Solution)" },
  },

  STAGE: {
    id: "STAGE", name: "STAGE", badge: "INTERMEDIATE", type: "onsite",
    duration: "8 ชั่วโมง (1 วัน)",
    desc: "Communication Mastery Lab — ฝึก Vocal/Camera/Crisis Onsite",
    pretestQGs: [], pretestCount: 0, // Trainer ประเมิน
