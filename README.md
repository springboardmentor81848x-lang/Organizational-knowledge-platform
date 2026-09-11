# Organizational Knowledge Gap Intelligence Platform

An intelligent full-stack platform for identifying employee knowledge gaps, assessing competencies, recommending personalized learning, supporting mentorship, and providing organizational learning analytics.

---

## 🌐 Live Project

The **Organizational Knowledge Gap Intelligence Platform** is deployed and available online:

**Live Application:**
https://organizational-knowledge-platform-1.onrender.com/

The deployed application provides access to the platform's role-based dashboards, employee learning workflows, assessments, mentorship, training, notifications, and organizational analytics.

> **Note:** The application may take a short time to respond if the Render service is waking up from inactivity.

---

## 📌 Project Overview

The **Organizational Knowledge Gap Intelligence Platform (OKIP)** is a full-stack web application designed to help organizations understand employee capabilities and identify areas where additional knowledge or training is required.

The platform combines:

* Employee skill assessments
* Competency frameworks
* Knowledge gap detection
* Personalized training recommendations
* AI-powered learning recommendations
* Mentorship management
* Knowledge-sharing sessions
* Self, peer, and manager assessments
* Learning progress tracking
* Department and team analytics
* Notifications
* HR and management dashboards

The system supports multiple organizational roles and provides role-specific dashboards and workflows.

---

# 🎯 Objectives

The primary objectives of the platform are to:

1. Identify skill and competency gaps among employees.
2. Compare current employee skills against required competency levels.
3. Recommend appropriate training based on identified knowledge gaps.
4. Provide personalized learning paths.
5. Enable employee-to-employee knowledge sharing.
6. Support HR-managed mentor allocation.
7. Enable mentors to conduct knowledge-sharing sessions.
8. Track employee learning progress and milestones.
9. Evaluate employees through self, peer, and manager assessments.
10. Provide management with skill-gap and training analytics.
11. Automatically recalculate skill gaps after assessments and learning activities.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │       React Frontend     │
                    │   Vite + Tailwind CSS    │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌──────────────────────────┐
                    │     Spring Boot Backend  │
                    │ Java 21 + Spring Security│
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │    MySQL    │    │   Gemini AI │    │ Gmail SMTP  │
       │   Database  │    │ Integration  │    │    Email    │
       └─────────────┘    └─────────────┘    └─────────────┘
```

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

## Communication

* Gmail SMTP

## Testing

* Swagger UI
* Postman

## Deployment

* Render
* GitHub
* Docker

---

# 👥 User Roles

The platform supports the following roles:

| Role                 | Responsibility                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Employee             | Assess skills, view knowledge gaps, enroll in training, participate in mentorship and peer assessment |
| HR                   | Manage employees, competencies, mentor allocation, training and organizational insights               |
| Manager              | Monitor team performance, skill gaps, training adoption and employee progress                         |
| Department Head      | Analyze department-level skill coverage, gaps and performance                                         |
| Mentor               | Accept mentorship requests, conduct knowledge sessions and support employees                          |
| System Administrator | Manage system-level administration and configuration                                                  |

---

# ✨ Major Features

## 1. Authentication & Authorization

The platform provides secure authentication and role-based authorization.

Features include:

* Employee signup and login
* Role-based access
* JWT authentication
* Secure API authorization
* Forgot password workflow
* Reset password workflow
* Protected dashboards
* Role-specific navigation
* Secure API endpoints

---

## 2. Employee Management

HR and management users can manage employee information including:

* Employee ID
* Name
* Email
* Department
* Designation
* Role
* Skills
* Competencies

Business employee identifiers such as:

```text
EMP1001
EMP1002
MEN001
```

are used throughout the application.

---

## 3. Department Management

The platform supports organizational departments and their employees.

Departments are used for:

* Team analytics
* Department analytics
* Skill coverage
* Knowledge gap reporting
* Manager dashboards
* Department Head dashboards

---

## 4. Skill Management

The platform maintains an organizational skill inventory.

Each skill can include:

* Skill name
* Category
* Description

Employee skills are tracked using proficiency levels.

---

## 5. Competency Management

Competencies define the expected skill level for a particular designation.

The system compares the employee's current skill level against the required competency level.

```text
Current Employee Skill Level
              ↓
