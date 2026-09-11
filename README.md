# Organizational Knowledge Gap Intelligence Platform

An intelligent full-stack platform designed to identify employee knowledge gaps, assess competencies, recommend personalized learning, support mentorship, and provide organizational learning analytics.

---

## 🌐 Live Project

**Deployed Application:**
https://organizational-knowledge-platform-1.onrender.com/

---

## 📌 Project Overview

The **Organizational Knowledge Gap Intelligence Platform (OKIP)** is a full-stack web application developed to help organizations identify employee skill gaps and support continuous employee development.

The platform analyzes employee skills against required competency levels and provides learning and development opportunities through training, mentorship, assessments, and knowledge-sharing activities.

It provides role-based functionality for **Employees, HR, Managers, Department Heads, Mentors, and System Administrators**.

---

## 🎯 Objectives

The main objectives of the platform are to:

* Identify employee skill and knowledge gaps.
* Compare employee skills with required competency levels.
* Recommend relevant training based on identified gaps.
* Provide personalized learning opportunities.
* Support mentor allocation and mentorship activities.
* Enable knowledge-sharing sessions.
* Track employee training and learning progress.
* Support self, peer, and manager assessments.
* Provide team and department-level analytics.
* Help organizations make data-driven employee development decisions.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* Employee signup and login
* JWT-based authentication
* Role-based authorization
* Protected routes and APIs
* Forgot password and reset password functionality

### 👤 Employee Management

* Employee profile management
* Department and designation information
* Employee skill inventory
* Employee competency tracking

### 🧠 Skill & Knowledge Gap Analysis

* Skill assessment
* Competency framework
* Current vs required skill comparison
* Knowledge gap identification
* Gap priority classification
* Automatic gap recalculation after assessments

### 📝 Assessment

The platform supports:

* Self Assessment
* Peer Assessment
* Manager Assessment

Assessment results can be used to update employee skills and recalculate knowledge gaps.

### 🎓 Training & Learning

* Training recommendations
* Skill-based course recommendations
* Course enrollment
* Learning progress tracking
* Learning milestones
* Course completion tracking

### 🤝 Mentorship

* HR mentor allocation
* Mentorship requests
* Mentor acceptance/rejection
* Active mentorship tracking
* Mentorship history
* Mentor analytics

### 📚 Knowledge Sharing

* Expert Directory
* Knowledge-sharing sessions
* Session registration
* Attendance management
* Session feedback

### 🤖 AI-Powered Recommendations

The platform integrates **Google Gemini API** to provide personalized learning recommendations based on employee skills, roles, assessments, and identified knowledge gaps.

### 🔔 Notifications

Users receive notifications for important activities such as:

* Mentorship requests
* Mentorship updates
* Peer assessments
* Training-related activities
* Other organizational events

### 📊 Dashboards & Analytics

Role-specific dashboards provide insights into:

* Employee skills
* Knowledge gaps
* Training progress
* Team performance
* Training adoption
* Department skill coverage
* High-risk skill gaps
* Organizational learning trends

---

# 👥 User Roles

| Role                     | Main Responsibilities                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Employee**             | Assess skills, view knowledge gaps, enroll in training, participate in mentorship and peer assessments |
| **HR**                   | Manage employees, competencies, mentor allocation, training and organizational insights                |
| **Manager**              | Monitor team skill gaps, training adoption and employee progress                                       |
| **Department Head**      | Analyze department-level skills, gaps and performance                                                  |
| **Mentor**               | Manage mentorship requests and conduct knowledge-sharing sessions                                      |
| **System Administrator** | Manage system-level administration and configuration                                                   |

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide React

## Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Hibernate
* Spring Security
* Maven
* REST APIs

## Database

* MySQL
* Aiven MySQL for cloud deployment

## AI

* Google Gemini API

## Email

* Gmail SMTP

## Testing

* Swagger UI
* Postman

## Deployment

* Render
* Docker
* GitHub
* Aiven MySQL

---

# 📁 Project Structure

```text
Organizational-knowledge-platform/
│
├── backend/
│   └── knowledge-gap-platform/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/knowledgegap/
│       │   │   │       ├── config/
│       │   │   │       ├── controller/
│       │   │   │       ├── dto/
│       │   │   │       ├── entity/
│       │   │   │       ├── repository/
│       │   │   │       ├── security/
│       │   │   │       └── service/
│       │   │   │
│       │   │   └── resources/
│       │   │
│       │   └── test/
│       │
│       ├── Dockerfile
│       └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │   Vite + Tailwind CSS    │
                    └────────────┬─────────────┘
                                 │
                              REST API
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Spring Boot Backend   │
                    │ Java 21 + Spring Security│
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │    MySQL    │    │   Gemini AI  │    │ Gmail SMTP  │
       │   Database  │    │ Integration  │    │    Email    │
       └─────────────┘    └─────────────┘    └─────────────┘
```

---

# 🔄 Main Workflow

The platform follows an end-to-end employee development workflow:

```text
Employee Login
      ↓
Skill Assessment
      ↓
Skill Inventory Update
      ↓
Knowledge Gap Detection
      ↓
Training Recommendations
      ↓
Training Enrollment
      ↓
Learning Progress
      ↓
Milestone Completion
      ↓
Course Completion
      ↓
Skill Improvement
      ↓
Knowledge Gap Recalculation
```

---

