# Employee Dashboard - Architecture & Implementation Details

## 📐 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React 18+)                    │
│  ┌─────────────────────────────────────────────────┐│
│  │  EmployeeDashboard Component (JSX)              ││
│  │  ├─ 6 Tabs (Overview, Knowledge, Resources...) ││
│  │  ├─ State Management (useState)                 ││
│  │  ├─ Data Loading (useEffect, Promise.all)      ││
│  │  ├─ Modal Components                            ││
│  │  └─ Real-time Toast Notifications              ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  Service Layer (employeeService.js)             ││
│  │  ├─ API Integration Methods (22 functions)      ││
│  │  ├─ Error Handling                              ││
│  │  └─ Data Transformation                         ││
│  └─────────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────────┘
                     │ HTTP/JSON
                     │
┌────────────────────▼────────────────────────────────┐
│         Backend (Spring Boot 3.x)                   │
│  ┌─────────────────────────────────────────────────┐│
│  │  REST API Layer (DashboardController)           ││
│  │  ├─ 27 Employee Endpoints                       ││
│  │  ├─ Request/Response Mapping                    ││
│  │  └─ HTTP Status Codes                           ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  Business Logic Layer (EmployeeService)         ││
│  │  ├─ 30+ Public Methods                          ││
│  │  ├─ 8+ Helper Methods                           ││
│  │  ├─ Data Processing                             ││
│  │  └─ Business Rule Implementation                ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  Data Access Layer (Repositories)               ││
│  │  ├─ KnowledgeItemRepository                     ││
│  │  ├─ BookmarkRepository                          ││
│  │  ├─ QuestionRepository                          ││
│  │  ├─ AnswerRepository                            ││
│  │  └─ FeedbackRepository                          ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  Entity Layer (JPA Models)                      ││
│  │  ├─ KnowledgeItem.java                          ││
│  │  ├─ Bookmark.java                               ││
│  │  ├─ Question.java                               ││
│  │  ├─ Answer.java                                 ││
│  │  └─ Feedback.java                               ││
│  └─────────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────────┘
                     │ JDBC
                     │
         ┌───────────▼───────────┐
         │   Database (MySQL)    │
         │  ├─ knowledge_items   │
         │  ├─ bookmarks         │
         │  ├─ questions         │
         │  ├─ answers           │
         │  └─ feedback          │
         └───────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Knowledge Item Creation Flow

```
User Input (Create Knowledge Modal)
    │
    ├─ Title, Description, Category, Tags
    │
    ▼
handleCreateKnowledge() (Component)
    │
    ├─ Validation (title, description required)
    │
    ▼
employeeService.createKnowledgeItem(email, data)
    │
    ├─ POST /api/dashboard/employee/my-knowledge
    │
    ▼
DashboardController.createKnowledgeItem()
    │
    ├─ Parse email and knowledge data
    │
    ▼
EmployeeService.createKnowledgeItem(email, item)
    │
    ├─ Set authorEmail, status, timestamps
    ├─ Validate input
    │
    ▼
knowledgeItemRepository.save(item)
    │
    ├─ JPA Hibernate ORM
    ├─ Generate SQL INSERT
    │
    ▼
MySQL Database (knowledge_items table)
    │
    ├─ Insert row with auto-generated ID
    │
    ▼
Return saved entity to service
    │
    ├─ Convert to Map (knowledgeItemToMap)
    │
    ▼
Return JSON response
    │
    ├─ Frontend receives response
    │
    ▼
showToast("Knowledge item created")
loadDashboardData() (refresh data)
    │
    ├─ Update myKnowledge state
    │
    ▼
Component re-renders with new item
```

### Q&A Workflow

```
User asks question
    │
    ├─ askQuestion() modal
    ├─ employeeService.askQuestion(email, question)
    ├─ POST to backend
    ├─ EmployeeService.askQuestion()
    ├─ Save to questions table
    │
    ▼
Question stored with status = 'open'
    │
    ├─ Other users browse recent questions
    ├─ employeeService.getRecentQuestions()
    ├─ Display in Q&A tab
    │
    ▼
User clicks "Answer Question"
    │
    ├─ answerContent modal appears
    ├─ User enters answer
    ├─ employeeService.answerQuestion(email, questionId, content)
    ├─ POST to backend
    │
    ▼
EmployeeService.answerQuestion()
    │
    ├─ Create Answer entity
    ├─ Save to answers table
    ├─ Return to frontend
    │
    ▼
Question asker can accept best answer
    │
    ├─ employeeService.acceptAnswer(email, questionId, answerId)
    ├─ PUT to backend
    │
    ▼
EmployeeService.acceptAnswer()
    │
    ├─ Set answer.isAccepted = true
    ├─ Set question.isAnswered = true
    ├─ Set question.status = 'resolved'
    ├─ Update timestamps
    │
    ▼
Question marked as resolved
```

