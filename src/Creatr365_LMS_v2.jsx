  const letters = q ? ["A","B","C","D"].filter(l => q[l.toLowerCase()]) : [];
  const sel = answers[q?.id];
  const isLast = idx === questions.length - 1;
  const isFirst = idx === 0;

  function select(letter) {
    if (showExp) return;
    setAnswers(prev => ({ ...prev, [q.id]: letter }));
  }

  function prev() {
    if (isFirst) return;
    setShowExp(false);
    setIdx(i => i - 1);
  }

  function next() {
    setShowExp(false);
    if (isLast) {
      const sc = calcScore(answers, questions);
      setResult(sc);
      setDone(true);
    } else {
      setIdx(i => i+1);
    }
  }

  if (!q || !questions.length) {
    return (
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.h2}>ไม่พบข้อสอบ</div>
          <button onClick={() => onDone(null)} style={{ ...S.btn, marginTop:14 }}>กลับ</button>
        </div>
      </div>
    );
  }

  if (done && result) {
    const passed = threshold === 0 || result.pct >= threshold;
    return (
      <div style={{ ...S.wrap, maxWidth:560, paddingTop:40 }}>
        <div style={S.card}>
          <div style={{ textAlign:"center", padding:"14px 0" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>{passed?"✓":"✗"}</div>
            <div style={{ fontSize:28, fontWeight:700, color:passed?"#1A6B3A":"#C0392B" }}>{result.pct}%</div>
            {threshold > 0 && (
              <div style={{ color:passed?"#1A6B3A":"#C0392B", marginBottom:4, fontSize:14 }}>
                {passed?"ผ่าน":"ยังไม่ผ่าน"} — เกณฑ์ {threshold}%
              </div>
            )}
            <div style={S.muted}>{result.correct} จาก {result.total} ข้อ</div>
            {threshold === 0 && <div style={{ ...S.muted, marginTop:6 }}>บันทึก Baseline เรียบร้อย</div>}
          </div>
          <hr style={S.divider} />
          <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>ทบทวนคำตอบ</div>
          {questions.map((qq, i) => {
            const isC = answers[qq.id] === qq.ans;
            return (
              <div key={qq.id} style={{ ...S.cardSm, borderLeft:`3px solid ${isC?"#1A6B3A":"#C0392B"}`, marginBottom:6 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{i+1}. {qq.q}</div>
                <div style={{ fontSize:12, color:isC?"#1A6B3A":"#C0392B", marginTop:3 }}>
                  {isC ? "✓ ถูก" : `✗ คำตอบ: ${answers[qq.id]||"ไม่ได้ตอบ"} | เฉลย: ${qq.ans}`}
                </div>
                <div style={{ ...S.muted, marginTop:3, fontSize:12 }}>{qq.exp}</div>
              </div>
            );
          })}
          <div style={{ display:"flex", gap:10, marginTop:18, flexWrap:"wrap" }}>
            {!passed && threshold > 0 && (
              <>
                <button onClick={()=>{setIdx(0);setAnswers({});setDone(false);setResult(null);setShowExp(false);}}
                  style={{ ...S.btnOut, flex:1 }}>ทำใหม่ (Retake)</button>
                <button onClick={()=>onDone(result)} style={{ ...S.btn, flex:1, background:"#888" }}>
                  จบการทดสอบ (ไม่สอบซ่อม)
                </button>
              </>
            )}
            {(passed || threshold===0) && (
              <button onClick={()=>onDone(result)} style={{ ...S.btn, width:"100%" }}>
                ดำเนินการต่อ →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...S.wrap, maxWidth:620, paddingTop:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <div style={S.muted}>{idx+1}/{questions.length}</div>
        <div style={S.barBg}><div style={{ ...S.barFill(Math.round(idx/questions.length*100)), background:"#111" }} /></div>
        <div style={{ ...S.muted, whiteSpace:"nowrap" }}>{title}</div>
      </div>
      <div style={S.card}>
        <div style={{ ...S.muted, marginBottom:8 }}>{q.qg}</div>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:18, lineHeight:1.5 }}>{q.q}</div>
        {letters.map(letter => (
          <div key={letter} style={choiceStyle(sel, q.ans, showExp, letter)} onClick={()=>select(letter)}>
            <span style={{ width:22, height:22, borderRadius:99, border:"1.5px solid #CCC",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0,
              background: showExp&&letter===q.ans?"#1A6B3A": showExp&&sel===letter&&letter!==q.ans?"#C0392B":"transparent",
              color: showExp&&(letter===q.ans||sel===letter)?"#fff":"#555",
              borderColor: showExp&&letter===q.ans?"#1A6B3A": showExp&&sel===letter&&letter!==q.ans?"#C0392B":"#CCC",
            }}>{letter}</span>
            <span style={{ fontSize:14 }}>{q[letter.toLowerCase()]}</span>
          </div>
        ))}
        {showExp && (
          <div style={{ background:"#F8F8F8", border:"1px solid #E5E5E5", borderRadius:3, padding:"12px 14px", marginTop:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#555", marginBottom:3 }}>อธิบาย</div>
            <div style={{ fontSize:13, color:"#333", lineHeight:1.6 }}>{q.exp}</div>
          </div>
        )}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          {/* ปุ่ม Back — ย้อนกลับข้อก่อน */}
          {!isFirst && (
            <button onClick={prev} style={{ ...S.btnOut, padding:"9px 16px" }}>
              ← ย้อนกลับ
            </button>
          )}

          {/* ปุ่มดูเฉลย — แสดงเมื่อมีการเลือกคำตอบแล้ว */}
          {sel && !showExp && (
            <button onClick={() => setShowExp(true)} style={S.btnOut}>
              ดูเฉลย
            </button>
          )}

          {(showExp || sel) && (
            <button onClick={next} disabled={!sel} style={{ ...S.btn, flex: 1 }}>
              {isLast ? "ดูผลลัพธ์ →" : "ข้อถัดไป →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Course Results (Radar + Host Level + Recommendations) ─────
function CourseResults({ courseId, student, lessonScores, enrolledCourses, onBack, onSelectCourse }) {
  const radar = useMemo(() => buildRadar(lessonScores), [lessonScores]);
  const overall = useMemo(() => Math.round(radar.reduce((a,b)=>a+b.value,0)/radar.length), [radar]);
  const level = getHostLevel(overall);

  // คอร์สถัดไปที่ซื้อแล้ว (ตาม COURSE_ORDER)
  const nextEnrolledCourse = useMemo(() => {
    const idx = COURSE_ORDER.indexOf(courseId);
    for (let i = idx + 1; i < COURSE_ORDER.length; i++) {
      if (enrolledCourses.includes(COURSE_ORDER[i])) return COURSE_ORDER[i];
    }
    return null;
  }, [courseId, enrolledCourses]);

  // คอร์สแนะนำที่ยังไม่ได้ซื้อ (upsell)
  const upsellRecs = useMemo(() => getRecommendations(lessonScores, enrolledCourses), [lessonScores, enrolledCourses]);

  return (
    <div style={{ ...S.wrap, maxWidth:640, paddingTop:28 }}>
      <button onClick={onBack} style={{ ...S.btnOut, padding:"5px 12px", fontSize:12, marginBottom:20 }}>← กลับ</button>
      <div style={S.card}>
        <div style={{ marginBottom:16 }}>
          <div style={S.h1}>ผลลัพธ์คอร์ส</div>
          <div style={S.muted}>{COURSES[courseId]?.name} · คะแนนรวม {overall}% · {level.label}</div>
        </div>

        <div style={{ ...S.cardSm, background:"#F8F8F8", marginBottom:16 }}>
          <div style={{ fontWeight:600, fontSize:14 }}>{level.label}</div>
          <div style={{ fontSize:13, color:"#555", marginTop:2 }}>{level.badge} Level</div>
        </div>

        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radar}>
            <PolarGrid stroke="#E5E5E5" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize:12, fill:"#555" }} />
            <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#111" fill="#111" fillOpacity={0.12} strokeWidth={2} />
            <Tooltip formatter={v=>`${v}%`} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Score per dim */}
        <div style={{ marginBottom:18 }}>
          {radar.map(d => (
            <div key={d.dim} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
              <div style={{ width:90, fontSize:12, color:"#555", flexShrink:0 }}>{d.label}</div>
              <div style={S.barBg}><div style={S.barFill(d.value)} /></div>
              <div style={{ width:34, fontSize:12, color:"#555", textAlign:"right" }}>{d.value}%</div>
            </div>
          ))}
        </div>

        {/* Lesson summary */}
        <hr style={S.divider} />
        <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>Summary รายบท</div>
        {Object.entries(lessonScores).map(([lid, { pct, qg }]) => (
          <div key={lid} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:60, fontSize:12, color:"#555" }}>{lid}</div>
            <div style={{ width:40, fontSize:11, color:"#888" }}>{qg}</div>
            <div style={S.barBg}><div style={S.barFill(pct)} /></div>
            <div style={{ width:34, fontSize:12, color: pct>=70?"#1A6B3A":"#C0392B", textAlign:"right", fontWeight:600 }}>{pct}%</div>
          </div>
        ))}

        {/* ────── คอร์สถัดไปที่ซื้อแล้ว ────── */}
        {nextEnrolledCourse && (() => {
          const nc = COURSES[nextEnrolledCourse];
          return (
            <>
              <hr style={S.divider} />
              <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:"#1A6B3A" }}>
                🎉 พร้อมเรียนคอร์สถัดไปแล้ว!
              </div>
              <div style={{ ...S.card, borderLeft:"4px solid #1A6B3A", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{nc.name}</span>
                    <span style={S.badge}>{nc.badge}</span>
                    <span style={S.badgeO}>{nc.type === "onsite" ? "ONSITE" : "ONLINE"}</span>
                  </div>
                  <div style={{ ...S.muted, marginBottom:4 }}>{nc.duration} · {nc.desc}</div>
                  <div style={{ fontSize:12, color:"#1A6B3A" }}>✓ คอร์สนี้คุณซื้อแล้ว — พร้อมเริ่มได้เลย</div>
                </div>
                <button
                  onClick={() => onSelectCourse(nextEnrolledCourse)}
                  style={{ ...S.btn, background:"#1A6B3A", whiteSpace:"nowrap", marginLeft:16 }}>
                  ไปเรียนเลย →
                </button>
              </div>
            </>
          );
        })()}

        {/* ────── คอร์สแนะนำที่ยังไม่ได้ซื้อ (upsell) ────── */}
        {upsellRecs.length > 0 && (
          <>
            <hr style={S.divider} />
            <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>
              {nextEnrolledCourse ? "คอร์สอื่นที่แนะนำ" : "แนะนำคอร์สถัดไป (สูงสุด 3 คอร์ส)"}
            </div>
            {upsellRecs.map(cId => {
              const c = Object.values(COURSES).find(x => x.name === cId || x.id === cId.replace(/ /g,"_"));
              return (
                <div key={cId} style={{ ...S.cardSm, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:14 }}>{cId}</span>
