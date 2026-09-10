import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, query, isPostgresConnected, memoryStore } from './db.js';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors());
app.use(express.json());

const ROLE_BENCHMARKS = {
  'Software Developer': [
    ['Java','Programming','Advanced',85], ['Spring Boot','Framework','Intermediate',60],
    ['System Design','Architecture','Advanced',85], ['Microservices','Architecture','Advanced',85],
    ['Docker','DevOps','Intermediate',60], ['AWS','DevOps','Intermediate',60], ['Kubernetes','DevOps','Advanced',85]
  ],
  'Senior Software Engineer': [
    ['Java','Programming','Advanced',85], ['Spring Boot','Framework','Advanced',85],
    ['System Design','Architecture','Expert',95], ['Microservices','Architecture','Expert',95],
    ['Docker','DevOps','Advanced',85], ['AWS','DevOps','Advanced',85], ['Kubernetes','DevOps','Advanced',85]
  ],
  'DevOps Lead': [
    ['Kubernetes','DevOps','Expert',95], ['Docker','DevOps','Advanced',85], ['AWS','DevOps','Advanced',85],
    ['Terraform','DevOps','Advanced',85], ['CI/CD Automation','DevOps','Advanced',85]
  ]
};

const proficiencyText = score => score >= 85 ? 'Advanced' : score >= 60 ? 'Intermediate' : score > 0 ? 'Beginner' : 'Unaware';
const severity = (required, current) => {
  const gap = Math.max(0, required - current);
  return gap >= 40 ? 'Critical' : gap >= 20 ? 'Moderate' : gap > 0 ? 'Minor' : 'Met';
};
const ok = (res, data) => res.json({ success: true, data });
const fail = (res, e) => res.status(500).json({ success: false, error: e.message });
const num = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;

async function getProfileId(userId) {
  let r = await query('SELECT profile_id FROM employee_profile WHERE user_id=$1 ORDER BY profile_id LIMIT 1', [userId]);
  if (r.rows.length) return r.rows[0].profile_id;
  r = await query('SELECT profile_id FROM employee_profiles WHERE user_id=$1 ORDER BY profile_id LIMIT 1', [userId]);
  return r.rows.length ? r.rows[0].profile_id : null;
}

async function getUserName(userId) {
  const r = await query('SELECT full_name FROM users WHERE user_id=$1', [userId]);
  return r.rows[0]?.full_name || `User ${userId}`;
}

