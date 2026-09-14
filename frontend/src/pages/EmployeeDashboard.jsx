import React, { useState, useEffect } from 'react';
import * as employeeService from '../services/employeeService';
import { getStoredUser } from '../services/platformApi';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  // ==================== State Management ====================
  const [activeTab, setActiveTab] = useState('overview');
  const storedUser = getStoredUser();
  const [userEmail] = useState(storedUser.email || localStorage.getItem('userEmail') || '');
  
  // Dashboard data
  const [overview, setOverview] = useState(null);
  const [myKnowledge, setMyKnowledge] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [assignedTraining, setAssignedTraining] = useState([]);
  const [learningProgress, setLearningProgress] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Modal state
  const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newKnowledge, setNewKnowledge] = useState({
    title: '',
    description: '',
    content: '',
    category: 'technical',
    tags: '',
    visibility: 'public',
  });
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    topic: 'technical',
    tags: '',
  });
  const [answerContent, setAnswerContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // ==================== Data Loading ====================
  useEffect(() => {
    loadDashboardData();
  }, [userEmail]);

  const loadDashboardData = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [
        overviewData,
        myKnowData,
        recsData,
        gapsData,
        trainingData,
        progressData,
        bookmarksData,
        myQuestionsData,
        activityData,
      ] = await Promise.all([
        employeeService.getEmployeeDashboardOverview(userEmail),
        employeeService.getMyKnowledge(userEmail),
        employeeService.getRecommendedResources(userEmail),
        employeeService.getKnowledgeGaps(userEmail),
        employeeService.getAssignedTraining(userEmail),
        employeeService.getLearningProgress(userEmail),
        employeeService.getBookmarks(userEmail),
        employeeService.getMyQuestions(userEmail),
        employeeService.getRecentActivity(userEmail),
      ]);

      setOverview(overviewData);
      setMyKnowledge(myKnowData || []);
      setRecommendedResources(recsData || []);
      setKnowledgeGaps(gapsData || []);
      setAssignedTraining(trainingData || []);
      setLearningProgress(progressData);
      setBookmarks(bookmarksData || []);
      setMyQuestions(myQuestionsData || []);
      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentQuestions = async () => {
    try {
      const data = await employeeService.getRecentQuestions();
      setRecentQuestions(data || []);
    } catch (error) {
      console.error('Error loading recent questions:', error);
    }
  };

  // ==================== Event Handlers ====================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleSearchKnowledge = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    
    try {
      const results = await employeeService.searchKnowledge(searchKeyword);
      setSearchResults(results || []);
      showToast(`Found ${results?.length || 0} results`);
    } catch (error) {
      console.error('Error searching:', error);
      showToast('Error searching knowledge', 'error');
    }
  };

  const handleCreateKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.description) {
      showToast('Title and description are required', 'error');
      return;
    }

    try {
      await employeeService.createKnowledgeItem(userEmail, newKnowledge);
      showToast('Knowledge item created successfully');
      setNewKnowledge({
        title: '',
        description: '',
        content: '',
        category: 'technical',
        tags: '',
        visibility: 'public',
      });
      setShowNewKnowledgeModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error creating knowledge:', error);
      showToast('Error creating knowledge item', 'error');
    }
  };

  const handleAddBookmark = async (itemId) => {
    try {
      await employeeService.addBookmark(userEmail, itemId);
      showToast('Added to bookmarks');
      loadDashboardData();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      showToast('Error adding bookmark', 'error');
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await employeeService.removeBookmark(userEmail, bookmarkId);
      showToast('Bookmark removed');
      loadDashboardData();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showToast('Error removing bookmark', 'error');
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.title || !newQuestion.description) {
      showToast('Title and description are required', 'error');
      return;
    }

    try {
      await employeeService.askQuestion(userEmail, newQuestion);
      showToast('Question posted successfully');
      setNewQuestion({
        title: '',
        description: '',
        topic: 'technical',
        tags: '',
      });
      setShowAskQuestionModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error posting question:', error);
      showToast('Error posting question', 'error');
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!answerContent.trim()) {
      showToast('Answer cannot be empty', 'error');
      return;
    }

    try {
      await employeeService.answerQuestion(userEmail, questionId, answerContent);
      showToast('Answer posted successfully');
      setAnswerContent('');
      setSelectedQuestion(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error posting answer:', error);
      showToast('Error posting answer', 'error');
    }
  };

  const handleGiveFeedback = async (knowledgeItemId) => {
    if (!feedbackComment.trim()) {
      showToast('Feedback cannot be empty', 'error');
      return;
    }

    try {
      await employeeService.giveFeedback(userEmail, knowledgeItemId, {
        rating: feedbackRating,
        comment: feedbackComment,
        category: 'usefulness',
      });
      showToast('Feedback submitted successfully');
      setFeedbackRating(5);
      setFeedbackComment('');
      loadDashboardData();
    } catch (error) {
      console.error('Error giving feedback:', error);
      showToast('Error submitting feedback', 'error');
    }
  };

  const handleUpdateTrainingProgress = async (enrollmentId, newProgress) => {
    try {
      await employeeService.updateTrainingProgress(enrollmentId, newProgress);
      showToast('Training progress updated');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating progress:', error);
      showToast('Error updating progress', 'error');
    }
  };

  // ==================== Component Rendering ====================
  if (!userEmail) {
    return (
      <div className="employee-dashboard error-state">
        <div className="error-container">
          <p>Please log in to access the Employee Dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="employee-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Employee Dashboard</h1>
          <p className="welcome-text">Welcome, {overview?.name || 'Employee'}</p>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </header>

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'my-knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-knowledge')}
        >
          📚 My Knowledge
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          💡 Resources
        </button>
        <button
          className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          🎓 Training
        </button>
        <button
          className={`tab-button ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('qa');
            if (recentQuestions.length === 0) loadRecentQuestions();
          }}
        >
          ❓ Q&A
        </button>
        <button
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          🔔 Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.totalSkills || 0}</div>
                  <div className="stat-label">Total Skills</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.skillsWithGaps || 0}</div>
                  <div className="stat-label">Skills with Gaps</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎓</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.totalEnrolled || 0}</div>
                  <div className="stat-label">Enrolled Trainings</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.completedTraining || 0}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.myKnowledgeItems || 0}</div>
                  <div className="stat-label">Knowledge Items</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔖</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.totalBookmarks || 0}</div>
                  <div className="stat-label">Bookmarks</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.questionsAsked || 0}</div>
                  <div className="stat-label">Questions Asked</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <div className="stat-value">{overview?.answersProvided || 0}</div>
                  <div className="stat-label">Answers Provided</div>
                </div>
              </div>
            </div>

            <div className="user-info-section">
              <h3>Your Profile</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{overview?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{overview?.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span>{overview?.role || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Target Role:</label>
                  <span>{overview?.targetRole || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Department:</label>
                  <span>{overview?.department || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Knowledge Tab */}
        {activeTab === 'my-knowledge' && (
          <div className="my-knowledge-tab">
            <div className="tab-header">
              <h3>My Knowledge Items</h3>
              <button
                className="primary-btn"
                onClick={() => setShowNewKnowledgeModal(true)}
              >
                + Create Knowledge
              </button>
            </div>

            {showNewKnowledgeModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h4>Create Knowledge Item</h4>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newKnowledge.title}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    value={newKnowledge.description}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, description: e.target.value })}
                  ></textarea>
                  <select
                    value={newKnowledge.category}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, category: e.target.value })}
                  >
                    <option value="technical">Technical</option>
                    <option value="soft-skills">Soft Skills</option>
                    <option value="domain">Domain</option>
                    <option value="tools">Tools</option>
                    <option value="process">Process</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={newKnowledge.tags}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, tags: e.target.value })}
                  />
                  <div className="modal-buttons">
                    <button className="primary-btn" onClick={handleCreateKnowledge}>
                      Create
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setShowNewKnowledgeModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="items-list">
              {myKnowledge.length === 0 ? (
                <p className="empty-state">No knowledge items yet. Create one to get started!</p>
              ) : (
                myKnowledge.map((item) => (
                  <div key={item.id} className="item-card">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <span className="badge">{item.category}</span>
                      <span className="views">👁️ {item.viewCount} views</span>
                      <span className="rating">⭐ {item.rating}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="resources-tab">
            <div className="search-section">
              <form onSubmit={handleSearchKnowledge} className="search-form">
                <input
                  type="text"
                  placeholder="Search knowledge..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>

            <div className="resources-section">
              <h3>Recommended Resources</h3>
              <div className="resources-list">
                {recommendedResources.length === 0 ? (
                  <p className="empty-state">No recommendations at this time</p>
                ) : (
                  recommendedResources.map((resource) => (
                    <div key={resource.id} className="resource-card">
                      <div className="resource-header">
                        <h4>{resource.title}</h4>
                        <button
                          className="icon-btn"
                          onClick={() => handleAddBookmark(resource.id)}
                          title="Bookmark"
                        >
                          🔖
                        </button>
                      </div>
                      <p>{resource.description}</p>
                      <div className="resource-meta">
                        <span>{resource.category}</span>
                        <span>⭐ {resource.rating}</span>
                        <span>👁️ {resource.viewCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bookmarks-section">
              <h3>My Bookmarks ({bookmarks.length})</h3>
              <div className="bookmarks-list">
                {bookmarks.length === 0 ? (
                  <p className="empty-state">No bookmarks yet</p>
                ) : (
                  bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="bookmark-card">
                      <div className="bookmark-header">
                        <h5>{bookmark.itemTitle}</h5>
                        <button
                          className="icon-btn remove"
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="author">By {bookmark.itemAuthor}</p>
                      <span className="category-badge">{bookmark.itemCategory}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results-section">
                <h3>Search Results ({searchResults.length})</h3>
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div key={result.id} className="search-result-card">
                      <h4>{result.title}</h4>
                      <p>{result.description}</p>
                      <button className="primary-btn" onClick={() => handleAddBookmark(result.id)}>
                        Add to Bookmarks
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="training-tab">
            <div className="training-progress-overview">
              <h3>Your Learning Progress</h3>
              {learningProgress && (
                <div className="progress-overview">
                  <div className="progress-item">
                    <span>Enrolled:</span>
                    <strong>{learningProgress.totalEnrolled}</strong>
                  </div>
                  <div className="progress-item">
                    <span>In Progress:</span>
                    <strong>{learningProgress.inProgressCount}</strong>
                  </div>
                  <div className="progress-item">
                    <span>Completed:</span>
                    <strong>{learningProgress.completedCount}</strong>
                  </div>
                  <div className="progress-item">
                    <span>Average Progress:</span>
                    <strong>{learningProgress.averageProgress}%</strong>
                  </div>
                </div>
              )}
            </div>

            <h3>Knowledge Gaps</h3>
            <div className="gaps-list">
              {knowledgeGaps.length === 0 ? (
                <p className="empty-state">No knowledge gaps identified</p>
              ) : (
                knowledgeGaps.map((gap, idx) => (
                  <div key={idx} className="gap-card">
                    <div className="gap-header">
                      <h4>{gap.skillName}</h4>
                      <span className="gap-amount">Gap: {gap.gap} levels</span>
                    </div>
                    <div className="level-display">
                      <div className="level">
                        <small>Current</small>
                        <strong>{gap.proficiencyLevel}</strong>
                      </div>
                      <div className="arrow">→</div>
                      <div className="level">
                        <small>Target</small>
                        <strong>{gap.targetLevel}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h3>Assigned Training</h3>
            <div className="training-list">
              {assignedTraining.length === 0 ? (
                <p className="empty-state">No training assigned</p>
              ) : (
                assignedTraining.map((training) => (
                  <div key={training.id} className="training-card">
                    <div className="training-header">
                      <h4>{training.programTitle}</h4>
                      <span className="status" style={{
                        backgroundColor: training.status === 'completed' ? '#10b981' : training.status === 'in_progress' ? '#f59e0b' : '#6b7280'
                      }}>
                        {training.status}
                      </span>
                    </div>
                    <p className="provider">{training.provider}</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${training.progressPercent}%` }}></div>
                    </div>
                    <div className="progress-text">{training.progressPercent}% Complete</div>
                    {training.status !== 'completed' && (
                      <button
                        className="secondary-btn"
                        onClick={() => handleUpdateTrainingProgress(training.id, Math.min(training.progressPercent + 10, 100))}
                      >
                        Update Progress
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="qa-tab">
            <div className="qa-header">
              <h3>Questions & Answers</h3>
              <button
                className="primary-btn"
                onClick={() => setShowAskQuestionModal(true)}
              >
                + Ask Question
              </button>
            </div>

            {showAskQuestionModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h4>Ask a Question</h4>
                  <input
                    type="text"
                    placeholder="Question Title"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Question Details"
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  ></textarea>
                  <select
                    value={newQuestion.topic}
                    onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                  >
                    <option value="technical">Technical</option>
                    <option value="process">Process</option>
                    <option value="domain">Domain</option>
                    <option value="general">General</option>
                  </select>
                  <div className="modal-buttons">
                    <button className="primary-btn" onClick={handleAskQuestion}>
                      Post Question
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setShowAskQuestionModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="questions-section">
              <h4>Your Questions ({myQuestions.length})</h4>
              <div className="questions-list">
                {myQuestions.length === 0 ? (
                  <p className="empty-state">You haven't asked any questions yet</p>
                ) : (
                  myQuestions.map((q) => (
                    <div key={q.id} className="question-card">
                      <div className="question-header">
                        <h5>{q.title}</h5>
                        <span className={`status ${q.isAnswered ? 'answered' : 'open'}`}>
                          {q.isAnswered ? '✓ Answered' : 'Open'}
                        </span>
                      </div>
                      <p>{q.description}</p>
                      <div className="question-meta">
                        <span>👁️ {q.viewCount} views</span>
                        <span>💬 {q.answerCount} answers</span>
                        <span>👍 {q.upvoteCount} upvotes</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="recent-questions-section">
              <h4>Recent Questions from Community</h4>
              <div className="questions-list">
                {recentQuestions.length === 0 ? (
                  <p className="empty-state">No questions available</p>
                ) : (
                  recentQuestions.map((q) => (
                    <div key={q.id} className="question-card community">
                      <div className="question-header">
                        <h5>{q.title}</h5>
                      </div>
                      <p>{q.description}</p>
                      <div className="question-meta">
                        <span>👁️ {q.viewCount}</span>
                        <span>💬 {q.answerCount}</span>
                      </div>
                      <button
                        className="secondary-btn"
                        onClick={() => setSelectedQuestion(q)}
                      >
                        Answer Question
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedQuestion && (
              <div className="answer-section">
                <h4>Answer to: {selectedQuestion.title}</h4>
                <textarea
                  placeholder="Your answer..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  rows="5"
                ></textarea>
                <div className="button-group">
                  <button
                    className="primary-btn"
                    onClick={() => handleAnswerQuestion(selectedQuestion.id)}
                  >
                    Submit Answer
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerContent('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <p className="empty-state">No recent activity</p>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className={`activity-item ${activity.type}`}>
                    <div className="activity-type-badge">{activity.type}</div>
                    <div className="activity-content">
                      <h5>{activity.title}</h5>
                      <p className="timestamp">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
