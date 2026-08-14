# External Learning Resource Links Implementation Report

## 1. Feature Summary
KnowledgeIQ connects employee onboarding, AI skill gap analysis, and training recommendations with direct external learning resources. When employees complete domain onboarding, Gemini AI generates structured skill proficiencies and recommended courses equipped with real, verified external learning URLs (such as official documentation from Spring, React, AWS, PostgreSQL, Docker, Kubernetes, etc.).

These recommendations are validated, sanitized, and stored in the database. When the employee accesses the Training Portal or AI Recommendations tab, the application displays the course title, provider, duration, and an **[ Open course ↗ ]** link that opens the resource securely in a new browser tab. If a course has no external link available, the UI gracefully renders a fallback "Learning resource unavailable" state without crashing.

---

## 2. Files Inspected
- `backend/src/main/java/com/knowledgeiq/model/TrainingCourse.java`
- `backend/src/main/java/com/knowledgeiq/service/AiService.java`
- `backend/src/main/java/com/knowledgeiq/service/TrainingService.java`
- `backend/src/main/java/com/knowledgeiq/service/DashboardService.java`
- `backend/src/main/java/com/knowledgeiq/controller/TrainingController.java`
- `backend/src/main/java/com/knowledgeiq/dto/PersonalizedRecommendationDto.java`
- `backend/src/main/java/com/knowledgeiq/config/DataInitializer.java`
- `frontend/src/pages/EmployeePages.jsx`
- `frontend/src/pages/ProfileSetup.jsx`
- `frontend/src/services/api.js`

---

## 3. Files Modified
1. `backend/src/main/java/com/knowledgeiq/util/UrlValidatorUtil.java` **[NEW]**:
   - Comprehensive URL sanitization and SSRF prevention utility.
2. `backend/src/main/java/com/knowledgeiq/dto/PersonalizedRecommendationDto.java`:
   - Added `getUrl()`, `setUrl()`, `description`, and `skillName` bindings.
3. `backend/src/main/java/com/knowledgeiq/service/AiService.java`:
   - Updated Gemini prompt to request structured `skills` and `courses` with strict URL veracity guidelines.
   - Updated `syncSuggestionsWithDatabase` to sanitize URLs via `UrlValidatorUtil` and persist `TrainingCourse` records to PostgreSQL.
   - Updated `getLocalFallbackSuggestions` with domain-specific curated courses having official documentation URLs.
4. `backend/src/main/java/com/knowledgeiq/service/TrainingService.java`:
   - Added automatic skill-gap course resolution (`resolveOrCreateCourseForSkill`) to persist verified courses with official URLs when unmapped gaps exist.
   - Added URL sanitization to `createCourse` and `updateCourse`.
5. `backend/src/main/java/com/knowledgeiq/service/DashboardService.java`:
   - Included `courseUrl` and `url` in dashboard path recommendation responses.
6. `backend/src/main/java/com/knowledgeiq/config/DataInitializer.java`:
   - Added `TrainingCourseRepository` injection and seeded core courses with official documentation URLs.
7. `frontend/src/pages/EmployeePages.jsx`:
   - Updated `EmployeeTraining` and `EmployeeAI` course cards to render `[ Open course ↗ ]` with `target="_blank"` and `rel="noopener noreferrer"`.
   - Handled null or missing URLs with disabled badges / fallback states.
8. `scripts/test_course_url_workflow.js` **[NEW]**:
   - Automated end-to-end test script covering all 6 validation scenarios.

---

## 4. Database Changes
- Reused existing `training_courses` table with column `course_url VARCHAR(255)` (allowing NULL).
- No destructive database migration required; existing records with null URLs remain fully supported.
- Persisted courses created during onboarding or gap analysis are stored with sanitized URLs.

---

## 5. Gemini AI Prompt & Output Schema Changes
### Prompt Instructions:
```
You are an expert curriculum architect and technical mentor for KnowledgeIQ.
For the professional role/domain named "{domain}", generate:
1. Exactly 5 core technical skills that are essential to master, with expected proficiency levels (1-5).
2. Exactly 3 to 5 high-quality course or tutorial recommendations that teach these skills.

CRITICAL INSTRUCTIONS FOR COURSE URLS:
- Provide a real, publicly accessible learning resource URL when possible.
- Prefer official documentation and courses from reputable providers (e.g. Spring, Microsoft, AWS, Google, Oracle, MDN, Python.org, React.dev, PostgreSQL.org, Docker, Kubernetes, freeCodeCamp, Coursera, Udemy).
- Do NOT invent or fabricate fake URLs. If a reliable, official URL cannot be provided, set "url": null.
```

### JSON Schema:
```json
{
  "skills": [
    {"name": "Java Spring Boot", "expectedLevel": 5}
  ],
  "courses": [
    {
      "title": "Spring Boot & Microservices Development",
      "provider": "Spring / VMware",
      "description": "Build enterprise-grade microservices and robust REST APIs.",
      "url": "https://spring.io/guides/gs/spring-boot",
      "skill": "Java Spring Boot",
      "level": 5,
      "durationHours": 8
    }
  ]
}
```

---

## 6. API Changes
- `POST /api/ai/onboarding`: Returns `{ skills: [...], courses: [...] }`.
- `GET /api/training/learning-path/personalized`: Returns `steps` containing `courseUrl`, `url`, `isExternal: true/false`, `provider`, `title`, `description`.
- `POST /api/training/courses` & `PUT /api/training/courses/{id}`: Accept and validate `courseUrl` and `url`.