async function calculateGap(userId, targetRole = 'Software Developer') {
  if (!isPostgresConnected) {
    const skills = memoryStore.userSkills.filter(x => x.user_id == userId);
    const reqs = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Software Developer'];
    const details = reqs.map(([skill, category, required, requiredScore]) => {
      const s = skills.find(x => x.skill_name.toLowerCase() === skill.toLowerCase());
      const currentScore = s?.score ?? 0;
      const level = severity(requiredScore, currentScore);
      return { skill, category, required, requiredScore, current: s?.proficiency_level || proficiencyText(currentScore), currentScore, level, class: level.toLowerCase(), gapScore: Math.max(0, requiredScore-currentScore) };
    });
    const totalR = details.reduce((a,x)=>a+x.requiredScore,0), totalC = details.reduce((a,x)=>a+x.currentScore,0);
    return { userId:Number(userId), targetRole, criticalCount:details.filter(x=>x.level==='Critical').length, moderateCount:details.filter(x=>x.level==='Moderate').length, minorCount:details.filter(x=>x.level==='Minor').length, readinessScore:Math.round(totalC/(totalR||1)*100), gapDetails:details, timestamp:new Date().toISOString() };
  }

  const skillRows = (await query(`
    SELECT es.skill_id, es.proficiency_level, s.skill_name, s.category
    FROM employee_skills es JOIN skills s ON s.skill_id=es.skill_id
    WHERE es.user_id=$1
  `, [userId])).rows;
  let reqs = (await query(`
    SELECT rs.skill_id, s.skill_name, COALESCE(s.category,'General') AS category, rs.required_proficiency
    FROM required_skills rs JOIN skills s ON s.skill_id=rs.skill_id
    WHERE LOWER(rs.role_name)=LOWER($1) ORDER BY rs.required_skill_id
  `, [targetRole])).rows;

  if (!reqs.length) {
    const benchmark = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Software Developer'];
    reqs = benchmark.map(([skill_name, category, required, required_proficiency]) => ({ skill_name, category, required_level: required, required_proficiency }));
  }

  const details = reqs.map(r => {
    const s = skillRows.find(x => x.skill_name.toLowerCase() === r.skill_name.toLowerCase());
    const currentScore = num(s?.proficiency_level, 0);
    const requiredScore = num(r.required_proficiency, 0);
    const level = severity(requiredScore, currentScore);
    return {
      skill: r.skill_name, category: r.category || 'General', required: proficiencyText(requiredScore), requiredScore,
      current: proficiencyText(currentScore), currentScore, level, class: level.toLowerCase(), gapScore: Math.max(0, requiredScore-currentScore)
    };
  });

  const totalR = details.reduce((a,x)=>a+x.requiredScore,0), totalC = details.reduce((a,x)=>a+x.currentScore,0);
  const result = {
    userId:Number(userId), targetRole,
    criticalCount:details.filter(x=>x.level==='Critical').length,
    moderateCount:details.filter(x=>x.level==='Moderate').length,
    minorCount:details.filter(x=>x.level==='Minor').length,
    readinessScore:Math.round(totalC/(totalR||1)*100), gapDetails:details, timestamp:new Date().toISOString()
  };

  // Persist the latest gap snapshot in the user's existing gap_analysis table.
  await query('DELETE FROM gap_analysis WHERE user_id=$1', [userId]);
  for (const d of details) {
    const skill = await query('SELECT skill_id FROM skills WHERE LOWER(skill_name)=LOWER($1) LIMIT 1', [d.skill]);
    if (skill.rows.length) {
      await query(`INSERT INTO gap_analysis(user_id,skill_id,current_level,required_level,gap_score,priority) VALUES($1,$2,$3,$4,$5,$6)`,
        [userId, skill.rows[0].skill_id, d.currentScore, d.requiredScore, d.gapScore, d.level]);
    }
  }
  return result;
}

app.get('/api/status', (req,res) => res.json({ status:'Online', database:isPostgresConnected?'PostgreSQL Active':'In-memory fallback', databaseName:process.env.PGDATABASE || 'knowledge_gap_platform', host:process.env.PGHOST || 'localhost', port:Number(process.env.PGPORT || 5432), timestamp:new Date().toISOString() }));

app.get('/api/users', async (req,res) => { try { const r=await query(`SELECT u.user_id AS id,u.full_name AS name,u.email,u.status,r.role_name AS role FROM users u LEFT JOIN roles r ON r.role_id=u.role_id ORDER BY u.user_id`); ok(res,r.rows); } catch(e){fail(res,e)} });

app.post('/api/login', async (req,res) => { try { const email=String(req.body.email||'').trim().toLowerCase(); if(!email) return res.status(400).json({success:false,error:'Email is required'}); const r=await query(`SELECT u.user_id AS id,u.full_name AS name,u.email,u.status,r.role_name AS role FROM users u LEFT JOIN roles r ON r.role_id=u.role_id WHERE LOWER(u.email)=LOWER($1) LIMIT 1`,[email]); if(!r.rows.length) return res.status(401).json({success:false,error:'No account found for this email'}); const user=r.rows[0]; if(user.status && String(user.status).toLowerCase()!=='active') return res.status(403).json({success:false,error:'This account is not active'}); ok(res,user); } catch(e){fail(res,e)} });

app.get('/api/courses', async (req,res) => {
  try {
    if (!isPostgresConnected) return ok(res,memoryStore.courses);
    const r = await query(`SELECT course_id AS id, course_name AS title, 'Internal Training Catalog' AS provider, description,
      difficulty_level AS level, duration_hours AS duration_hours, duration_hours || ' hrs' AS duration,
      category, category AS skill_name, 4.5::numeric AS rating, '' AS url, '📚' AS icon
      FROM training_courses ORDER BY course_id`);
    ok(res,r.rows);
  } catch(e){fail(res,e)}
});