Required Competency Level
              ↓
Knowledge Gap
```

HR can configure competency requirements for different designations and skills.

---

# 🧠 Knowledge Gap Analysis

The Knowledge Gap module compares the employee's current skill level with the required competency level.

Example:

```text
Current Level  = 2
Required Level = 4

Knowledge Gap = 2
```

Knowledge gaps can be categorized by priority:

| Gap | Priority |
| --- | -------- |
| 0   | LOW      |
| 1   | MEDIUM   |
| 2   | HIGH     |
| 3+  | CRITICAL |

The identified gaps are used to support training recommendations and employee development.

---

# 📝 Skill Assessment

Employees can complete assessments to determine their current proficiency.

The platform supports employee assessment workflows and skill-level updates.

Assessment results can automatically update the employee's skill inventory.

Example proficiency mapping:

```text
90–100 → Expert
75–89  → Advanced
60–74  → Competent
40–59  → Intermediate
0–39   → Beginner
```

Assessment information can then be used for knowledge-gap calculation.

---

# 🤝 Mentorship Ecosystem

The platform contains two separate mentorship concepts.

## HR Mentor Allocation

HR can allocate or recommend mentors to employees based on skills and organizational needs.

Workflow:

```text
HR
 ↓
Allocate Mentor
 ↓
Employee sees allocated mentor
 ↓
Employee sends mentorship request
 ↓
Mentor receives notification
 ↓
Mentor accepts / rejects
 ↓
Accepted
 ↓
Mentorship becomes Active
 ↓
Knowledge Sessions
```

Supported mentorship statuses include:

```text
REQUESTED
ACCEPTED
REJECTED
ACTIVE
COMPLETED
CANCELLED
```

---

## Expert Directory

The Expert Directory is a separate peer-to-peer knowledge-sharing feature.

It allows employees to discover other employees based on expertise.

Important rule:

> The Expert Directory displays only users with the `EMPLOYEE` role.

Mentors and other non-employee roles are excluded from the Expert Directory.

HR mentor allocations are independent from this peer-to-peer directory.

---

# 👨‍🏫 Mentor Management

Mentors have dedicated functionality for managing mentorship activities.

Mentors can:

* View mentor profile
* View expertise
* View mentorship requests
* Accept requests
* Reject requests
* Activate mentorships
* Complete mentorships
* View active mentorships
* View mentorship history
* View mentor analytics

---

# 📚 Knowledge Sessions

Mentors can create knowledge-sharing sessions for employees.

Supported operations include:

* View available sessions
* View all sessions
* View mentor sessions
* Create session
* Update session
* Cancel session
* Complete session

Employees can:

* Register for sessions
* Cancel registration
* View registrations
* Attend sessions
* Provide feedback

Mentors can also manage attendance.

---

# 🎓 Training & Learning

The Training & Learning module provides training recommendations based on employee knowledge gaps.

The system follows this workflow:

```text
Employee Knowledge Gaps
          ↓
Matching Skills
          ↓
Recommended Courses
          ↓
Priority Ranking
          ↓
Employee Enrollment
          ↓
Learning Progress
          ↓
Milestone Completion
          ↓
Course Completion
```

Features include:

* Recommended courses
* Skill-based filtering
* Course search
* Priority classification
* Training enrollment
* Start training
* Learning progress
* Learning milestones
* Milestone completion
* Course completion tracking

---

# 📈 Learning Progress

Employees can track training progress using:

* Course progress percentage
* Completed milestones
* Total milestones
* Enrollment status

Example:

```text
Course Progress: 75%

