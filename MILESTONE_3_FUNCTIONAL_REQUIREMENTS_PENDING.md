# 🎯 Milestone 3 Functional Requirements Pending Audit Report

**Project Name**: Organizational Knowledge Gap Intelligence Platform (**KnowledgeIQ**)  
**Specification**: Milestone 3 Functional Requirements Audit  
**Date**: August 20, 2026  

---

## 📌 Executive Summary

This report focuses **strictly on user-facing functional requirements, business workflows, and feature gaps** specified in the Milestone 3 requirements document (excluding non-functional items such as unit tests or ER diagrams).

While the core end-to-end workflow (**Identify Gap $\rightarrow$ Mentor Match $\rightarrow$ Request $\rightarrow$ Enroll $\rightarrow$ Progress $\rightarrow$ Assess $\rightarrow$ Recalculate Gap $\rightarrow$ Dashboard Update**) is operational, the following specific functional features and workflow edge cases are pending or require complete UI/backend completion.

---

## 📋 Comprehensive Functional Requirements Pending Audit

### 1. Peer Mentorship Workflow Gaps (Section 4, Page 4–5)
- [ ] **Mentorship Completion Trigger (`Completed` Status)**:
  - *Requirement*: Document lists `Requested`, `Accepted`, `Rejected`, `Active`, `Completed`, `Cancelled`.
  - *Pending Functional Feature*: UI button allowing mentor or mentee to mark an active mentorship as **`Completed`** once the target skill gap is successfully closed or mentorship goal is reached.

### 2. Knowledge-Sharing Sessions Feature Gaps (Section 5, Page 6)
- [ ] **Edit Session & Cancel Session by Host**:
  - *Requirement*: Document explicitly requires `Edit session` and `Cancel session`.
  - *Pending Functional Feature*: Host control buttons on hosted session cards allowing hosts to edit meeting links/dates or cancel scheduled sessions.
- [ ] **Cancel Registration**:
  - *Requirement*: Document explicitly requires `Cancel registration`.
  - *Pending Functional Feature*: UI button allowing registered attendees to cancel their session registration prior to session start, incrementing available seat capacity back.
- [ ] **Host Attendance Checklist**:
  - *Requirement*: Document explicitly requires `Attendance recorded`.
  - *Pending Functional Feature*: Host attendance modal allowing session hosts to mark participant attendance (`Attended` vs `Absent`) after the session concludes.

### 3. Community of Practice Groups (Section 4, Page 3)
- [ ] **Community of Practice Discussion Hub / Guilds**:
  - *Requirement*: Document explicitly lists `Community of practice groups`.
  - *Pending Functional Feature*: Dedicated Community Hub tab where employees can join domain guilds (e.g. *Java Guild*, *DevOps Community*, *UI/UX Practice*) to share public articles and ask domain questions outside 1-on-1 mentorship.

### 4. Training & Certification Expiry Tracking (Sections 7 & 8, Page 7–8)
- [ ] **Certification Expiry & Renewal Trigger (`Expired / Renewal`)**:
  - *Requirement*: Document explicitly specifies `Expired / Renewal` status.
  - *Pending Functional Feature*: Certification expiry date tracking with visual badge for expired certifications and a **"Renew Certification"** re-assessment trigger.

### 5. Assessment System Functional Additions (Sections 11 & 14, Page 10, 12)
- [ ] **Side-by-Side Historical Assessment Comparison Table**:
  - *Requirement*: Section 14 explicitly requires displaying historical comparison matrix (`Skill | Previous Level | Current Level | Improvement Delta (+1, +2)`).
  - *Pending Functional Feature*: Dedicated UI table widget on Employee & Manager assessment pages displaying side-by-side historical proficiency deltas after training completion.
- [ ] **Assessment Scheduling & Due Date Reminders**:
  - *Requirement*: Document lists `Assessment scheduling` and `Reminders`.
  - *Pending Functional Feature*: Ability for managers to schedule upcoming quarterly assessments with fixed due dates.

### 6. Manager Dashboard Actionable Insights (Section 16, Page 14)
- [ ] **"Falling Behind" Employee Filter**:
  - *Requirement*: Question 4 requires managers to identify *"Who is falling behind?"*.
  - *Pending Functional Feature*: Dedicated filter/badge highlighting employees whose training progress is $< 30\%$ past expected milestone completion dates.

### 7. Notification Workflow Triggers (Section 21, Page 17–18)
- [ ] **Specific Workflow Notification Triggers**:
  - *Requirement*: Document specifies exact notification messages:
    - *Training Deadline Approaching*: `"Your Java training deadline is approaching"`
    - *Mentorship Session Tomorrow*: `"Your mentorship session is scheduled tomorrow"`
    - *Milestone Achievement*: `"Congratulations! You completed 80% of your learning path"`
    - *Assessment Due*: `"Your skill assessment is due tomorrow"`
  - *Pending Functional Feature*: Automated background triggers generating these specific contextual notification messages when milestones or deadlines are crossed.

---

## 📊 Summary Checklist of Pending Functional Work

| Module | Specific Functional Requirement Pending | Priority | Estimated Complexity |
| :--- | :--- | :---: | :---: |
| **Mentorship** | Mark Mentorship `Completed` Button | Medium | Low |
| **Sessions** | Edit/Cancel Session & Cancel Registration UI | High | Medium |
| **Sessions** | Host Attendance Marking Modal | High | Medium |
| **Community** | Community of Practice Guilds & Public Article Sharing | Medium | Medium |
| **Training** | Certification Expiry Date & Renewal Trigger | Medium | Low |
| **Assessments** | Historical Assessment Comparison Table (`+1, +2 Delta`) | High | Low |
| **Manager UI** | "Falling Behind" Employee Progress Filter | Medium | Low |
| **Notifications** | Automated Milestone & Deadline Notification Triggers | High | Medium |
