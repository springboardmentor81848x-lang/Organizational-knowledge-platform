# Department Head Dashboard - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React.js)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   DepartmentHeadDashboardEnhanced Component                      │   │
│  │                                                                  │   │
│  │   8 Tabs:                                                       │   │
│  │   • Overview & Stats      • Employees & Teams                  │   │
│  │   • Knowledge Gaps        • Team Comparison                    │   │
│  │   • Learning Priorities   • Training Analytics               │   │
│  │   • Knowledge Approvals   • Team Leader Reports              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   departmentHead.js Service Layer                               │   │
│  │                                                                  │   │
│  │   • getDepartmentStatistics()                                   │   │
│  │   • getDepartmentTeams()                                        │   │
│  │   • getDepartmentEmployees()                                    │   │
│  │   • getKnowledgeGaps()                                          │   │
│  │   • getLearningPriorities() / createLearningPriority()         │   │
│  │   • getKnowledgeApprovals() / reviewKnowledgeApproval()        │   │
│  │   • getTeamLeaderReports() / resolveTeamLeaderReport()         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │
                    HTTP REST API Requests/Responses
                                     │
┌────────────────────────────────────┼──────────────────────────────────────┐
│                        BACKEND (Spring Boot)                              │
├────────────────────────────────────┼──────────────────────────────────────┤
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   DashboardController (REST API)                                │   │
│  │                                                                  │   │
│  │   GET  /api/dashboard/department-head/statistics               │   │
│  │   GET  /api/dashboard/department-head/teams                    │   │
│  │   GET  /api/dashboard/department-head/employees                │   │
│  │   GET  /api/dashboard/department-head/knowledge-gaps           │   │
│  │   GET  /api/dashboard/department-head/learning-priorities      │   │
│  │   POST /api/dashboard/department-head/learning-priorities      │   │
│  │   GET  /api/dashboard/department-head/knowledge-approvals      │   │
│  │   PUT  /api/dashboard/department-head/knowledge-approvals/{id} │   │
│  │   GET  /api/dashboard/department-head/team-leader-reports      │   │
│  │   PUT  /api/dashboard/department-head/team-leader-reports/{id} │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   DepartmentHeadService (Business Logic)                        │   │
│  │                                                                  │   │
│  │   • getDepartmentStatistics()                                   │   │
│  │   • getDepartmentTeams()                                        │   │
│  │   • getDepartmentEmployees()                                    │   │
│  │   • getKnowledgeGaps()                                          │   │
│  │   • getLearningPriorities()                                     │   │
│  │   • createLearningPriority()                                    │   │
│  │   • getKnowledgeApprovals()                                     │   │
│  │   • reviewKnowledgeApproval()                                   │   │
│  │   • getTeamLeaderReports()                                      │   │
│  │   • resolveTeamLeaderReport()                                   │   │
│  │                                                                  │   │
│  │   Helper Methods:                                               │   │
│  │   • teamToMap()                                                 │   │
│  │   • priorityToMap()                                             │   │
│  │   • approvalToMap()                                             │   │
│  │   • reportToMap()                                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Repository Layer (Spring Data JPA)                            │   │
│  │                                                                  │   │
│  │   • DepartmentRepository                                        │   │
│  │   • DepartmentTeamRepository                                    │   │
│  │   • KnowledgeApprovalRepository                                 │   │
│  │   • LearningPriorityRepository                                  │   │
│  │   • TeamLeaderReportRepository                                  │   │
│  │   • UserRepository                                              │   │
│  │   • EmployeeSkillRepository                                     │   │
│  │   • EnrollmentRepository                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Data Models (JPA Entities)                                    │   │
│  │                                                                  │   │
│  │   • Department                                                  │   │
│  │   • DepartmentTeam                                              │   │
│  │   • KnowledgeApproval                                           │   │
│  │   • LearningPriority                                            │   │
│  │   • TeamLeaderReport                                            │   │
│  │   • User                                                        │   │
│  │   • EmployeeSkill                                               │   │
│  │   • Enrollment                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Database (PostgreSQL/MySQL)                                   │   │
│  │                                                                  │   │
│  │   Tables:                                                       │   │
│  │   • departments                                                 │   │
│  │   • department_teams                                            │   │
│  │   • knowledge_approvals                                         │   │
│  │   • learning_priorities                                         │   │
│  │   • team_leader_reports                                         │   │
│  │   • users                                                       │   │
│  │   • employee_skills                                             │   │
│  │   • enrollments                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Creating a Learning Priority

