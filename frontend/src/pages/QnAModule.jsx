import React, { useState } from 'react';
import { getStoredUser } from '../services/platformApi';

const initialQuestions = [
  {
    id: 1,
    title: 'How to handle JWT token expiration gracefully in React Axios interceptors?',
    askedBy: 'Alice Smith',
    role: 'Software Engineer',
    department: 'Engineering',
    date: '2026-09-11',
    votes: 14,
    tags: ['React', 'JWT', 'Security'],
    answers: [
      {
        id: 101,
        author: 'Bob Chen',
        role: 'Data Analyst',
        text: 'You can catch HTTP 401 responses in response interceptors, invoke your /api/auth/refresh endpoint once, update localStorage token, and retry original request.',
        votes: 12,
        accepted: true,
      },
    ],
  },
  {
    id: 2,
    title: 'What is the recommended Flyway database migration naming pattern for Spring Boot 3?',
    askedBy: 'Priya Sharma',
    role: 'UX Lead',
    department: 'Product',
    date: '2026-09-13',
    votes: 8,
    tags: ['Spring Boot', 'PostgreSQL', 'Flyway'],
    answers: [],
  },
];

const QnAModule = () => {
  const user = getStoredUser();
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const [answerInputs, setAnswerInputs] = useState({});

  const handleVote = (qId, delta) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, votes: q.votes + delta } : q))
    );
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQ = {
      id: Date.now(),
      title: newTitle,
      askedBy: user.name || 'Current User',
      role: user.role || 'Employee',
      department: user.department || 'Engineering',
      date: new Date().toISOString().split('T')[0],
      votes: 1,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      answers: [],
    };

    setQuestions([newQ, ...questions]);
    setNewTitle('');
    setNewTags('');
    setShowAskModal(false);
  };

  const handleAddAnswer = (qId) => {
    const text = answerInputs[qId];
    if (!text || !text.trim()) return;

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const newAns = {
            id: Date.now(),
            author: user.name || 'Current User',
            role: user.role || 'Employee',
            text,
            votes: 0,
            accepted: false,
          };
          return { ...q, answers: [...q.answers, newAns] };
        }
        return q;
      })
    );

    setAnswerInputs({ ...answerInputs, [qId]: '' });
  };

  const handleAcceptAnswer = (qId, ansId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            answers: q.answers.map((a) => ({
              ...a,
              accepted: a.id === ansId,
            })),
          };
        }
        return q;
      })
    );
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Organizational <span className="gradient-text">Q&A Knowledge Forum</span></h1>
          <p>Ask technical questions, clarify doubts, share solutions & crowdsource answers across departments.</p>
        </div>
        <button className="btn-hero primary" onClick={() => setShowAskModal(true)}>
          ❓ Ask Question
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search questions, topics or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: '0.9rem',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {filteredQuestions.map((q) => (
          <div key={q.id} className="card" style={{ display: 'flex', gap: '1.25rem' }}>
            {/* Vote Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
              <button
                onClick={() => handleVote(q.id, 1)}
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ▲
              </button>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{q.votes}</span>
              <button
                onClick={() => handleVote(q.id, -1)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ▼
              </button>
            </div>

            {/* Question Details */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc' }}>{q.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {q.tags.map((t, idx) => (
                  <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    #{t}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Asked by <span style={{ color: '#fff', fontWeight: '600' }}>{q.askedBy}</span> ({q.department}) on {q.date}
              </div>

              {/* Answers Section */}
              {q.answers.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#a5b4fc' }}>Answers ({q.answers.length}):</h4>
                  {q.answers.map((ans) => (
                    <div
                      key={ans.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: ans.accepted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                        border: ans.accepted ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fff' }}>{ans.author}</span>
                        {ans.accepted ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>✓ Accepted Answer</span>
                        ) : (
                          <button
                            onClick={() => handleAcceptAnswer(q.id, ans.id)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Mark as accepted
                          </button>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ans.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Answer Box */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Write your answer..."
                  value={answerInputs[q.id] || ''}
                  onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
                <button
                  onClick={() => handleAddAnswer(q.id)}
                  style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Post Answer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Ask an Organizational Question</h2>
            <form onSubmit={handleAddQuestion} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Question Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to set up Redis cache with Spring Boot?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Spring Boot, Redis, Cache"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', background: '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QnAModule;
