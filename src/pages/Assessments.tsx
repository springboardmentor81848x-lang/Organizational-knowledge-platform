import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Star,
  Users,
  TrendingUp,
  History,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastMessage } from '../components/Toast';
import { Modal } from '../components/Modal';

export const Assessments: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'exams' | '360' | 'history'>('exams');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 360 Evaluation State
  const [evalForm, setEvalForm] = useState({
    evaluationType: 'SELF', // 'SELF' | 'PEER_360' | 'MANAGER_EVALUATION'
    employeeId: '1',
    skillId: '2',
    evaluatedProficiency: '4',
    feedback: 'Demonstrated exceptional understanding of asynchronous microservice patterns and distributed caching.',
  });
  const [evalResultModal, setEvalResultModal] = useState<any>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchAssessmentsAndHistory = async () => {
    try {
      setLoading(true);
      const [assRes, histRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/assessments/history'),
      ]);

      if (assRes.data.success) setAssessments(assRes.data.data);
      if (histRes.data.success) setHistory(histRes.data.data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentsAndHistory();
  }, []);

  const handleStartExam = async (id: number) => {
    try {
      const res = await api.get(`/assessments/${id}`);
      if (res.data.success) {
        setActiveAssessment(res.data.data);
        setUserAnswers({});
        setResult(null);
      }
    } catch (err) {
      console.error('Failed to load exam:', err);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;

    const answersArray = activeAssessment.questions.map((_: any, idx: number) => userAnswers[idx] ?? -1);

    try {
      const res = await api.post(`/assessments/${activeAssessment.id}/submit`, {
        answers: answersArray,
        employeeId: user?.employee?.id || user?.id || 1,
      });

      if (res.data.success) {
        setResult({
          ...res.data.data,
          message: res.data.message,
        });
        addToast(
          res.data.data.passed ? 'success' : 'info',
          res.data.data.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed',
          res.data.message
        );
        fetchAssessmentsAndHistory();
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/assessments/evaluate', {
        employeeId: evalForm.employeeId,
        skillId: evalForm.skillId,
        evaluationType: evalForm.evaluationType,
        evaluatedProficiency: Number(evalForm.evaluatedProficiency),
        feedback: evalForm.feedback,
      });

      if (res.data.success) {
        setEvalResultModal(res.data.data);
        addToast('success', 'Proficiency & Gap Recalculated! ⚡', res.data.message);
        fetchAssessmentsAndHistory();
      }
    } catch (err: any) {
      addToast('error', 'Evaluation Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-800">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-3">
            <FileCheck className="w-3.5 h-3.5" /> Skill Verification & Dynamic Gap Recalculation
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Skill Assessments, 360° Evaluation & Gap Recalculation
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Take timed competency exams, submit Self, Peer 360 or Manager evaluations, and watch the platform automatically recalculate proficiency improvements and resolve knowledge gaps.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => {
            setActiveTab('exams');
            setActiveAssessment(null);
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Play className="w-4 h-4" /> Competency Exams ({assessments.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('360');
            setActiveAssessment(null);
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === '360'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 360° Evaluation (Self / Peer / Manager)
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setActiveAssessment(null);
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" /> Historical Assessment Comparison ({history.length})
        </button>
      </div>

      {/* TAB 1: COMPETENCY EXAMS */}
      {activeTab === 'exams' && (
        <>
          {!activeAssessment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                        {a.skill_name || 'Engineering Competency'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Passing Benchmark: {a.pass_score}%
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{a.description}</p>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Questions: <strong>{a.questions?.length || 3} items</strong></span>
                      <span>Target Level: <strong>Level 4 (Advanced)</strong></span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Instant Skill & Gap Recalculation
                    </span>
                    <button
                      onClick={() => handleStartExam(a.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Assessment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Active Exam Taking / Result Container */
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {!result ? (
                <form onSubmit={handleSubmitExam} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {activeAssessment.skill_name}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">{activeAssessment.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveAssessment(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                    >
                      Exit Exam
                    </button>
                  </div>

                  <div className="space-y-6">
                    {activeAssessment.questions?.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                        <h4 className="font-bold text-sm text-slate-900 flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-teal-600 text-white rounded-md text-xs font-bold shrink-0">
                            Q{qIdx + 1}
                          </span>
                          {q.question}
                        </h4>

                        <div className="space-y-2 pt-1">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isSelected = userAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/25 cursor-pointer"
                    >
                      Submit Exam for Instant Evaluation <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Exam Result Card */
                <div className="space-y-6 text-center py-4">
                  <div className="inline-flex p-4 rounded-full bg-teal-50 border border-teal-200 text-teal-600">
                    {result.passed ? <Award className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12 text-amber-500" />}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {result.passed ? 'Skill Proficiency Verified! 🎉' : 'Assessment Completed'}
                    </h2>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">{result.message}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Final Score</div>
                      <div className="text-lg font-black text-slate-900">{result.score}%</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">New Proficiency</div>
                      <div className="text-lg font-black text-teal-600">Level {result.new_proficiency_level}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Proficiency Gain</div>
                      <div className="text-lg font-black text-indigo-600">+{result.skill_improvement || 1} Levels</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Remaining Gap</div>
                      <div className="text-lg font-black text-slate-900">
                        {result.gap_after === 0 ? (
                          <span className="text-emerald-600">Resolved (0)</span>
                        ) : (
                          `${result.gap_after} Levels`
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setActiveAssessment(null);
                        setResult(null);
                      }}
                      className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Return to Assessments
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: 360-DEGREE EVALUATION PORTAL */}
      {activeTab === '360' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Multi-Rater 360° Evaluation & Gap Recalculation Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit Self Assessments, Peer 360 Reviews, or Manager Evaluations. Upon submission, the engine updates proficiency levels and computes <code>Required - New Level</code>.
            </p>
          </div>

          <form onSubmit={handleSubmitEvaluation} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setEvalForm({ ...evalForm, evaluationType: 'SELF' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  evalForm.evaluationType === 'SELF'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-sm">Self Assessment</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">Reflect on personal progress and practical implementation.</div>
              </button>

              <button
                type="button"
                onClick={() => setEvalForm({ ...evalForm, evaluationType: 'PEER_360' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  evalForm.evaluationType === 'PEER_360'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-sm">Peer 360° Assessment</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">Cross-functional team feedback on architectural execution.</div>
              </button>

              <button
                type="button"
                onClick={() => setEvalForm({ ...evalForm, evaluationType: 'MANAGER_EVALUATION' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  evalForm.evaluationType === 'MANAGER_EVALUATION'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-sm">Manager Evaluation</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">Authoritative competency sign-off and gap resolution.</div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Employee</label>
                <select
                  value={evalForm.employeeId}
                  onChange={(e) => setEvalForm({ ...evalForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="1">Alex Rivera (Software Engineer - Engineering)</option>
                  <option value="2">Sarah Jenkins (Lead Architect - Engineering)</option>
                  <option value="3">David Kumar (Backend Engineer - Engineering)</option>
                  <option value="4">Elena Rostova (Frontend Engineer - Engineering)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Skill for Evaluation</label>
                <select
                  value={evalForm.skillId}
                  onChange={(e) => setEvalForm({ ...evalForm, skillId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="2">Spring Boot & Microservices</option>
                  <option value="1">React & Frontend Performance</option>
                  <option value="3">Docker & Kubernetes Orchestration</option>
                  <option value="4">SQL & Database Optimization</option>
                  <option value="5">Cybersecurity & Cloud Compliance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Evaluated Proficiency Level (1 to 5 Scale)</label>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEvalForm({ ...evalForm, evaluatedProficiency: String(lvl) })}
                    className={`py-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      evalForm.evaluatedProficiency === String(lvl)
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Level {lvl}
                    <div className="text-[10px] font-normal opacity-80">
                      {lvl === 1 ? 'Novice' : lvl === 2 ? 'Intermediate' : lvl === 3 ? 'Proficient' : lvl === 4 ? 'Advanced' : 'Expert'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Evaluation Notes & Competency Evidence</label>
              <textarea
                rows={3}
                value={evalForm.feedback}
                onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })}
                placeholder="Detail specific evidence of skill mastery, architectural decisions, and production deployments..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
              >
                Submit Evaluation & Recalculate Gaps <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HISTORICAL ASSESSMENT COMPARISON */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                Historical Skill Proficiency & Gap Improvement Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of proficiency levels before vs after evaluations with explicit skill gain calculations.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Total Records: {history.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Skill Evaluated</th>
                  <th className="py-3 px-4">Assessment Type</th>
                  <th className="py-3 px-4">Proficiency Transition</th>
                  <th className="py-3 px-4">Skill Gain</th>
                  <th className="py-3 px-4">Knowledge Gap</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(h.taken_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {h.employee_name || 'Alex Rivera'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {h.skill_name || 'Spring Boot Microservices'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {h.assessment_type || 'SKILL_EXAM'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-500">L{h.previous_proficiency_level || 2}</span>
                        <ArrowRight className="w-3 h-3 text-teal-600" />
                        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          L{h.new_proficiency_level || 4}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +{h.skill_improvement || 2} Levels
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-600">
                        Gap {h.gap_before || 2} → <strong className="text-slate-900">{h.gap_after || 0}</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {h.gap_after === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVALUATION RESULT MODAL */}
      {evalResultModal && (
        <Modal
          isOpen={!!evalResultModal}
          onClose={() => setEvalResultModal(null)}
          title="Skill Recalculation & Gap Resolution Summary"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
              <h4 className="font-bold text-sm">Competency Successfully Updated! 🎉</h4>
              <p className="text-[11px]">
                The proficiency score and department requirements have been synchronized across the database.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold uppercase">New Proficiency</div>
                <div className="text-base font-black text-slate-900">Level {evalResultModal.new_proficiency_level}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Remaining Gap</div>
                <div className="text-base font-black text-emerald-600">
                  {evalResultModal.gap_after === 0 ? 'Resolved (0)' : `${evalResultModal.gap_after} Levels`}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Feedback Logged</div>
              <p className="text-slate-700 italic">"{evalResultModal.feedback}"</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEvalResultModal(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
              >
                Close Summary
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