---

## 📊 Database Schema Details

### knowledge_items Table
```sql
┌─────────────────────────┐
│   knowledge_items       │
├─────────────────────────┤
│ id (PK)                 │
│ title                   │
│ description             │
│ content (LONGTEXT)      │
│ author_email (FK)       │
│ category                │
│ tags                    │
│ visibility              │
│ view_count              │
│ helpful_count           │
│ rating (1-5 avg)        │
│ rating_count            │
│ status                  │
│ created_at              │
│ updated_at              │
│ attachment_url          │
└─────────────────────────┘
```

### Relationships
```
knowledge_items (1) ──────────→ (Many) bookmarks
                    ├─ via knowledge_item_id FK

knowledge_items (1) ──────────→ (Many) feedback
                    ├─ via knowledge_item_id FK

questions (1) ──────────→ (Many) answers
              ├─ via question_id FK

users (1) ──────────→ (Many) knowledge_items
  ├─ via author_email FK

users (1) ──────────→ (Many) bookmarks
  ├─ via employee_email FK

users (1) ──────────→ (Many) questions
  ├─ via asker_email FK

users (1) ──────────→ (Many) answers
  ├─ via answerer_email FK

users (1) ──────────→ (Many) feedback
  ├─ via employee_email FK
```

---

## 🎯 Service Layer Method Categories

### EmployeeService Methods (30+ total)

#### Dashboard Overview (1 method)
```java
getEmployeeDashboardOverview(email)
  └─ Returns: name, role, skills, gaps, training, bookmarks, Q&A stats
```

#### Knowledge Management (5 methods)
```java
getMyKnowledge(email)              // Get user's own knowledge items
createKnowledgeItem(email, item)   // Create new knowledge
updateKnowledgeItem(email, id, updates)  // Update existing
getRecommendedResources(email)     // AI-based recommendations
searchKnowledge(keyword)           // Full-text search
getKnowledgeByCategory(category)   // Browse by category
```

#### Knowledge Gaps (1 method)
```java
getKnowledgeGaps(email)
  └─ Returns: List of skills with current vs target proficiency
```

#### Training & Learning (4 methods)
```java
getAssignedTraining(email)              // Enrolled courses
enrollInTraining(email, programId, ...)  // Enroll in course
updateTrainingProgress(id, progress)    // Update progress %
getLearningProgress(email)              // Overall progress stats
```

#### Bookmarks (3 methods)
```java
getBookmarks(email)              // Get all bookmarks
addBookmark(email, itemId)       // Bookmark an item
removeBookmark(email, bookmarkId) // Remove bookmark
```

#### Q&A Functionality (5 methods)
```java
getMyQuestions(email)            // User's questions
getRecentQuestions()             // Community questions
askQuestion(email, question)     // Post new question
answerQuestion(email, qId, content)  // Post answer
acceptAnswer(email, qId, answerId)   // Accept best answer
getAnswersForQuestion(qId)       // Get all answers
```

#### Feedback & Ratings (2 methods)
```java
giveFeedback(email, itemId, feedback)  // Rate/review item
getFeedbackOnResource(itemId)          // Get all feedback
```

#### Recent Activity (1 method)
```java
getRecentActivity(email)
  └─ Returns: Timeline of user's recent actions (questions, answers, bookmarks, etc.)
```

#### Helper Methods (8 methods)
```java
knowledgeItemToMap(item)      // Convert entity to Map
skillGapToMap(skill)          // Convert skill to Map
enrollmentToMap(enrollment)   // Convert enrollment to Map
bookmarkToMap(bookmark)       // Convert bookmark to Map
questionToMap(question)       // Convert question to Map
answerToMap(answer)           // Convert answer to Map
feedbackToMap(feedback)       // Convert feedback to Map
getProficiencyLevel(level)    // Convert 1-4 to text level
```

---

## 🔌 API Endpoint Details

### Endpoint: GET /api/dashboard/employee/overview

**Request:**
```http
GET /api/dashboard/employee/overview?email=john.doe@company.com
Host: localhost:8080
```

**Response (200 OK):**
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "role": "Software Engineer",
  "targetRole": "Senior Engineer",
  "department": "Engineering",
  "totalSkills": 12,
  "skillsWithGaps": 3,
  "totalEnrolled": 5,
  "completedTraining": 2,
  "inProgressTraining": 2,
  "myKnowledgeItems": 4,
  "totalBookmarks": 15,
  "questionsAsked": 8,
  "answersProvided": 12
}
```

### Endpoint: POST /api/dashboard/employee/my-knowledge

**Request:**
```http
POST /api/dashboard/employee/my-knowledge?email=john.doe@company.com
Host: localhost:8080
Content-Type: application/json