app.post('/api/gap-analysis/calculate', async (req,res) => { try { const data=await calculateGap(req.body.userId||1,req.body.targetRole||'Software Developer'); ok(res,data); } catch(e){fail(res,e)} });
app.get('/api/gap-analysis/:userId', async (req,res) => { try { ok(res,await calculateGap(req.params.userId,req.query.role||'Software Developer')); } catch(e){fail(res,e)} });

app.post('/api/ai/recommendations', async (req,res) => {
  try {
    const gaps=req.body.gaps||[]; const role=req.body.targetRole||'Software Developer';
    const actions=gaps.filter(x=>x.level!=='Met').sort((a,b)=>b.gapScore-a.gapScore).slice(0,5).map(x=>`Build ${x.skill} through a structured course, hands-on project and mentor review.`);
    if (isPostgresConnected) for (const g of gaps.filter(x=>x.level!=='Met').slice(0,8)) {
      await query(`INSERT INTO recommendations(user_id,skill_name,recommendation_text,priority) VALUES($1,$2,$3,$4)`,[req.body.userId||1,g.skill,`Upskill ${g.skill} for ${role} using training, practice and mentorship.`,g.level]);
    }
    ok(res,{summary:`Prioritize ${actions.length||gaps.length} high-impact skill gaps for ${role}.`,priorityActions:actions,recommendedTrack:'Cloud Native & Microservices Upskilling Path',estimatedWeeks:6});
  } catch(e){fail(res,e)}
});

app.get('/api/learning-paths/:userId', async (req,res) => {
  try {
    if (!isPostgresConnected) return ok(res,{title:'Full Stack Architect & Cloud Engineer Pathway',targetRole:'Software Developer',totalDuration:'75 Hours',estimatedTime:'6 Weeks',stages:[]});
    let r=await query('SELECT * FROM learning_paths WHERE user_id=$1 ORDER BY created_at DESC NULLS LAST, learning_path_id DESC LIMIT 1',[req.params.userId]);
    if (!r.rows.length) {
      const g=await calculateGap(req.params.userId,'Software Developer');
      const gaps=g.gapDetails.filter(x=>x.level!=='Met').sort((a,b)=>b.gapScore-a.gapScore);
      const steps=gaps.map((x,i)=>({stage:i+1,skill:x.skill,severity:x.level,estimatedHours:Math.max(5,Math.round(x.gapScore/2)),courses:[]}));
      const total=steps.reduce((a,x)=>a+x.estimatedHours,0);
      await query(`INSERT INTO learning_paths(user_id,title,description,estimated_hours,status,target_role,estimated_weeks,steps) VALUES($1,$2,$3,$4,'Active',$5,$6,$7)`,[req.params.userId,'Personalized Software Developer Upskilling Path','Generated from the latest skill-gap analysis.',total,'Software Developer',6,JSON.stringify(steps)]);
      r=await query('SELECT * FROM learning_paths WHERE user_id=$1 ORDER BY created_at DESC NULLS LAST, learning_path_id DESC LIMIT 1',[req.params.userId]);
    }
    const p=r.rows[0];
    ok(res,{id:p.learning_path_id,title:p.title,targetRole:p.target_role||'Software Developer',totalDuration:`${p.estimated_hours||0} Hours`,estimatedTime:`${p.estimated_weeks||6} Weeks`,stages:p.steps||[]});
  } catch(e){fail(res,e)}
});

app.get('/api/learning/:userId', async (req,res) => {
  try {
    if(!isPostgresConnected) return ok(res,[]);
    const profile=await getProfileId(req.params.userId);
    if(!profile) return ok(res,[]);
    const r=await query(`SELECT te.enrollment_id AS id,te.profile_id,te.course_id,tc.course_name AS title,'Internal Training Catalog' AS provider,
      tc.category AS skill_name,tc.duration_hours,tc.duration_hours || ' hrs' AS duration,COALESCE(te.status,'Not Started') AS status,
      COALESCE(te.progress,0) AS progress,COALESCE(te.completed_modules,0) AS completed_modules,COALESCE(te.total_modules,1) AS total_modules,
      te.enrollment_date AS enrolled_at,te.completion_date AS completed_at,te.certification_expiry
      FROM training_enrollment te JOIN training_courses tc ON tc.course_id=te.course_id WHERE te.profile_id=$1 ORDER BY te.enrollment_date DESC NULLS LAST,te.enrollment_id DESC`,[profile]);
    ok(res,r.rows);
  }catch(e){fail(res,e)}
});

