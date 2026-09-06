# KGap Intel — Android Native Mobile Client

Native Android mobile application built with Java, Material Design 3, Retrofit 2, and Android Jetpack Architecture Components for the KGap Intel Enterprise Knowledge Platform.

---

## 📱 Features & Highlights

- **Dynamic Role-Based Dashboards**: Custom-tailored dashboard experiences for Employee, Manager, HR, L&D Admin, Department Head, Mentor, and System Administrator.
- **Unread Notification Badging**: Real-time unread badge counts (`tv_notif_badge`) on the bell icon for every role dashboard.
- **Role-Aware Notification Privacy**: L&D Admins receive enterprise training/session/milestone alerts with private chat messages filtered out.
- **Interactive Knowledge Hub**:
  - Live session schedules with one-tap Google Meet launcher (`Intent.ACTION_VIEW`).
  - Searchable mentor selection with live `TextWatcher` filtering across name and expertise.
  - Multi-tier assessments (Self, Peer, Manager) with real-time scoring.
  - Direct 1-on-1 employee-to-mentor messaging.

---

## 🛠️ Technology Stack & Libraries

- **Language & Platform**: Java 8 / 17 / 21, Android SDK (Min API 24, Target API 34)
- **UI & Components**: Material Design 3, View Binding, ConstraintLayout, NestedScrollView
- **Architecture**: MVVM (Model-View-ViewModel), Repository Pattern, LiveData
- **Networking**: Retrofit 2, OkHttp 3, Gson Converter
- **Visuals & Charts**: MPAndroidChart (radar charts, heatmaps, progress analytics)
- **Local Storage**: Encrypted / SharedPreferences via `SharedPrefManager`

---

## 📁 Project Structure

```
Frontend/app/src/main/
├── java/com/kgap/intel/
│   ├── activities/      # MainActivity, LoginActivity, RegisterActivity
│   ├── adapters/        # BannerAdapter, CatalogAdapter, MentorAdapter, NotificationAdapter
│   ├── api/             # Retrofit ApiService interfaces & ApiClient configuration
│   ├── fragments/       # Role Dashboards, Skills, Gaps, Catalog, Chat, Notifications
│   ├── models/          # POJO models mapped with @SerializedName
│   ├── repository/      # LiveData repository layer handling API calls & caching
│   ├── utils/           # SharedPrefManager, Constants, UI formatters
│   └── viewmodel/       # AndroidX ViewModels managing state & observables
└── res/
    ├── layout/          # XML Layout definitions & Data Binding layouts
    ├── drawable/        # Vector icons, shape backgrounds, badge drawables
    └── values/          # Colors, strings, themes, styles
```

---

## 🔧 Building & Installing

### Prerequisites
- Android Studio Ladybug / Meerkat or Gradle CLI
- Android Virtual Device (AVD) or physical device running Android 7.0+ (API 24+)

### Build APK via Gradle
```bash
# Windows
cmd /c gradlew.bat assembleDebug

# macOS / Linux
./gradlew assembleDebug
```

Output APK will be generated at:
`Frontend/app/build/outputs/apk/debug/app-debug.apk`

---

## 📡 Backend Network Configuration

When running locally with the Spring Boot backend:
- **Android Emulator**: Set base URL to `http://10.0.2.2:8080/`
- **Physical Device**: Set base URL to your computer's local Wi-Fi IP address (e.g. `http://192.168.1.X:8080/`) in `ApiClient.java`.