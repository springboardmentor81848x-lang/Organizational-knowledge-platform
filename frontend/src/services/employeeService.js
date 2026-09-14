// Frontend service for Employee Dashboard API integration
// Handles all API calls for employee-related features

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ==================== Dashboard Overview ====================

export const getEmployeeDashboardOverview = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/overview?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return null;
  }
};

// ==================== My Knowledge ====================

export const getMyKnowledge = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/my-knowledge?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching my knowledge:', error);
    return [];
  }
};

export const createKnowledgeItem = async (email, knowledgeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/my-knowledge?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(knowledgeData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating knowledge item:', error);
    return null;
  }
};

export const updateKnowledgeItem = async (email, itemId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/my-knowledge/${itemId}?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating knowledge item:', error);
    return null;
  }
};

// ==================== Recommended Resources ====================

export const getRecommendedResources = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/recommended-resources?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommended resources:', error);
    return [];
  }
};

// ==================== Knowledge Search ====================

export const searchKnowledge = async (keyword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/search-knowledge?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching knowledge:', error);
    return [];
  }
};

export const getKnowledgeByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/knowledge-by-category?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching knowledge by category:', error);
    return [];
  }
};

// ==================== Knowledge Gaps ====================

export const getKnowledgeGaps = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/knowledge-gaps?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching knowledge gaps:', error);
    return [];
  }
};

// ==================== Assigned Training ====================

export const getAssignedTraining = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/assigned-training?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching assigned training:', error);
    return [];
  }
};

export const enrollInTraining = async (email, enrollmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/enroll-training?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error enrolling in training:', error);
    return null;
  }
};

export const updateTrainingProgress = async (enrollmentId, progress) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/employee/training-progress/${enrollmentId}?progress=${progress}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating training progress:', error);
    return null;
  }
};

// ==================== Learning Progress ====================

export const getLearningProgress = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/learning-progress?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    return null;
  }
};

// ==================== Bookmarks ====================

export const getBookmarks = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/bookmarks?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

export const addBookmark = async (email, knowledgeItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/bookmarks?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ knowledgeItemId }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return null;
  }
};

export const removeBookmark = async (email, bookmarkId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/employee/bookmarks/${bookmarkId}?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return null;
  }
};

// ==================== Q&A ====================

export const getMyQuestions = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/my-questions?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching my questions:', error);
    return [];
  }
};

export const getRecentQuestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/recent-questions`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent questions:', error);
    return [];
  }
};

export const askQuestion = async (email, questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/ask-question?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error asking question:', error);
    return null;
  }
};

export const getAnswersForQuestion = async (questionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/question-answers/${questionId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching answers:', error);
    return [];
  }
};

export const answerQuestion = async (email, questionId, content) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/employee/answer-question/${questionId}?email=${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error posting answer:', error);
    return null;
  }
};

export const acceptAnswer = async (email, questionId, answerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/employee/accept-answer/${questionId}/${answerId}?email=${encodeURIComponent(email)}`,
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error accepting answer:', error);
    return null;
  }
};

// ==================== Feedback & Ratings ====================

export const giveFeedback = async (email, knowledgeItemId, feedbackData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/employee/feedback/${knowledgeItemId}?email=${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error giving feedback:', error);
    return null;
  }
};

export const getFeedbackOnResource = async (knowledgeItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/feedback/${knowledgeItemId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

// ==================== Recent Activity ====================

export const getRecentActivity = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/employee/recent-activity?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};