Milestones:
3 / 4 completed
```

Course status can be:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

---

# 🤖 AI-Powered Learning Recommendations

The platform integrates **Google Gemini** for intelligent learning recommendations.

The AI module can use information such as:

* Employee role
* Current skills
* Missing skills
* Assessment scores
* Knowledge gaps

to generate personalized learning recommendations.

The platform also supports AI question-and-answer interactions for learning assistance.

---

# 📊 Dashboards

## Employee Dashboard

Employees can view:

* Skill inventory
* Knowledge gaps
* Assessment results
* Training recommendations
* Learning progress
* Mentorship information
* Notifications
* Peer assessments
* Peer reviews

---

## HR Dashboard

HR users can monitor:

* Employee information
* Skill distribution
* Knowledge gaps
* Mentor allocation
* Training information
* Organizational insights
* Competency frameworks
* Workforce skill inventory
* Training effectiveness
* Skill forecasts
* HR reports

---

## Manager Dashboard

Managers can monitor their teams using:

* Team size
* Team skill gaps
* Employees in training
* High-risk skill gaps
* Team gap heatmap
* Department skill coverage
* High-risk skill alerts
* Training adoption
* Employee progress
* Manager reports
* Notifications

---

## Department Head Dashboard

Department Heads can analyze:

* Department skill coverage
* Department knowledge gaps
* Employee performance
* Skill distribution
* Training and development needs
* Department-level analytics
* Department notifications

---

## Mentor Dashboard

Mentors can manage:

* Mentorship requests
* Accepted mentorships
* Active mentorships
* Knowledge sessions
* Session attendance
* Learning analytics
* Mentorship history

---

# 📋 Assessment System

The platform supports multiple assessment types.

## Self Assessment

Employees assess their own skills.

## Peer Assessment

Employees evaluate the skills of their peers.

## Manager Assessment

Managers evaluate employee skills and performance.

The results can be used for:

```text
Skill Improvement Calculation
        ↓
Knowledge Gap Recalculation
        ↓
Training Recommendations
        ↓
Dashboard Analytics
```

---

# 🔔 Notifications

The platform includes a notification system for important events.

Examples include:

* Mentorship requests
* Mentorship acceptance
* Mentorship status changes
* Training-related updates
* Peer assessment notifications
* Organizational notifications

Notifications can be:

* Retrieved by employee
* Filtered as unread
* Marked as read

---

# 🔐 Security

The backend uses **Spring Security with JWT authentication**.

Protected API requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

The frontend uses a shared Axios instance:

```text
frontend/src/services/api.js
```

This shared instance:

* Adds the backend base URL
* Automatically attaches JWT tokens
* Centralizes API communication
* Supports different local and production environments

Role-based authorization prevents users from accessing functionality that is not intended for their role.

---

# ⚙️ Environment Configuration

The frontend uses Vite environment variables.

## Local Development

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8080/api
```

## Production

For Render deployment:

```env
VITE_API_URL=https://organizational-knowledge-platform-1.onrender.com/api
```

Do not commit local environment files containing secrets.

---

# 🗄️ Database Configuration

For local development, create a MySQL database:

```sql
CREATE DATABASE knowledge_gap_platform;
```

The backend can then connect using environment variables.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/knowledge_gap_platform
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

For cloud deployment, the project uses **Aiven MySQL**.

The production database connection should be configured through environment variables rather than hard-coded credentials.

---

# 📧 Email Configuration

The backend uses Gmail SMTP for email functionality.

Required environment variables:

```env
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

Use a Gmail App Password rather than storing a personal Gmail password in the application source code.

---

# 🤖 Gemini Configuration

The AI integration requires a Gemini API key.

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit the API key to GitHub.

---

# 🚀 Running Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Organizational-knowledge-platform
```

---

## 2. Start the Backend

Navigate to the backend:

```bash
cd backend/knowledge-gap-platform
```

Build the project:

```bash
mvn clean package
```

Run the application:

```bash
mvn spring-boot:run
```

The backend will normally run on:

```text
http://localhost:8080
```

---

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

The frontend will be available on the Vite development URL shown in the terminal.

---

# 📖 API Documentation

The backend provides API documentation through Swagger UI.

## Local

```text
http://localhost:8080/swagger-ui/index.html
```

## Production

```text
https://organizational-knowledge-platform-1.onrender.com/swagger-ui/index.html
```

Swagger can be used to:

* Explore REST APIs
* Authenticate using JWT
* Test endpoints
* Inspect request parameters
* Inspect API responses
* Verify protected endpoints
* Validate backend functionality

---

# 🧪 Testing

The project uses **Swagger UI and Postman** for backend API testing and validation.

## Swagger UI

Swagger is used to interactively test REST APIs and verify:

* Request parameters
* Request bodies
* Authentication
* API responses
* HTTP status codes
* Protected endpoints

JWT-protected APIs can be tested by providing the appropriate Bearer token.

---

## Postman

**Postman** was also used for API testing and backend validation.