app.post('/api/learning/enroll', async (req,res) => {
  try {
    const userId=req.body.userId||1, courseId=req.body.courseId; if(!courseId)return res.status(400).json({success:false,error:'courseId is required'});
    if(!isPostgresConnected)return ok(res,{id:Date.now(),user_id:userId,course_id:courseId,status:'In Progress',progress:0});
    const profile=await getProfileId(userId); if(!profile)return res.status(400).json({success:false,error:`No employee profile found for user ${userId}`});
    const course=await query('SELECT duration_hours FROM training_courses WHERE course_id=$1',[courseId]); if(!course.rows.length)return res.status(404).json({success:false,error:'Course not found'});
    let r=await query(`SELECT enrollment_id FROM training_enrollment WHERE profile_id=$1 AND course_id=$2 LIMIT 1`,[profile,courseId]);
    if(r.rows.length) {
      r=await query(`UPDATE training_enrollment SET status='In Progress',progress=COALESCE(progress,0),started_at=COALESCE(started_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE enrollment_id=$1 RETURNING *`,[r.rows[0].enrollment_id]);
    } else {
      r=await query(`INSERT INTO training_enrollment(profile_id,course_id,enrollment_date,progress,status,started_at,total_modules,completed_modules) VALUES($1,$2,CURRENT_DATE,0,'In Progress',CURRENT_TIMESTAMP,10,0) RETURNING *`,[profile,courseId]);
    }
    await query(`INSERT INTO notifications(user_id,title,message,notification_type,is_read) VALUES($1,'Training enrolled','You are enrolled in a new learning course.','TRAINING',FALSE)`,[userId]);
    ok(res,{...r.rows[0],id:r.rows[0].enrollment_id});
  }catch(e){fail(res,e)}
});

app.patch('/api/learning/:id/progress', async (req,res) => {
  try {
    const p=Math.max(0,Math.min(100,num(req.body.progress,0))); const status=p===100?'Completed':'In Progress';
    if(!isPostgresConnected)return ok(res,{id:req.params.id,progress:p,status});
    const r=await query(`UPDATE training_enrollment SET progress=$1,status=$2,completed_modules=ROUND(COALESCE(total_modules,1)*$1/100.0),started_at=COALESCE(started_at,CURRENT_TIMESTAMP),completion_date=CASE WHEN $1=100 THEN CURRENT_DATE ELSE completion_date END,completed_at=CASE WHEN $1=100 THEN CURRENT_TIMESTAMP ELSE completed_at END,updated_at=CURRENT_TIMESTAMP WHERE enrollment_id=$3 RETURNING *`,[p,status,req.params.id]);
    if(!r.rows.length)return res.status(404).json({success:false,error:'Enrollment not found'});
    ok(res,{...r.rows[0],id:r.rows[0].enrollment_id});
  }catch(e){fail(res,e)}
});

