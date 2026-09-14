# Employee Dashboard - Integration Checklist & Quick Reference

## 🎯 Quick Integration (30 minutes)

### Phase 1: Database Setup (5 minutes)

```sql
-- Create knowledge_items table
CREATE TABLE knowledge_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content LONGTEXT,
    author_email VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    tags VARCHAR(500),
    visibility VARCHAR(20) DEFAULT 'public',
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    attachment_url VARCHAR(500),
    rating INT DEFAULT 0,
    rating_count INT DEFAULT 0,
    FOREIGN KEY (author_email) REFERENCES users(email)
);

-- Create bookmarks table
CREATE TABLE bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    knowledge_item_id BIGINT,
    item_title VARCHAR(255),
    item_author VARCHAR(255),
    item_category VARCHAR(50),
    bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    folder_name VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (employee_email) REFERENCES users(email),
    FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_items(id)
);

-- Create questions table
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asker_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    topic VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    view_count INT DEFAULT 0,
    answer_count INT DEFAULT 0,
    upvote_count INT DEFAULT 0,
    tags VARCHAR(500),
    related_skills VARCHAR(500),
    is_answered BOOLEAN DEFAULT FALSE,
    accepted_answer_id BIGINT NULL,
    FOREIGN KEY (asker_email) REFERENCES users(email)
);

-- Create answers table
CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    answerer_email VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    helpful_count INT DEFAULT 0,
    expertise VARCHAR(50),
    answer_rating INT DEFAULT 0,
    rating_count INT DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (answerer_email) REFERENCES users(email)
);

-- Create feedback table
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    knowledge_item_id BIGINT,
    item_title VARCHAR(255),
    rating INT,
    comment LONGTEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    helpful_count INT DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (employee_email) REFERENCES users(email),
    FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_items(id)
);

-- Create indexes for better performance
CREATE INDEX idx_knowledge_item_author ON knowledge_items(author_email);
CREATE INDEX idx_knowledge_item_category ON knowledge_items(category);
CREATE INDEX idx_knowledge_item_status ON knowledge_items(status);
CREATE INDEX idx_bookmark_employee ON bookmarks(employee_email);
CREATE INDEX idx_bookmark_active ON bookmarks(is_active);
CREATE INDEX idx_question_asker ON questions(asker_email);
CREATE INDEX idx_question_status ON questions(status);
CREATE INDEX idx_answer_question ON answers(question_id);
CREATE INDEX idx_answer_answerer ON answers(answerer_email);
CREATE INDEX idx_feedback_employee ON feedback(employee_email);
CREATE INDEX idx_feedback_item ON feedback(knowledge_item_id);
```

### Phase 2: Backend Setup (10 minutes)

#### Step 1: Copy Model Files
```bash
# Copy these 5 files to: backend/src/main/java/com/infosys/knowledgeplatform/model/
- KnowledgeItem.java
- Bookmark.java
- Question.java
- Answer.java
- Feedback.java
```

#### Step 2: Copy Repository Files
```bash
# Copy these 5 files to: backend/src/main/java/com/infosys/knowledgeplatform/repository/
- KnowledgeItemRepository.java
- BookmarkRepository.java
- QuestionRepository.java
- AnswerRepository.java
- FeedbackRepository.java
```

#### Step 3: Copy Service File
```bash
# Copy to: backend/src/main/java/com/infosys/knowledgeplatform/service/
- EmployeeService.java
```

#### Step 4: Update DashboardController
- Add `EmployeeService` to constructor
- Add import: `import com.infosys.knowledgeplatform.model.*;`
- Add 27 new employee endpoints (see below)

#### Step 5: Compile Backend
```bash
cd backend
mvn clean compile
mvn clean install
```

### Phase 3: Frontend Setup (5 minutes)

#### Step 1: Copy Service File
```bash
# Copy to: frontend/src/services/
- employeeService.js
```

#### Step 2: Copy Component Files
```bash
# Copy to: frontend/src/pages/
- EmployeeDashboard.jsx
- EmployeeDashboard.css
```

#### Step 3: Update Routes
Add to your routing configuration:
```javascript
import EmployeeDashboard from './pages/EmployeeDashboard';

// In your routing setup:
<Route path="/employee-dashboard" element={<EmployeeDashboard />} />
```

### Phase 4: Testing (10 minutes)

```bash
# Start Backend
cd backend
mvn spring-boot:run

# In new terminal: Start Frontend
cd frontend
npm start

# Access dashboard at: http://localhost:3000/employee-dashboard
```