# 🤝 Mentorship Workflow

```text
HR Allocates Mentor
        ↓
Employee Views Mentor
        ↓
Employee Sends Request
        ↓
Mentor Receives Notification
        ↓
Mentor Accepts / Rejects
        ↓
Active Mentorship
        ↓
Knowledge-Sharing Sessions
        ↓
Attendance & Feedback
```

---

# 📊 Role-Based Dashboards

### Employee Dashboard

Employees can access:

* Skill inventory
* Knowledge gaps
* Assessments
* Training recommendations
* Learning progress
* Mentorship
* Notifications
* Peer reviews

### HR Dashboard

HR can manage and monitor:

* Employees
* Competencies
* Workforce skills
* Mentor allocation
* Training information
* Organizational insights
* HR reports

### Manager Dashboard

Managers can monitor:

* Team size
* Team skill gaps
* Employees in training
* High-risk skill gaps
* Training adoption
* Employee progress
* Team analytics

### Department Head Dashboard

Department Heads can analyze:

* Department skill coverage
* Knowledge gaps
* Employee performance
* Training and development needs
* Department analytics

### Mentor Dashboard

Mentors can manage:

* Mentorship requests
* Active mentorships
* Knowledge sessions
* Attendance
* Mentorship history
* Learning-related activities

---

# 🔐 Security

The backend uses **Spring Security and JWT authentication**.

Protected APIs use:

```http
Authorization: Bearer <JWT_TOKEN>
```

The application also implements role-based access control to ensure that users can access only the functionality available to their assigned role.

Sensitive information such as:

```text
Database passwords
Gemini API keys
Gmail credentials
JWT tokens
Cloud database credentials
```

should be stored using environment variables and should not be committed to GitHub.

---

# 🧪 Testing

The application was tested using **Swagger UI and Postman**.

### Swagger UI

Swagger was used to:

* Explore REST APIs
* Test API endpoints
* Verify request and response data
* Test JWT-protected endpoints
* Validate HTTP status codes

Local Swagger URL:

```text
http://localhost:8080/swagger-ui/index.html
```

Production Swagger URL:

```text
https://organizational-knowledge-platform-1.onrender.com/swagger-ui/index.html
```

### Postman

**Postman** was used for API testing and validation independently of the frontend.

The following areas were tested:

* Authentication APIs
* Employee APIs
* Skill APIs
* Competency APIs
* Knowledge gap APIs
* Assessment APIs
* Mentorship APIs
* Mentor allocation APIs
* Training APIs
* Learning progress APIs
* Notification APIs
* Dashboard APIs
* AI APIs

JWT authentication was tested for protected endpoints using:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# ⚙️ Environment Configuration

Create a frontend environment file:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:

```env
VITE_API_URL=https://organizational-knowledge-platform-1.onrender.com/api
```

Backend credentials and API keys should also be configured through environment variables.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/knowledge_gap_platform
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password

GEMINI_API_KEY=your_gemini_api_key
```

---

# 🚀 Running the Project Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Organizational-knowledge-platform
```

## 2. Start the Backend

```bash
cd backend/knowledge-gap-platform
```

Build the application:

```bash
mvn clean package
```

Run the application:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## 3. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend URL will be displayed in the terminal.

---

# 🌍 Deployment

The application is deployed using **Render**.

### Production Application

https://organizational-knowledge-platform-1.onrender.com/

### Deployment Components

```text
React Frontend
      ↓
Render
      ↓
Spring Boot Backend
      ↓
Aiven MySQL
```

The backend is containerized using Docker and deployed through Render.

Production configuration uses environment variables for:

* Database connection
* Email configuration
* Gemini API
* Frontend API URL

---

# 📌 Key Modules

The major modules implemented in the platform include:

```text
Authentication & Authorization
Employee Management
Department Management
Skill Management
Competency Framework
Knowledge Gap Analysis
Self Assessment
Peer Assessment
Manager Assessment
Mentor Allocation
Mentorship
Expert Directory
Knowledge Sessions
Training & Learning
Learning Progress
Learning Milestones
AI Recommendations
Notifications
HR Analytics
Manager Analytics
Department Analytics
Reports
```

---

# 📜 Project Information

**Project:** Organizational Knowledge Gap Intelligence Platform

**Program:** Infosys Springboard Virtual Internship

**Development Branch:**

```text
team1-krishnapriya
```

The project was developed as a team-based full-stack application involving frontend development, backend REST APIs, database integration, AI integration, testing, and cloud deployment.

---

# 🙏 Acknowledgements

This project was developed as part of the **Infosys Springboard Virtual Internship**.

Special thanks to our mentors and team members for their guidance, collaboration, development support, and testing assistance.

---

# ⭐ Conclusion

The **Organizational Knowledge Gap Intelligence Platform** provides an end-to-end approach to employee skill development by connecting:

```text
Assessment
    ↓
Skill Analysis
    ↓
Knowledge Gap Detection
    ↓
Training Recommendation
    ↓
Mentorship
    ↓
Learning Progress
    ↓
Skill Improvement
    ↓
Organizational Analytics
```

The platform demonstrates the use of modern full-stack technologies, secure REST APIs, AI-powered recommendations, role-based dashboards, cloud deployment, and API testing using **Swagger and Postman**.

## 🌐 Live Application

https://organizational-knowledge-platform-1.onrender.com/