app.get('/api/mentors', async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT m.*,u.full_name AS name,u.email,r.role_name AS role FROM mentors m JOIN users u ON u.user_id=m.user_id LEFT JOIN roles r ON r.role_id=u.role_id ORDER BY m.rating DESC,m.id`);ok(res,r.rows.map(m=>({...m,expertise:m.expertise||[],wants_to_learn:m.wants_to_learn||[]})));}catch(e){fail(res,e)}});
app.get('/api/sessions', async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT s.*,u.full_name AS host,COUNT(a.id)::int AS attendees FROM knowledge_sessions s JOIN mentors m ON m.id=s.mentor_id JOIN users u ON u.user_id=m.user_id LEFT JOIN session_attendees a ON a.session_id=s.id GROUP BY s.id,u.full_name ORDER BY s.session_date`);ok(res,r.rows)}catch(e){fail(res,e)}});
app.post('/api/sessions', async(req,res)=>{try{const {mentorId,topic,description='',sessionDate,durationMinutes=60,capacity=20,meetingUrl=''}=req.body;if(!mentorId||!topic||!sessionDate)return res.status(400).json({success:false,error:'mentorId, topic and sessionDate are required'});if(!isPostgresConnected)return ok(res,req.body);const r=await query(`INSERT INTO knowledge_sessions(mentor_id,topic,description,session_date,duration_minutes,capacity,meeting_url) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[mentorId,topic,description,sessionDate,durationMinutes,capacity,meetingUrl]);ok(res,r.rows[0]);}catch(e){fail(res,e)}});
app.post('/api/sessions/:id/rsvp', async(req,res)=>{try{const userId=req.body.userId||1;if(!isPostgresConnected)return ok(res,{session_id:req.params.id,user_id:userId,status:'Registered'});const s=await query('SELECT capacity FROM knowledge_sessions WHERE id=$1',[req.params.id]);if(!s.rows.length)return res.status(404).json({success:false,error:'Session not found'});const c=await query(`SELECT COUNT(*)::int n FROM session_attendees WHERE session_id=$1 AND status='Registered'`,[req.params.id]);if(c.rows[0].n>=s.rows[0].capacity)return res.status(409).json({success:false,error:'Session is full'});const r=await query(`INSERT INTO session_attendees(session_id,user_id) VALUES($1,$2) ON CONFLICT(session_id,user_id) DO UPDATE SET status='Registered' RETURNING *`,[req.params.id,userId]);await query(`INSERT INTO notifications(user_id,title,message,notification_type,is_read) VALUES($1,'Mentorship RSVP confirmed','Your knowledge-sharing session registration is confirmed.','MENTORSHIP',FALSE)`,[userId]);ok(res,r.rows[0]);}catch(e){fail(res,e)}});
app.post('/api/sessions/:id/feedback', async(req,res)=>{try{const {userId=1,rating,comment=''}=req.body;if(!rating||rating<1||rating>5)return res.status(400).json({success:false,error:'rating must be 1-5'});if(!isPostgresConnected)return ok(res,{session_id:req.params.id,user_id:userId,rating,comment});const r=await query(`INSERT INTO session_feedback(session_id,user_id,rating,comment) VALUES($1,$2,$3,$4) ON CONFLICT(session_id,user_id) DO UPDATE SET rating=EXCLUDED.rating,comment=EXCLUDED.comment RETURNING *`,[req.params.id,userId,rating,comment]);ok(res,r.rows[0]);}catch(e){fail(res,e)}});

app.get('/api/assessments/:userId', async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT a.assessment_id AS id,a.enrollment_id,COALESCE(a.title,a.assessment_name,'Assessment') AS title,a.assessment_name,COALESCE(a.type,'Self Assessment') AS type,COALESCE(a.category,'General') AS category,a.due_date,COALESCE(a.questions_count,10) AS questions_count,COALESCE(a.estimated_minutes,15) AS estimated_minutes,COALESCE(a.status,CASE WHEN a.marks_obtained IS NOT NULL THEN 'Completed' ELSE 'Pending' END) AS status,a.score,a.skill_name,a.assessor_user_id,
  COALESCE(a.subject_user_id,ep.user_id) AS subject_user_id,COALESCE(u.full_name,'Employee') AS subject_name,a.created_at,a.completed_at,a.total_marks,a.marks_obtained,a.assessment_date
  FROM assessments a LEFT JOIN training_enrollment te ON te.enrollment_id=a.enrollment_id LEFT JOIN employee_profile ep ON ep.profile_id=te.profile_id LEFT JOIN users u ON u.user_id=COALESCE(a.subject_user_id,ep.user_id)
  WHERE COALESCE(a.subject_user_id,ep.user_id)=$1 OR a.assessor_user_id=$1 ORDER BY CASE WHEN COALESCE(a.status,'Pending')='Pending' THEN 0 ELSE 1 END,a.due_date NULLS LAST,a.assessment_id DESC`,[req.params.userId]);ok(res,r.rows)}catch(e){fail(res,e)}});