---

## 📝 API Endpoints Summary

### Overview (1 endpoint)
```bash
GET /api/dashboard/employee/overview?email=user@example.com
```

### Knowledge Management (7 endpoints)
```bash
GET    /api/dashboard/employee/my-knowledge?email=...
POST   /api/dashboard/employee/my-knowledge?email=...
PUT    /api/dashboard/employee/my-knowledge/{itemId}?email=...
GET    /api/dashboard/employee/recommended-resources?email=...
GET    /api/dashboard/employee/search-knowledge?keyword=...
GET    /api/dashboard/employee/knowledge-by-category?category=...
GET    /api/dashboard/employee/knowledge-gaps?email=...
```

### Training & Learning (5 endpoints)
```bash
GET    /api/dashboard/employee/assigned-training?email=...
POST   /api/dashboard/employee/enroll-training?email=...
PUT    /api/dashboard/employee/training-progress/{enrollmentId}?progress=...
GET    /api/dashboard/employee/learning-progress?email=...
```

### Bookmarks (3 endpoints)
```bash
GET    /api/dashboard/employee/bookmarks?email=...
POST   /api/dashboard/employee/bookmarks?email=...
DELETE /api/dashboard/employee/bookmarks/{bookmarkId}?email=...
```

### Q&A (7 endpoints)
```bash
GET  /api/dashboard/employee/my-questions?email=...
GET  /api/dashboard/employee/recent-questions
POST /api/dashboard/employee/ask-question?email=...
GET  /api/dashboard/employee/question-answers/{questionId}
POST /api/dashboard/employee/answer-question/{questionId}?email=...
PUT  /api/dashboard/employee/accept-answer/{questionId}/{answerId}?email=...
```

### Feedback (2 endpoints)
```bash
POST   /api/dashboard/employee/feedback/{knowledgeItemId}?email=...
GET    /api/dashboard/employee/feedback/{knowledgeItemId}
```

### Activity (1 endpoint)
```bash
GET    /api/dashboard/employee/recent-activity?email=...
```

**Total: 27 endpoints**

---

## 🧪 Testing with curl

### Test 1: Get Dashboard Overview
```bash
curl -X GET "http://localhost:8080/api/dashboard/employee/overview?email=john.doe@company.com"
```

### Test 2: Create Knowledge Item
```bash
curl -X POST "http://localhost:8080/api/dashboard/employee/my-knowledge?email=john.doe@company.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "REST API Best Practices",
    "description": "Guide to building scalable REST APIs",
    "content": "Full content here...",
    "category": "technical",
    "tags": "REST, API, Java, Spring",
    "visibility": "public"
  }'
```

### Test 3: Ask Question
```bash
curl -X POST "http://localhost:8080/api/dashboard/employee/ask-question?email=john.doe@company.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to optimize database queries?",
    "description": "What are the best practices...",
    "topic": "technical",
    "tags": "database, optimization"
  }'
```

### Test 4: Search Knowledge
```bash
curl -X GET "http://localhost:8080/api/dashboard/employee/search-knowledge?keyword=database"
```

---

## 💾 Sample Data Setup

Insert sample data for testing:

```sql
-- Insert sample knowledge items
INSERT INTO knowledge_items (title, description, author_email, category, tags, status, rating)
VALUES 
('Spring Boot Tutorial', 'Complete guide to Spring Boot', 'mentor@company.com', 'technical', 'spring,java,boot', 'active', 5),
('REST API Design', 'Best practices for REST design', 'architect@company.com', 'technical', 'rest,api,design', 'active', 4),
('Team Communication Skills', 'Effective communication tips', 'coach@company.com', 'soft-skills', 'communication,team', 'active', 5);

-- Insert sample questions
INSERT INTO questions (asker_email, title, description, topic, status)
VALUES
('employee1@company.com', 'How to use Spring Data JPA?', 'Can someone explain JPA...', 'technical', 'open'),
('employee2@company.com', 'Microservices architecture patterns?', 'What are the best patterns...', 'technical', 'open');

-- Insert sample bookmarks
INSERT INTO bookmarks (employee_email, knowledge_item_id, item_title, item_author, item_category)
VALUES
('employee1@company.com', 1, 'Spring Boot Tutorial', 'mentor@company.com', 'technical'),
('employee1@company.com', 2, 'REST API Design', 'architect@company.com', 'technical');
```