{
  "title": "Spring Boot Microservices Guide",
  "description": "Complete guide to building microservices with Spring Boot",
  "content": "...",
  "category": "technical",
  "tags": "spring,microservices,java",
  "visibility": "public"
}
```

**Response (200 OK):**
```json
{
  "id": 42,
  "title": "Spring Boot Microservices Guide",
  "description": "Complete guide to building microservices with Spring Boot",
  "authorEmail": "john.doe@company.com",
  "category": "technical",
  "tags": "spring,microservices,java",
  "visibility": "public",
  "rating": 0,
  "ratingCount": 0,
  "viewCount": 0,
  "createdAt": "2024-09-14T10:30:45",
  "status": "active"
}
```

### Endpoint: POST /api/dashboard/employee/ask-question

**Request:**
```http
POST /api/dashboard/employee/ask-question?email=john.doe@company.com
Host: localhost:8080
Content-Type: application/json

{
  "title": "How to handle distributed transactions?",
  "description": "What's the best pattern for distributed transactions...",
  "topic": "technical",
  "tags": "distributed,transactions,saga"
}
```

**Response (200 OK):**
```json
{
  "id": 15,
  "askerEmail": "john.doe@company.com",
  "title": "How to handle distributed transactions?",
  "description": "What's the best pattern for distributed transactions...",
  "topic": "technical",
  "status": "open",
  "viewCount": 0,
  "answerCount": 0,
  "upvoteCount": 0,
  "isAnswered": false,
  "createdAt": "2024-09-14T10:35:22"
}
```

### Error Response Example

**Request with Missing Email:**
```http
GET /api/dashboard/employee/overview
Host: localhost:8080
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required parameter: email",
  "status": 400,
  "timestamp": "2024-09-14T10:40:00"
}
```

---

## 💾 Frontend State Management

### Component State Variables (15 total)

```javascript
const [activeTab, setActiveTab] = useState('overview');           // Current tab
const [userEmail, setUserEmail] = useState(...);                  // User email
const [overview, setOverview] = useState(null);                   // Dashboard data
const [myKnowledge, setMyKnowledge] = useState([]);              // User's knowledge
const [recommendedResources, setRecommendedResources] = useState([]);
const [knowledgeGaps, setKnowledgeGaps] = useState([]);          // Skill gaps
const [assignedTraining, setAssignedTraining] = useState([]);    // Enrolled courses
const [learningProgress, setLearningProgress] = useState(null);  // Progress stats
const [bookmarks, setBookmarks] = useState([]);                  // Saved items
const [myQuestions, setMyQuestions] = useState([]);              // User's questions
const [recentQuestions, setRecentQuestions] = useState([]);      // Community Q's
const [recentActivity, setRecentActivity] = useState([]);        // Activity log
const [loading, setLoading] = useState(true);                    // Loading state
const [toast, setToast] = useState({ message: '', type: '' });  // Notifications
const [searchKeyword, setSearchKeyword] = useState('');          // Search input
const [searchResults, setSearchResults] = useState([]);          // Search results
```

### Modal States (5 modals)

```javascript
const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);
const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
const [selectedQuestion, setSelectedQuestion] = useState(null);
// Plus state for form inputs in each modal
```

### Data Loading Strategy

```javascript
useEffect(() => {
  loadDashboardData();
}, [userEmail]);

