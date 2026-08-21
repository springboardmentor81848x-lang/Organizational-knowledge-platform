# KGap Intel - Android Application (Frontend)

KGap Intel is an enterprise Android application built for **Infosys Springboard** that serves as an intelligent hub for skill gap resolution, employee upskilling, mentorship, and knowledge sharing.

---

## 🌟 Key Application Features

- **Personalized Dashboard**: Real-time overview of skill gaps, active learning paths, mentorship status, and achievements.
- **Skill Gap & Heatmap**: Visual gap categorization (High, Medium, Low) and organizational risk heatmaps.
- **Training Catalog & Course Discovery**: Search, level filter (Beginner, Intermediate, Advanced), and direct enrollment into courses.
- **Learning Progress & Structured Paths**: Step-by-step learning progression with milestone status updates (0% to 100%).
- **Dynamic Achievements & Badges**: Real-time calculated levels (Level 1–5), badge unlocks (*First Step*, *Skill Master*, *Learning Explorer*, *Completion Champion*), and milestone timelines.
- **Mentorship Hub**: Real-time mentor matching, request dispatch, and incoming/outgoing request management.
- **Knowledge Sharing Sessions**: Host and attend scheduled knowledge sessions with registration, attendance tracking, and 5-star feedback submission.
- **Skill Assessments**: Interactive competency assessments that dynamically grade and resolve employee skill deficits.

---

## 🛠️ Architecture & Tech Stack

- **Language**: Java
- **Architecture Pattern**: MVVM (Model-View-ViewModel) + Repository Pattern
- **UI Framework**: Material Design 3 (M3) with ConstraintLayout and ViewBinding
- **Networking**: Retrofit 2 with OkHttp 3 and JWT Bearer Token Interceptor
- **State Management**: Android Jetpack LiveData & ViewModel
- **Session Storage**: SharedPreferences (`SharedPrefManager`)
- **Min SDK**: 24 (Android 7.0+)
- **Target / Compile SDK**: 34 (Android 14)

---

## 🚀 Building & Running

1. Open `Frontend/` in **Android Studio**.
2. Ensure the Spring Boot backend is running on `localhost:8080`.
3. Build and run the app:
   ```powershell
   .\gradlew.bat assembleDebug
   ```
4. Deploy to an emulator or physical device.