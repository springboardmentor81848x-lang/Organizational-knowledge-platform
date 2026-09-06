# KGap Intel — Enterprise Knowledge Gap & AI-Driven Upskilling Intelligence Platform

KGap Intel is a full-stack enterprise platform built to identify, track, benchmark, and resolve organizational knowledge gaps through real-time competency diagnostics, adaptive AI recommendations, curated internal/external learning pathways, peer knowledge-sharing sessions, and role-based talent management.

---

## 🌟 Key Pillars & Core Capabilities

- **Competency & Skill Gap Engine**: Multi-tier assessment matrix (Self, Peer, Manager) benchmarking current employee proficiency against enterprise role requirements.
- **Adaptive AI Upskilling Recommendations**: Real-time scoring and curation of internal bootcamps and external courses (Coursera, Udemy, VMware Tanzu, AWS, Google Cloud) tailored to bridge active gaps.
- **Interactive Knowledge Hub & Mentorship**: Real-time 1-on-1 employee/mentor chat, live Google Meet sessions, and structured mentor matching.
- **Multi-Role Governance**: 7 dedicated role dashboards with live telemetry, unread notification badges, and granular security policies:
  1. 👤 **Employee** — Self-assessments, progress tracking, training enrollments, and mentor messaging.
  2. 🎓 **Learning & Development Admin** — Enterprise catalog curation, adaptive learning paths, session links, and training telemetry.
  3. 👔 **Engineering Manager** — Team gap radar, training ROI tracking, and assessment nudges.
  4. 💼 **HR Talent Leader** — Strategic workforce inventory, department skill benchmarks, and talent forecasting.
  5. 🛡️ **System Administrator** — User access controls, audit trail security logs, and database health monitoring.
  6. 📊 **Department Head** — Departmental heatmap coverage, high-risk gap interventions, and mentor assignments.
  7. 🤝 **Mentor** — Mentee guidance, doubt clearing sessions, and live session scheduling.

---

## 🏗️ Repository Structure

```
KGap_Intel Project/
├── Backend/                 # Spring Boot 3 / Java 21 REST API & PostgreSQL Database
│   ├── src/main/java/       # Controllers, Services, Repositories, Entities, Security
│   ├── src/main/resources/  # application.properties, schema & migration configs
│   ├── pom.xml              # Maven dependencies & plugins
│   └── README.md            # Backend-specific architecture & setup guide
├── Frontend/                # Native Android App (Java / Material Design 3)
│   ├── app/src/main/java/   # Activities, Fragments, ViewModels, Repositories, Adapters
│   ├── app/src/main/res/    # Layouts, XML drawables, colors, styles, navigations
│   ├── build.gradle.kts     # Gradle build configurations & dependencies
│   └── README.md            # Frontend-specific architecture & run guide
└── README.md                # Master project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java Development Kit (JDK)**: Version 21
- **PostgreSQL**: Version 14+ running on port `5432` with database `knowledge_gap_db`
- **Android Studio**: Ladybug / Meerkat or Android SDK Build Tools (API 34/35)

### 1. Launch Backend Service
```bash
cd Backend
./mvnw clean compile
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080` (or `http://10.0.2.2:8080` for Android Emulator).*

### 2. Build & Launch Android App
```bash
cd Frontend
./gradlew assembleDebug
```
*Deploy the APK to your connected Android virtual device or physical device via Android Studio.*

---

## 🔒 Security & RBAC
- **Stateless Authentication**: JWT (JSON Web Tokens) with BCrypt-hashed credentials.
- **Role-Based Access Control**: Pre-authorized endpoint policies guarding organizational audit data, while maintaining open broadcast channels for real-time notification alerts.