```
User Action (Frontend)
         │
         ▼
┌──────────────────────────────────────────┐
│ User clicks "Set Learning Priority"      │
│ Modal opens with form                    │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ User fills form and submits              │
│ • Skill name                             │
│ • Target team                            │
│ • Target proficiency level               │
│ • Priority level                         │
│ • Target date                            │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ handleAddPriority() validates input      │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ departmentHeadService.                   │
│   createLearningPriority()                │
└──────────────────────────────────────────┘
         │
         ▼ HTTP POST
┌──────────────────────────────────────────┐
│ /api/dashboard/department-head/           │
│   learning-priorities                    │
│                                          │
│ Request Body:                            │
│ {                                        │
│   "skillName": "...",                    │
│   "targetTeams": "...",                  │
│   "targetProficiencyLevel": 85,          │
│   "priority": "High"                     │
│ }                                        │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DashboardController.                     │
│   createLearningPriority()                │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DepartmentHeadService.                   │
│   createLearningPriority()                │
│                                          │
│ 1. Fetch department by head email        │
│ 2. Create LearningPriority entity        │
│ 3. Save to database                      │
│ 4. Map to response object                │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ LearningPriorityRepository.save()         │
│ Persists to database                     │
└──────────────────────────────────────────┘
         │
         ▼ HTTP 200 OK
┌──────────────────────────────────────────┐
│ Response with created priority:          │
│ {                                        │
│   "id": 1001,                            │
│   "skill": "...",                        │
│   "targetTeams": [...],                  │
│   "targetLevel": 85,                     │
│   "currentAvg": 50,                      │
│   "priority": "High",                    │
│   "progress": 10,                        │
│   "status": "IN_PROGRESS"                │
│ }                                        │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Frontend updates state                   │
│ setLearningPriorities([result, ...])     │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Modal closes                             │
│ Toast notification shows success         │
│ UI updates to show new priority          │
└──────────────────────────────────────────┘

```

---

## Component Interaction Map

```
DepartmentHeadDashboardEnhanced
├── Header Banner
│   ├── Department Selector (Select)
│   └── Set Priority Button
├── KPI Statistics Grid
│   └── 5 Stat Cards (dynamic data)
├── Tab Navigation
│   ├── Overview & Stats
│   ├── Employees & Teams
│   ├── Knowledge Gaps
│   ├── Team Comparison
│   ├── Learning Priorities
│   ├── Training Analytics
│   ├── Knowledge Approvals
│   └── Team Leader Reports
├── Tab Content (Dynamic)
│   ├── Overview: Team Health Cards
│   ├── Employees: Table with Search/Filter
│   ├── Gaps: Gap Cards with Priority Buttons
│   ├── Comparison: Team Comparison Table
│   ├── Priorities: Priority Cards with Progress
│   ├── Training: Analytics Stats
│   ├── Approvals: Approval Cards with Actions
│   └── Reports: Report Cards with Actions
├── Priority Modal
│   ├── Form Inputs
│   └── Submit/Cancel Buttons
└── Toast Notification
    └── Success/Error Messages
```

---

## State Management Flow

```
Component State Variables:
├── Data State
│   ├── statistics
│   ├── teams
│   ├── employees
│   ├── knowledgeGaps
│   ├── learningPriorities
│   ├── knowledgeApprovals
│   └── teamLeaderReports
├── UI State
│   ├── activeTab
│   ├── selectedDept
│   ├── employeeSearch
│   ├── selectedTeamFilter
│   ├── loading
│   └── toast
└── Modal State
    ├── priorityModal
    └── newPriority

Event Handlers:
├── loadDashboardData()
├── showToast()
├── handleApproveKnowledge()
├── handleAddPriority()
└── handleResolveReport()
```