---

## 🔍 Verification Checklist

### Backend Compilation
```bash
cd backend
mvn clean compile
# ✓ Should have 0 errors
```

### Database Connection
```bash
mysql -u root -p
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'your_db';
# ✓ Should see: bookmarks, knowledge_items, questions, answers, feedback
```

### API Endpoints
```bash
# Test each endpoint group
GET    /api/dashboard/employee/overview?email=test@company.com
GET    /api/dashboard/employee/my-knowledge?email=test@company.com
POST   /api/dashboard/employee/ask-question?email=test@company.com
# ✓ All should return 200 OK (or data if empty)
```

### Frontend Import
```javascript
import EmployeeDashboard from './pages/EmployeeDashboard';
import * as employeeService from './services/employeeService';
// ✓ No import errors
```

---

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Database backups configured
- [ ] CORS properly configured for your domain
- [ ] Environment variables set (API_URL, DB_URL, etc.)
- [ ] SSL/TLS certificates installed
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Security audit completed
- [ ] Load testing passed

### Environment Variables
```bash
# Backend (application.properties)
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.url=jdbc:mysql://prod-db:3306/orgknowledge
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Frontend (.env)
REACT_APP_API_URL=https://api.yourcompany.com
```

---

## 📊 File Manifest

### Backend (11 files)

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| KnowledgeItem.java | Model | 45 | Knowledge article entity |
| Bookmark.java | Model | 40 | Bookmark tracking |
| Question.java | Model | 50 | Q&A question entity |
| Answer.java | Model | 45 | Q&A answer entity |
| Feedback.java | Model | 40 | Feedback/rating entity |
| KnowledgeItemRepository.java | Repo | 35 | Knowledge queries |
| BookmarkRepository.java | Repo | 30 | Bookmark queries |
| QuestionRepository.java | Repo | 40 | Question queries |
| AnswerRepository.java | Repo | 35 | Answer queries |
| FeedbackRepository.java | Repo | 35 | Feedback queries |
| EmployeeService.java | Service | 450+ | Business logic |
| DashboardController.java | Controller | 180+ | API endpoints (updated) |

**Total Backend: ~1,200+ lines of code**

### Frontend (2 files)

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| employeeService.js | Service | 350+ | API integration |
| EmployeeDashboard.jsx | Component | 750+ | React component |
| EmployeeDashboard.css | Stylesheet | 600+ | Responsive styling |

**Total Frontend: ~1,700+ lines of code**

---

## 🎨 UI Features

### 6 Main Tabs
1. **Overview** - Statistics and profile
2. **My Knowledge** - Knowledge sharing
3. **Resources** - Browse and bookmark
4. **Training** - Skill gaps and training
5. **Q&A** - Questions and answers
6. **Activity** - Recent contributions

### Responsive Design
- ✅ Desktop (> 1200px)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (< 768px)

### Interactive Elements
- Toast notifications
- Modal dialogs
- Loading spinners
- Empty states
- Error handling
- Progress bars
- Status badges

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 API errors | Check API_BASE_URL in employeeService.js |
| No data loading | Verify user email in localStorage |
| Database errors | Run schema creation script |
| CSS not loading | Check EmployeeDashboard.css path |
| CORS errors | Configure Spring Boot CORS settings |
| Compilation errors | Run `mvn clean install` |

---

## 📞 Support Resources

- **Backend Service**: See `EmployeeService.java` for all business logic methods
- **Frontend Component**: See `EmployeeDashboard.jsx` for UI implementation
- **API Docs**: Full endpoint specifications above
- **Database**: SQL schemas provided
- **Styling**: Complete CSS in `EmployeeDashboard.css`

---

## ✅ Success Criteria

- [ ] All 11 backend files created
- [ ] All 2 frontend files created
- [ ] All 5 database tables created
- [ ] Backend compiles (mvn clean compile)
- [ ] Frontend imports without errors
- [ ] Dashboard loads and displays data
- [ ] All 6 tabs function properly
- [ ] API calls return expected data
- [ ] Error handling works
- [ ] UI is responsive
- [ ] No console errors
- [ ] Performance acceptable (< 3s load)

---

## 🎉 You're Ready!

Your Employee Dashboard is ready for:
✅ Integration with existing system
✅ Testing and QA
✅ User acceptance testing
✅ Production deployment

**Questions? Refer to README_EMPLOYEE_DASHBOARD.md for detailed documentation.**