app.post('/api/assessments/:id/submit', async(req,res)=>{
  try {
    const answers=req.body.answers||[]; if(!answers.length)return res.status(400).json({success:false,error:'answers are required'});
    if(!isPostgresConnected)return ok(res,{id:Number(req.params.id),status:'Completed',score:Math.round(answers.reduce((a,x)=>a+num(x.score),0)/answers.length)});
    const ar=await query(`SELECT a.*,COALESCE(a.subject_user_id,ep.user_id) AS resolved_user_id FROM assessments a LEFT JOIN training_enrollment te ON te.enrollment_id=a.enrollment_id LEFT JOIN employee_profile ep ON ep.profile_id=te.profile_id WHERE a.assessment_id=$1`,[req.params.id]);
    if(!ar.rows.length)return res.status(404).json({success:false,error:'Assessment not found'});
    const a=ar.rows[0], score=Math.round(answers.reduce((sum,x)=>sum+Math.max(0,Math.min(100,num(x.score))),0)/answers.length);
    for(const x of answers) await query(`INSERT INTO assessment_responses(assessment_id,question_no,score) VALUES($1,$2,$3) ON CONFLICT(assessment_id,question_no) DO UPDATE SET score=EXCLUDED.score`,[req.params.id,x.questionNo||1,Math.max(0,Math.min(100,num(x.score)))]);
    const updated=await query(`UPDATE assessments SET status='Completed',score=$1,marks_obtained=$1,total_marks=100,assessment_date=CURRENT_DATE,subject_user_id=COALESCE(subject_user_id,$2),completed_at=CURRENT_TIMESTAMP WHERE assessment_id=$3 RETURNING *`,[score,a.resolved_user_id,req.params.id]);
    if(a.resolved_user_id && a.skill_name){
      const skill=await query('SELECT skill_id FROM skills WHERE LOWER(skill_name)=LOWER($1) LIMIT 1',[a.skill_name]);
      if(skill.rows.length){
        await query(`INSERT INTO employee_skills(user_id,skill_id,proficiency_level,last_assessed_date,updated_at) VALUES($1,$2,$3,CURRENT_DATE,CURRENT_TIMESTAMP)
          ON CONFLICT(user_id,skill_id) DO UPDATE SET proficiency_level=EXCLUDED.proficiency_level,last_assessed_date=CURRENT_DATE,updated_at=CURRENT_TIMESTAMP`,[a.resolved_user_id,skill.rows[0].skill_id,score]);
        await query(`INSERT INTO notifications(user_id,title,message,notification_type,is_read) VALUES($1,'Assessment completed','Your assessment score was updated. Recalculate skill gaps to see the impact.','ASSESSMENT',FALSE)`,[a.resolved_user_id]);
      }
    }
    ok(res,{assessment:updated.rows[0],score});
  }catch(e){fail(res,e)}
});

app.get('/api/notifications/:userId',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT notification_id AS id,user_id,title,message,notification_type AS type,is_read,CASE WHEN is_read THEN created_at ELSE NULL END AS read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC,notification_id DESC`,[req.params.userId]);ok(res,r.rows)}catch(e){fail(res,e)}});
app.patch('/api/notifications/:id/read',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,{id:req.params.id,read_at:new Date().toISOString()});const r=await query(`UPDATE notifications SET is_read=TRUE WHERE notification_id=$1 RETURNING notification_id AS id,user_id,title,message,notification_type AS type,is_read,created_at`,[req.params.id]);if(!r.rows.length)return res.status(404).json({success:false,error:'Notification not found'});ok(res,{...r.rows[0],read_at:new Date().toISOString()});}catch(e){fail(res,e)}});
app.post('/api/notifications/:userId/read-all',async(req,res)=>{try{if(isPostgresConnected)await query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1',[req.params.userId]);ok(res,{updated:true})}catch(e){fail(res,e)}});

app.get('/api/resources',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT kr.*,u.full_name AS author_name FROM knowledge_resources kr LEFT JOIN users u ON u.user_id=kr.author_user_id ORDER BY kr.created_at DESC,kr.id DESC`);ok(res,r.rows)}catch(e){fail(res,e)}});
app.get('/api/communities',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const r=await query(`SELECT c.*,COUNT(cm.id)::int AS members FROM communities c LEFT JOIN community_members cm ON cm.community_id=c.id GROUP BY c.id ORDER BY c.name`);ok(res,r.rows)}catch(e){fail(res,e)}});
app.post('/api/communities/:id/join',async(req,res)=>{try{const userId=req.body.userId||1;if(!isPostgresConnected)return ok(res,{community_id:req.params.id,user_id:userId});const r=await query(`INSERT INTO community_members(community_id,user_id) VALUES($1,$2) ON CONFLICT(community_id,user_id) DO NOTHING RETURNING *`,[req.params.id,userId]);ok(res,r.rows[0]||{community_id:Number(req.params.id),user_id:userId,status:'Already a member'});}catch(e){fail(res,e)}});