Postman was used to test different REST API workflows, including:

* Authentication APIs
* Employee APIs
* Skill APIs
* Competency APIs
* Knowledge gap APIs
* Assessment APIs
* Mentorship APIs
* Mentor allocation APIs
* Knowledge session APIs
* Training APIs
* Learning progress APIs
* Notification APIs
* Dashboard APIs
* AI APIs

For protected endpoints, the JWT token is provided using the HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Postman testing helped verify API requests, responses, authentication, authorization, and endpoint behavior independently from the frontend.

---

## Important Testing Areas

The following major workflows were tested:

* Authentication
* Role-based access
* Employee skill assessment
* Knowledge gap calculation
* Competency management
* Mentor allocation
* Mentorship requests
* Mentor acceptance/rejection
* Knowledge sessions
* Session registration
* Attendance
* Training enrollment
* Learning milestones
* Peer assessments
* Manager dashboards
* Department Head dashboards
* HR functionality
* Notifications
* AI recommendations

---

# 🌐 Production Deployment

The project is deployed using **Render**.

## Live Application

```text
https://organizational-knowledge-platform-1.onrender.com/
```

## Backend

The backend deployment uses:

```text
Platform: Render
Runtime: Docker
Branch: team1-krishnapriya
Java Version: 21
Database: Aiven MySQL
```

The production backend provides the REST APIs used by the frontend.

---

## Frontend

The React frontend is deployed through Render.

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
dist
```

The frontend communicates with the production backend using:

```env
VITE_API_URL=https://organizational-knowledge-platform-1.onrender.com/api
```

---

# 🐳 Docker

The backend includes a multi-stage Docker build.

Example:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

This approach separates:

1. Application build
2. Application runtime

and keeps the final runtime image smaller.

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
│       │   │   │   └── com/
│       │   │   │       └── knowledgegap/
│       │   │   │           ├── config/
│       │   │   │           ├── controller/
│       │   │   │           ├── dto/
│       │   │   │           ├── entity/
│       │   │   │           ├── repository/
│       │   │   │           ├── security/
│       │   │   │           └── service/
│       │   │   │
│       │   │   └── resources/
│       │   │       └── application.properties
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
│   │   │   └── api.js
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

# 🔗 Important Backend Modules

Major backend domains include:

```text
Authentication
Employee Management
Department Management
Skill Management
Competency Management
Knowledge Gap Analysis
Assessments
Mentorship
Mentor Allocation
Knowledge Sessions
Session Registration
Session Feedback
Training Enrollment
Learning Progress
Learning Milestones
Learning Analytics
Notifications
AI Recommendations
```

---

# 🔗 Important Frontend Modules

Major frontend pages/modules include:

```text
Login
Signup
Forgot Password
Employee Dashboard
Employee Assessment
Peer Assessment
Peer Reviews
Training & Learning
Learning Path
Expert Directory
Mentorship
Notifications
HR Dashboard
Mentor Allocation
Competency Framework
Workforce Skill Inventory
Training Effectiveness
Skill Forecast
HR Reports
Manager Dashboard
Manager Reports
Manager Employee Progress
Manager Skill Gaps
Manager Training Adoption
Department Dashboard
Department Notifications
Mentor Dashboard
Knowledge Sessions
```

---

# 🔄 End-to-End Employee Workflow

```text
Login
  ↓
Employee Dashboard
  ↓
Skill Assessment
  ↓
Skill Inventory Updated
  ↓
Knowledge Gap Detection
  ↓
Training Recommendations
  ↓
Learning Path
  ↓
Training Enrollment
  ↓
Learning Milestones
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

# 🔄 Mentorship Workflow

```text
HR Allocates Mentor
        ↓
Employee Views Allocated Mentor
        ↓
Employee Sends Request
        ↓
Mentor Receives Notification
        ↓
Mentor Accepts / Rejects
        ↓
Accepted
        ↓
Mentorship Active
        ↓
Knowledge Sessions
        ↓
Employee Registration
        ↓
Session Attendance
        ↓
Session Feedback
        ↓
Learning Analytics
```

---

# 🔄 Assessment Workflow

```text
Self Assessment
      │
      ├──────────────┐
      ▼              ▼
Peer Assessment   Manager Assessment
      │              │
      └──────┬───────┘
             ▼
      Skill Improvement
             ▼
    Knowledge Gap Update
             ▼
   Training Recommendation
```

