import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// AUTH
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";

// EMPLOYEE
import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeProfile from "@/pages/employee/Profile";
import EmployeeSkills from "@/pages/employee/Skills";
import SelfAssessment from "@/pages/employee/SelfAssessment";
import PeerAssessment from "@/pages/employee/PeerAssessment";
import EmployeeProficiency from "@/pages/employee/Proficiency";
import SkillGapsPage from "@/pages/employee/SkillGapsPage";
import LearningPaths from "@/pages/employee/LearningPaths";
import EmployeeTraining from "@/pages/employee/Training";
import TrainingLearn from "@/pages/employee/TrainingLearn";
import EmployeeProgress from "@/pages/employee/Progress";
import Achievements from "@/pages/employee/Achievements";
import Certifications from "@/pages/employee/Certifications";
import Mentorship from "@/pages/employee/Mentorship";
import EmployeeNotifications from "@/pages/employee/Notifications";
import EmployeeSettings from "@/pages/employee/Settings";
import Experience from "@/pages/employee/Experience";

// HR
import HRDashboard from "@/pages/hr/Dashboard";

// MANAGER
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerEmployees from "@/pages/manager/Employees";
import ManagerDepartments from "@/pages/manager/Departments";
import ManagerJobRoles from "@/pages/manager/JobRoles";
import ManagerSkills from "@/pages/manager/Skills";
import ManagerCompetencyFramework from "@/pages/manager/CompetencyFramework";
import ManagerKnowledgeGapAnalysis from "@/pages/manager/KnowledgeGapAnalysis";
import ManagerAIRecommendations from "@/pages/manager/AIRecommendations";
import ManagerTrainingManagement from "@/pages/manager/TrainingManagement";
import ManagerAssessments from "@/pages/manager/Assessments";
import ManagerReports from "@/pages/manager/Reports";
import ManagerSettings from "@/pages/manager/Settings";


// ADMIN
import AdminDashboard from "@/pages/admin/Dashboard";

// MENTOR
import MentorDashboard from "@/pages/mentor/Dashboard";
import MentorRequests from "@/pages/mentor/Requests";
import MentorSessions from "@/pages/mentor/Sessions";
import MentorMentees from "@/pages/mentor/Mentees";
import MentorKnowledgeSharing from "@/pages/mentor/KnowledgeSharing";
import MentorExpertise from "@/pages/mentor/Expertise";
import MentorAnalytics from "@/pages/mentor/Analytics";
import MentorNotifications from "@/pages/mentor/Notifications";
import MentorSettings from "@/pages/mentor/Settings";

const RoleGate: React.FC<{ role: "employee" | "hr" | "manager" | "admin" | "mentor"; children: React.ReactNode }> = ({ role: requiredRole, children }) => {
  const { role, profileLoading } = useAuth();
  if (profileLoading && role === null) return null;
  if (!role) return <Navigate to="/login" replace />;
  if (role !== requiredRole) return <Navigate to={role === "mentor" ? "/mentor/dashboard" : `/${role}`} replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>

      {/* =====================================================
          AUTH
      ===================================================== */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =====================================================
          EMPLOYEE
      ===================================================== */}

      <Route
        path="/employee"
        element={<EmployeeDashboard />}
      />

      <Route
        path="/employee/profile"
        element={<EmployeeProfile />}
      />

      <Route
        path="/employee/skills"
        element={<EmployeeSkills />}
      />

      <Route
        path="/employee/self-assessment"
        element={<SelfAssessment />}
      />

      <Route
        path="/employee/peer-assessment"
        element={<PeerAssessment />}
      />

      <Route
        path="/employee/proficiency"
        element={<EmployeeProficiency />}
      />

      <Route
        path="/employee/skill-gaps"
        element={<SkillGapsPage />}
      />

      <Route
        path="/employee/learning-paths"
        element={<LearningPaths />}
      />

      <Route
        path="/employee/training"
        element={<EmployeeTraining />}
      />

      <Route
        path="/employee/training/:trainingId/learn"
        element={<TrainingLearn />}
      />

      <Route
        path="/employee/experience"
        element={<Experience />}
      />

      <Route
        path="/employee/progress"
        element={<EmployeeProgress />}
      />

      <Route
        path="/employee/achievements"
        element={<Achievements />}
      />

      <Route
        path="/employee/certifications"
        element={<Certifications />}
      />

      <Route
        path="/employee/mentorship"
        element={<Mentorship />}
      />

      <Route
        path="/employee/notifications"
        element={<EmployeeNotifications />}
      />

      <Route
        path="/employee/settings"
        element={<EmployeeSettings />}
      />
       <Route
  path="/hr"
  element={<HRDashboard />}
/>

 <Route
  path="/admin/*"
  element={<AdminDashboard />}
/>
  <Route
  path="/manager"
  element={<ManagerDashboard />}
/>

 <Route
  path="/manager/dashboard"
  element={<ManagerDashboard />}
/>

 <Route
  path="/manager/employees"
  element={<ManagerEmployees />}
/>

 <Route
  path="/manager/departments"
  element={<ManagerDepartments />}
/>

 <Route
  path="/manager/job-roles"
  element={<ManagerJobRoles />}
/>

 <Route
  path="/manager/skills"
  element={<ManagerSkills />}
/>

 <Route
  path="/manager/competency-framework"
  element={<ManagerCompetencyFramework />}
/>

 <Route
  path="/manager/knowledge-gap-analysis"
  element={<ManagerKnowledgeGapAnalysis />}
/>

 <Route
  path="/manager/ai-recommendations"
  element={<ManagerAIRecommendations />}
/>

 <Route
  path="/manager/training-management"
  element={<ManagerTrainingManagement />}
/>

 <Route
  path="/manager/assessments"
  element={<ManagerAssessments />}
/>

 <Route
  path="/manager/reports"
  element={<ManagerReports />}
/>

 <Route
  path="/manager/settings"
  element={<ManagerSettings />}
/>

{/* =====================================================
    MENTOR
===================================================== */}

<Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
<Route path="/mentor/dashboard" element={<RoleGate role="mentor"><MentorDashboard /></RoleGate>} />
<Route path="/mentor/mentees" element={<RoleGate role="mentor"><MentorMentees /></RoleGate>} />
<Route path="/mentor/requests" element={<RoleGate role="mentor"><MentorRequests /></RoleGate>} />
<Route path="/mentor/sessions" element={<RoleGate role="mentor"><MentorSessions /></RoleGate>} />
<Route path="/mentor/knowledge-sharing" element={<RoleGate role="mentor"><MentorKnowledgeSharing /></RoleGate>} />
<Route path="/mentor/expertise" element={<RoleGate role="mentor"><MentorExpertise /></RoleGate>} />
<Route path="/mentor/analytics" element={<RoleGate role="mentor"><MentorAnalytics /></RoleGate>} />
<Route path="/mentor/notifications" element={<RoleGate role="mentor"><MentorNotifications /></RoleGate>} />
<Route path="/mentor/settings" element={<RoleGate role="mentor"><MentorSettings /></RoleGate>} />
      {/* =====================================================
          UNKNOWN ROUTE
      ===================================================== */}

      <Route path="*" element={<RoleAwareFallback />} />

    </Routes>
  );
};

const RoleAwareFallback: React.FC = () => {
  const { role } = useAuth();
  if (role === "mentor") return <Navigate to="/mentor/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "hr") return <Navigate to="/hr" replace />;
  if (role === "manager") return <Navigate to="/manager" replace />;
  if (role === "employee") return <Navigate to="/employee" replace />;
  return <Navigate to="/login" replace />;
};

export default App;