app.get('/api/learning/renewals/:userId',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,[]);const profile=await getProfileId(req.params.userId);if(!profile)return ok(res,[]);const r=await query(`SELECT te.enrollment_id AS id,tc.course_name AS title,'Internal Training Catalog' AS provider,te.certification_expiry,te.status FROM training_enrollment te JOIN training_courses tc ON tc.course_id=te.course_id WHERE te.profile_id=$1 AND te.certification_expiry IS NOT NULL ORDER BY te.certification_expiry`,[profile]);ok(res,r.rows)}catch(e){fail(res,e)}});

app.get('/api/analytics/:userId',async(req,res)=>{try{if(!isPostgresConnected)return ok(res,{enrolledCourses:0,completedCourses:0,averageProgress:'0.0',averageAssessmentScore:'0.0',criticalGaps:0,moderateGaps:0,minorGaps:0,readinessScore:0});const profile=await getProfileId(req.params.userId);const e=profile?(await query(`SELECT COUNT(*)::int enrolled,COUNT(*) FILTER(WHERE status='Completed')::int completed,COALESCE(AVG(progress),0)::numeric avg_progress FROM training_enrollment WHERE profile_id=$1`,[profile])).rows[0]:{enrolled:0,completed:0,avg_progress:0};const a=(await query(`SELECT COALESCE(AVG(score),0)::numeric avg_score FROM assessments a LEFT JOIN training_enrollment te ON te.enrollment_id=a.enrollment_id LEFT JOIN employee_profile ep ON ep.profile_id=te.profile_id WHERE COALESCE(a.subject_user_id,ep.user_id)=$1 AND a.status='Completed'`,[req.params.userId])).rows[0];const g=await calculateGap(req.params.userId,'Software Developer');ok(res,{enrolledCourses:e.enrolled,completedCourses:e.completed,averageProgress:Number(e.avg_progress||0).toFixed(1),averageAssessmentScore:Number(a.avg_score||0).toFixed(1),criticalGaps:g.criticalCount,moderateGaps:g.moderateCount,minorGaps:g.minorCount,readinessScore:g.readinessScore});}catch(e){fail(res,e)}});

app.get('/api/reports/:type/:userId',async(req,res)=>{try{const type=req.params.type,uid=req.params.userId;if(!isPostgresConnected)return ok(res,[]);let rows=[];if(type==='learning'){const p=await getProfileId(uid);if(p)rows=(await query(`SELECT tc.course_name AS title,'Internal Training Catalog' AS provider,tc.category AS skill_name,te.status,te.progress,te.enrollment_date AS enrolled_at,te.completion_date AS completed_at FROM training_enrollment te JOIN training_courses tc ON tc.course_id=te.course_id WHERE te.profile_id=$1 ORDER BY te.enrollment_date DESC`,[p])).rows;}else if(type==='assessments'){rows=(await query(`SELECT assessment_id AS id,title,type,category,status,score,due_date,completed_at FROM assessments a LEFT JOIN training_enrollment te ON te.enrollment_id=a.enrollment_id LEFT JOIN employee_profile ep ON ep.profile_id=te.profile_id WHERE COALESCE(a.subject_user_id,ep.user_id)=$1 ORDER BY a.created_at DESC NULLS LAST,a.assessment_id DESC`,[uid])).rows;}else{rows=(await calculateGap(uid,'Software Developer')).gapDetails;}ok(res,rows);}catch(e){fail(res,e)}});

await initDB();
app.listen(PORT,()=>console.log(`🚀 Knowledge Gap API running on port ${PORT}`));