---

# 🔄 Training Workflow

```text
Knowledge Gap
      ↓
Skill Matching
      ↓
Course Recommendation
      ↓
Employee Enrollment
      ↓
Training Started
      ↓
Milestone 25%
      ↓
Milestone 50%
      ↓
Milestone 75%
      ↓
Milestone 100%
      ↓
Course Completed
      ↓
Skill Improvement
```

---

# 🔄 Organizational Analytics Workflow

```text
Employee Data
      ↓
Skill Inventory
      ↓
Assessment Results
      ↓
Knowledge Gap Analysis
      ↓
Training & Learning Data
      ↓
Team / Department Aggregation
      ↓
Manager Dashboard
      ↓
Department Head Dashboard
      ↓
HR Organizational Insights
```

---

# 🔒 Security Best Practices

The project follows secure configuration practices.

Do not commit the following into Git:

```text
Database passwords
Gmail passwords
Gmail App Passwords
Gemini API keys
JWT tokens
Cloud database credentials
```

Use environment variables instead.

Example:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

gemini.api.key=${GEMINI_API_KEY}
```

---

# 🌍 Production Environment

The project uses a cloud-based architecture in production:

```text
React Frontend
      │
      ▼
Render
      │
      │ REST API
      ▼
Render Spring Boot Backend
      │
      ├──────────► Aiven MySQL
      │
      ├──────────► Gemini API
      │
      └──────────► Gmail SMTP
```

---

# 📌 Git Branch

The development/deployment branch is:

```text
team1-krishnapriya
```

Changes should be committed and pushed to the appropriate branch according to the team's Git workflow.

---

# 👨‍💻 Development Workflow

Typical development workflow:

```bash
git pull
```

Make changes and test locally.

Check the repository status:

```bash
git status
```

Stage the changes:

```bash
git add .
```

Commit the changes:

```bash
git commit -m "Your commit message"
```

Push the changes:

```bash
git push origin team1-krishnapriya
```

When automatic deployment is enabled, Render can deploy the latest committed version.

---

# 🚨 Troubleshooting

## Frontend Cannot Connect to Backend

Check:

```env
VITE_API_URL
```

Local:

```text
http://localhost:8080/api
```

Production:

```text
https://organizational-knowledge-platform-1.onrender.com/api
```

Also search the frontend source for old hard-coded references:

```text
localhost:8080
```

API requests should use the shared Axios instance:

```javascript
import api from "../services/api";
```

instead of creating separate Axios clients with hard-coded URLs.

---

## 403 Forbidden

A protected endpoint requires a valid JWT.

Authenticate using the login endpoint and provide:

```http
Authorization: Bearer <JWT_TOKEN>
```

when testing protected APIs through Swagger or Postman.

Also verify that the logged-in user has the appropriate role and permissions.

---

## Backend Database Connection Failure

Verify:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

and confirm that the cloud database is running and accessible.

---

## AI API Issues

If the AI recommendation service is unavailable or temporarily overloaded, verify:

```text
GEMINI_API_KEY
```

and check the Gemini API configuration and service availability.

---

# 📜 License

This project was developed as part of an academic/internship project.

---

# 🙏 Acknowledgements

This project was developed as part of the **Infosys Springboard Virtual Internship**.

Special thanks to the project mentors and team members for their guidance, collaboration, testing, and development support.

---

# ⭐ Project Summary

The **Organizational Knowledge Gap Intelligence Platform** provides an end-to-end solution for organizational learning and skill development.

It connects:

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
Performance Analysis
   ↓
Organizational Insights
```

The platform is designed to help organizations make employee development more structured, measurable, and data-driven.

## 🌐 Live Application

```text
https://organizational-knowledge-platform-1.onrender.com/
```

The project demonstrates the integration of:

* Full-stack web development
* React and Vite
* Java and Spring Boot
* REST API development
* MySQL database management
* JWT-based authentication
* Role-based authorization
* AI-powered recommendations
* Employee skill assessment
* Knowledge gap analysis
* Training and learning management
* Mentorship
* Organizational analytics
* API testing using Swagger and Postman
* Docker-based deployment
* Cloud deployment using Render and Aiven