---

## Database Relationship Diagram

```
┌──────────────────────┐
│    users             │
├──────────────────────┤
│ id (PK)              │
│ email (UK)           │
│ name                 │
│ department           │◄─────┐
│ role                 │      │
└──────────────────────┘      │
                              │
                              │
┌──────────────────────┐      │
│   departments        │◄─────┘
├──────────────────────┤
│ id (PK)              │
│ name (UK)            │
│ head_email (FK)──────┼────────────┐
│ avg_competency_gap   │            │
│ training_velocity    │            │
└──────────────────────┘            │
         ▲                          │
         │ 1:N                      │
         │                          │
┌────────┴─────────────┐            │
│ department_teams     │            │
├──────────────────────┤            │
│ id (PK)              │            │
│ name (UK)            │            │
│ department_id (FK)───┼────────────┼──(User who is Team Lead)
│ team_lead_email      │            │
│ members_count        │            │
└──────────────────────┘            │
         ▲                          │
         │ 1:N                      │
         │                          │
┌────────┴─────────────────────┐    │
│ knowledge_approvals          │    │
├──────────────────────────────┤    │
│ id (PK)                      │    │
│ title                        │    │
│ department_id (FK)───────────┼────┘
│ author_email                 │
│ status                       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ learning_priorities          │
├──────────────────────────────┤
│ id (PK)                      │
│ skill_name                   │
│ department_id (FK)───────────┼─────(References Department)
│ target_proficiency_level     │
│ progress_percentage          │
└──────────────────────────────┘

┌──────────────────────────────┐
│ team_leader_reports          │
├──────────────────────────────┤
│ id (PK)                      │
│ team_id (FK)─────────────────┼─────(References DepartmentTeam)
│ department_id (FK)───────────┼─────(References Department)
│ submitted_by_email           │
│ status                       │
└──────────────────────────────┘
```

---

## Security & Authorization Flow

```
Request arrives at DashboardController
         │
         ▼
Extract email from request parameter
         │
         ▼
Pass to DepartmentHeadService
         │
         ▼
Service queries Department by head_email
         │
         ├─► Found: Continue with department-specific data
         │
         └─► Not Found: Return error, prevent access
         │
         ▼
All queries filtered by department_id
         │
         ▼
Return only department-specific data
         │
         ▼
Department Head can only see:
├── Their own department data
├── Their teams
├── Their employees
├── Their approvals
└── Their reports
```

---

## Performance Considerations

```
Data Loading Strategy:
┌──────────────────────────────────────┐
│ User navigates to dashboard          │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ useEffect triggers on component load │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Parallel API calls (Promise.all)                 │
├─────────────────────────────────────────────────┤
│ 1. getDepartmentStatistics()                     │
│ 2. getDepartmentTeams()                          │
│ 3. getDepartmentEmployees()                      │
│ 4. getKnowledgeGaps()                            │
│ 5. getLearningPriorities()                       │
│ 6. getKnowledgeApprovals()                       │
│ 7. getTeamLeaderReports()                        │
│                                                  │
│ (All load simultaneously, not sequentially)      │
└──────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Loading indicator shown              │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ All data returns                     │
│ Update state simultaneously          │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Dashboard renders all tabs           │
│ Users can navigate between tabs      │
└──────────────────────────────────────┘

Benefits:
✓ Reduced total loading time
✓ User sees dashboard faster
✓ Error handling for individual API calls
✓ Fallback to empty state if specific endpoint fails
```

---

## Key Design Patterns Used

1. **MVC Pattern**: Controller → Service → Repository → Model
2. **Repository Pattern**: Data access abstraction
3. **Service Layer Pattern**: Business logic encapsulation
4. **React Hooks Pattern**: useState, useEffect for component state
5. **Factory Pattern**: Entity → Map conversion methods (teamToMap, etc.)
6. **Error Handling Pattern**: Try-catch with user feedback
7. **Async/Await Pattern**: Promise-based API calls
8. **Parallel Execution**: Promise.all for multiple API calls