---

## 7. Frontend Changes
- **Employee Training Portal (`EmployeeTraining`)**:
  - Checks `step.courseUrl || step.url`.
  - When URL is present: renders an `<a>` link opening in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, styled as `[ Open course ↗ ]`.
  - When URL is null/empty: renders a disabled button labeled `Learning resource unavailable` or handles internal enrollment.
- **Employee AI Recommendations (`EmployeeAI`)**:
  - Renders `[ Open course ↗ ]` external link in both Timeline and Grid views.

---

## 8. Security & URL Sanitization
- Implemented `UrlValidatorUtil`:
  - **Protocol Filtering**: Only allows `http://` and `https://`.
  - **Scheme Blacklisting**: Rejects `javascript:`, `data:`, `file:`, `blob:`, `vbscript:`, `about:`.
  - **SSRF Prevention**: Rejects `localhost`, `127.0.0.1`, loopbacks, internal DNS domains (`.local`, `.internal`, `.corp`), and cloud metadata IP ranges (`169.254.169.254`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - **Reverse Tabnabbing Mitigation**: Frontend links enforce `rel="noopener noreferrer"`.

---

## 9. Error Handling
- Invalid or malicious URLs are sanitized to `null` before database insertion.
- When Gemini API is unreachable or returns malformed data, `getLocalFallbackSuggestions` supplies domain-specific courses with verified official documentation URLs.
- Missing URLs in the frontend render fallback badges without runtime errors or broken redirects.

---

## 10. Verification & Test Results
Ran `node scripts/test_course_url_workflow.js`:
```
===================================================================
   FULL END-TO-END VERIFICATION: EXTERNAL LEARNING RESOURCE URLS   
===================================================================

[Test 1] Testing AI Onboarding Suggestions for "Backend Development"...
- Status: 200
- Skills returned: 5
- Courses returned: 3
  * Course: "Spring Boot & Microservices Development" | Provider: Spring / VMware | URL: https://spring.io/guides/gs/spring-boot
  * Course: "Advanced SQL Query Optimization & Relational Modeling" | Provider: PostgreSQL | URL: https://www.postgresql.org/docs/current/tutorial.html
  * Course: "AWS Cloud Solutions Architect Foundations" | Provider: Amazon Web Services | URL: https://aws.amazon.com/getting-started/

[Test 2] Registering New Employee...
✔ Registered Lucas Meyer -> Token obtained: true

[Test 3] Submitting Profile Onboarding with Skill Gaps...
✔ Profile updated: Lucas Meyer (Java Spring Developer)

[Test 4] Querying Training Portal Learning Path API (/api/training/learning-path/personalized)...
- Target Role: Java Spring Developer
- Skill Score: 38% | Gap: 62%
- Total Recommendations: 3
  Step 1: "Modern React Architecture & Component Design"
    - Provider: React / Meta
    - Target Skill: React
    - URL: https://react.dev/learn
    - IsExternal: true
  Step 2: "Spring Boot & Microservices Development"
    - Provider: Spring / VMware
    - Target Skill: Java Spring Boot
    - URL: https://spring.io/guides/gs/spring-boot
    - IsExternal: true
  Step 3: "Advanced SQL Optimization & Relational Modeling"
    - Provider: PostgreSQL
    - Target Skill: Advanced SQL
    - URL: https://www.postgresql.org/docs/current/tutorial.html
    - IsExternal: true
✔ Distinct Course URLs verified: 3

[Test 5] Testing Security & URL Validation Rules on Backend...
  - Dangerous Scheme "javascript:alert(1)": courseUrl set to -> NULL (REJECTED SAFE)
  - SSRF Probe "http://169.254.169.254/...": courseUrl set to -> NULL (REJECTED SAFE)
  - Localhost Probe "http://localhost:8080/...": courseUrl set to -> NULL (REJECTED SAFE)
  - Valid Official URL "https://spring.io/guides/gs/rest-service": courseUrl set to -> https://spring.io/guides/gs/rest-service

[Test 6] Testing Persistence Across Repeated Invocations...
✔ Re-queried learning path -> Course: "Spring Boot & Microservices Development" | Persistent URL: "https://spring.io/guides/gs/spring-boot"

===================================================================
   ✔ ALL TESTS PASSED: ONBOARDING → AI RECOMMENDATIONS → TRAINING   
===================================================================
```

---

## 11. Final Workflow
```
[Employee Domain Setup]
          │
          ▼
[POST /api/ai/onboarding]
          │
          ▼
[Gemini AI / Fallback Engine]
          │ (Generates skills & courses with official learning URLs)
          ▼
[AiService.syncSuggestionsWithDatabase]
          │ (Sanitizes URLs via UrlValidatorUtil & saves TrainingCourse to DB)
          ▼
[Employee Completes Profile Onboarding]
          │
          ▼
[GapAnalysisService.recalculateUserGaps]
          │
          ▼
[TrainingService.getPersonalizedLearningPath]
          │ (Maps gaps to persisted courses with URLs)
          ▼
[Training Portal & AI Recommendations View]
          │
          ▼
[User Clicks "Open course ↗"] ──> (Opens external official tutorial in secure new tab)
```