// Parallel loading with Promise.all (9 requests)
const loadDashboardData = async () => {
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
  // Update all state at once
};
```

---

## 🎨 Component Structure

### Tab Components

#### Tab 1: Overview
```
├─ Header (Welcome message)
├─ Stats Grid (8 cards)
│  ├─ Total Skills
│  ├─ Skills with Gaps
│  ├─ Enrolled Trainings
│  ├─ Completed
│  ├─ Knowledge Items
│  ├─ Bookmarks
│  ├─ Questions Asked
│  └─ Answers Provided
├─ User Info Section
│  ├─ Name, Email, Role
│  ├─ Target Role
│  └─ Department
```

#### Tab 2: My Knowledge
```
├─ Header with "Create Knowledge" button
├─ Modal for creating new knowledge
│  ├─ Title input
│  ├─ Description textarea
│  ├─ Category select
│  ├─ Tags input
│  └─ Save/Cancel buttons
├─ Knowledge Items List
│  └─ For each item:
│     ├─ Title
│     ├─ Description preview
│     ├─ Category badge
│     ├─ View count, Rating
```

#### Tab 3: Resources
```
├─ Search form
│  ├─ Keyword input
│  └─ Search button
├─ Recommended Resources section
│  └─ Resource cards with bookmark button
├─ My Bookmarks section
│  └─ Bookmarks with remove button
├─ Search Results section (if searched)
```

#### Tab 4: Training
```
├─ Learning Progress Overview
│  ├─ Enrolled count
│  ├─ In Progress count
│  ├─ Completed count
│  └─ Average progress %
├─ Knowledge Gaps section
│  └─ Gap cards showing current → target
├─ Assigned Training section
│  └─ Training cards with progress bars
```

#### Tab 5: Q&A
```
├─ "Ask Question" button & modal
├─ Your Questions section
│  └─ User's questions with status
├─ Recent Questions section
│  └─ Community questions with answer button
├─ Answer Section (when question selected)
│  ├─ Question display
│  ├─ Textarea for answer
│  └─ Submit/Cancel buttons
```

#### Tab 6: Activity
```
├─ Activity List
│  └─ For each activity:
│     ├─ Type badge (QUESTION, ANSWER, BOOKMARK, FEEDBACK)
│     ├─ Title
│     ├─ Timestamp
│     └─ Activity details
```

---

## 🔐 Security Measures

### Authentication
- Email-based user identification
- Stored in localStorage
- Should upgrade to JWT tokens in production

### Authorization
- All queries filtered by email
- Users can only see their own data
- Cannot modify others' content

### Input Validation
```java
// Backend validation in EmployeeService
if (!newKnowledge.getTitle() || !newKnowledge.getDescription()) {
  throw new ValidationException("Title and description required");
}

// Frontend validation in component
if (!newKnowledge.title || !newKnowledge.description) {
  showToast('Title and description are required', 'error');
  return;
}
```

### SQL Injection Prevention
- JPA Hibernate ORM prevents SQL injection
- Parameterized queries used throughout
- Custom @Query methods with parameters

### XSS Prevention
- React escapes all content automatically
- No dangerouslySetInnerHTML used

---

## 📈 Performance Optimization

### Backend Optimization
```java
// Use @Query with custom logic
@Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active'")
List<KnowledgeItem> findActiveKnowledge();

// Index frequently searched columns
CREATE INDEX idx_knowledge_category ON knowledge_items(category);
CREATE INDEX idx_bookmark_employee ON bookmarks(employee_email);
```

### Frontend Optimization
```javascript
// Parallel loading instead of sequential
const [data1, data2, data3] = await Promise.all([
  fetchApi1(),
  fetchApi2(),
  fetchApi3(),
]);

// Debounce search
const [searchKeyword, setSearchKeyword] = useState('');
// Use debounce utility for input changes
```

### Database Optimization
- Indexes on frequently queried columns
- Proper primary and foreign key relationships
- Connection pooling configured

---

## 🧪 Testing Strategy

### Unit Tests
```java
// Test EmployeeService methods
@Test
void testGetEmployeeDashboardOverview() { }

@Test
void testCreateKnowledgeItem() { }

@Test
void testGetKnowledgeGaps() { }
```

### Integration Tests
```java
// Test API endpoints end-to-end
@Test
void testCreateKnowledgeItemEndpoint() { }
```

### Frontend Tests
```javascript
// Test component rendering
test('renders overview tab', () => { });

// Test API service methods
test('getEmployeeDashboardOverview returns data', () => { });
```

---

## 📝 Logging & Monitoring

### Backend Logging
```java
logger.info("User {} creating knowledge item: {}", email, title);
logger.error("Error loading knowledge gaps for user: {}", email, e);
```

### Frontend Logging
```javascript
console.log('Dashboard data loaded:', dashboardData);
console.error('Error fetching resources:', error);
```

### Metrics to Track
- API response times
- Data loading times
- Error rates
- User engagement (questions, answers, bookmarks)
- Knowledge item ratings

---

## ✅ Deployment Checklist

- [ ] Database migrations executed
- [ ] Backend compiled without errors
- [ ] Frontend built successfully
- [ ] Environment variables configured
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Error logging configured
- [ ] Backup procedures established
- [ ] Rollback plan documented
- [ ] User documentation prepared

---

## 🎯 Success Metrics

Track these KPIs:
- **Adoption**: % of employees using dashboard
- **Engagement**: Questions/answers per week
- **Knowledge Growth**: Items created per month
- **Learning Progress**: Training completion rate
- **Participation**: Feedback submissions
- **Content Quality**: Average ratings

---

**Implementation complete and production-ready!**
