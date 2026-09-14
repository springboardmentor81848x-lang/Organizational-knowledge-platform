import React, { useState } from 'react';
import { getStoredUser, roleFamily } from '../services/platformApi';

const initialKnowledgeItems = [
  {
    id: 1,
    title: 'Spring Boot 3 Security Implementation Guide',
    category: 'Architecture',
    type: 'Guide',
    author: 'Alice Smith',
    role: 'Software Engineer',
    department: 'Engineering',
    status: 'Published',
    date: '2026-09-10',
    tags: ['Spring Boot', 'JWT', 'Security'],
    rating: 4.9,
    bookmarks: 28,
    content: 'Comprehensive walkthrough on configuring JwtAuthenticationFilter, SecurityFilterChain, and BCryptPasswordEncoder in Spring Boot 3.3.',
  },
  {
    id: 2,
    title: 'Microservices Resiliency Patterns with Resilience4j',
    category: 'DevOps',
    type: 'Best Practice',
    author: 'Bob Chen',
    role: 'Data Analyst',
    department: 'Data Science',
    status: 'Published',
    date: '2026-09-08',
    tags: ['Microservices', 'Resilience', 'CircuitBreaker'],
    rating: 4.7,
    bookmarks: 19,
    content: 'How to handle service failures, retries, and fallback mechanisms gracefully across distributed cloud microservices.',
  },
  {
    id: 3,
    title: 'PostgreSQL Indexing Strategies for Large Scale Analytics',
    category: 'Data Science',
    type: 'Tutorial',
    author: 'Sarah Donovan',
    role: 'Principal Cloud Architect',
    department: 'Engineering',
    status: 'Pending Review',
    date: '2026-09-12',
    tags: ['PostgreSQL', 'SQL', 'Database'],
    rating: 4.8,
    bookmarks: 14,
    content: 'Optimizing query execution plans with B-Tree, GIN, and Partial indexes for high-throughput transactional databases.',
  },
  {
    id: 4,
    title: 'Enterprise Information Security & Data Privacy Policy 2026',
    category: 'Policy',
    type: 'Policy Document',
    author: 'HR Compliance',
    role: 'HR Specialist',
    department: 'HR & Ops',
    status: 'Published',
    date: '2026-09-01',
    tags: ['Security', 'Compliance', 'Privacy'],
    rating: 4.5,
    bookmarks: 85,
    content: 'Mandatory organizational policies covering data encryption standards, GDPR compliance, and employee device security.',
  },
];

const Articles = () => {
  const user = getStoredUser();
  const family = roleFamily(user.role || user.accountType || 'Employee');
  const canApprove = ['manager', 'hr', 'depthead', 'learning', 'system'].includes(family);

  const [items, setItems] = useState(initialKnowledgeItems);
  const [activeTab, setActiveTab] = useState('Published'); // Published | Pending Review
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([1, 4]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture');
  const [newType, setNewType] = useState('Guide');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleBookmarkToggle = (id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Published' } : item))
    );
  };

  const handleReject = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      type: newType,
      author: user.name || 'Current User',
      role: user.role || 'Employee',
      department: user.department || 'Engineering',
      status: canApprove ? 'Published' : 'Pending Review',
      date: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      rating: 5.0,
      bookmarks: 0,
      content: newContent,
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowCreateModal(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = item.status === activeTab;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Hero Header */}
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Organizational <span className="gradient-text">Knowledge Repository</span></h1>
          <p>Discover, publish, approve, and manage enterprise technical documents, best practices & policies.</p>
        </div>
        <button
          className="btn-hero primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Share Knowledge / Document
        </button>
      </div>

      {/* Control Bar & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('Published')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'Published' ? '#6366f1' : 'transparent',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📚 Published Repository ({items.filter((i) => i.status === 'Published').length})
          </button>
          <button
            onClick={() => setActiveTab('Pending Review')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'Pending Review' ? '#f59e0b' : 'transparent',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ⏳ Pending Review ({items.filter((i) => i.status === 'Pending Review').length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="🔍 Search articles, tags, authors, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          >
            <option value="All">All Categories</option>
            <option value="Architecture">Architecture</option>
            <option value="DevOps">DevOps</option>
            <option value="Data Science">Data Science</option>
            <option value="Policy">Policy</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {filteredItems.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
            <h3>No knowledge items found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria or create a new document entry.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: item.status === 'Pending Review' ? '1px dashed #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '20px', background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', fontWeight: 'bold' }}>
                      {item.category} • {item.type}
                    </span>
                    <button
                      onClick={() => handleBookmarkToggle(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                    >
                      {isBookmarked ? '🔖' : '📑'}
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {item.content}
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {item.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', pt: '0.85rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{item.author}</span> ({item.department})
                  </div>

                  {item.status === 'Pending Review' && canApprove ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApprove(item.id)}
                        style={{ padding: '0.3rem 0.65rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        style={{ padding: '0.3rem 0.65rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span>⭐ {item.rating}</span>
                      <span>📅 {item.date}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Submission */}
      {showCreateModal && (
        <div style={{ fixed: true, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Publish / Share Organizational Knowledge</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microservices Auth Flow with Spring Security"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Content Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="Guide">Guide</option>
                    <option value="Best Practice">Best Practice</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Policy Document">Policy Document</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Spring Boot, JWT, PostgreSQL"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>Document Description & Content</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide detailed instructions or documentation summary..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', background: '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;
