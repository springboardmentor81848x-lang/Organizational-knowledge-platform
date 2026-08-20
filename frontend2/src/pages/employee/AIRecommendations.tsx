import React from "react";
import { BookOpen, Clock, TrendingUp, ExternalLink } from "lucide-react";

// Mock data (static, no API calls)
const mockData = {
  learningPath: [
    {
      phase: 1,
      title: "Foundational Skill Acquisition",
      duration: "10 Weeks",
      reason: "Establish core proficiency in cloud and DevOps.",
    },
    {
      phase: 2,
      title: "Advanced Java Development",
      duration: "12 Weeks",
      reason: "Bridge the experience gap in microservices.",
    },
    {
      phase: 3,
      title: "Architecture & Design Patterns",
      duration: "8 Weeks",
      reason: "Master system design and scalability.",
    },
  ],
  priorityGaps: [
    { skillName: "Kubernetes", gapPercentage: 24, priority: "HIGH", gapType: "LOW_EXPERIENCE" },
    { skillName: "Terraform", gapPercentage: 30, priority: "HIGH", gapType: "MISSING_SKILL" },
    { skillName: "AWS", gapPercentage: 12, priority: "MEDIUM", gapType: "INSUFFICIENT_PROFICIENCY" },
  ],
  recommendedCourses: [
    {
      trainingName: "Spring Boot Fundamentals",
      provider: "Spring",
      duration: "6 Weeks",
      level: "BEGINNER",
      courseUrl: "https://spring.io/guides/gs/spring-boot/",
    },
    {
      trainingName: "AWS Certified Solutions Architect",
      provider: "AWS",
      duration: "10 Weeks",
      level: "INTERMEDIATE",
      courseUrl: "https://aws.amazon.com/training/",
    },
    {
      trainingName: "Kubernetes Mastery",
      provider: "CNCF",
      duration: "8 Weeks",
      level: "ADVANCED",
      courseUrl: "https://kubernetes.io/docs/tutorials/",
    },
  ],
};

const EmployeeAIRecommendations: React.FC = () => {
  const data = mockData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Recommendations</h1>

      {/* Learning Path */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          📘 Learning Path
        </h2>
        <div className="relative pl-6 border-l-2 border-purple-200 space-y-8">
          {data.learningPath.map((phase) => (
            <div key={phase.phase} className="relative">
              <div className="absolute -left-3 top-1 w-5 h-5 bg-purple-600 rounded-full border-2 border-white"></div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{phase.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {phase.duration}
                </p>
                <p className="text-sm text-gray-600 mt-1">{phase.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Gaps */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-500" />
          🔴 Priority Skill Gaps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.priorityGaps.map((gap, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{gap.skillName}</span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    gap.priority === "HIGH" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {gap.priority}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-purple-600"
                  style={{ width: `${100 - gap.gapPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {gap.gapPercentage}% Gap – {gap.gapType}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🎯 Recommended Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendedCourses.map((course, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">{course.trainingName}</h3>
              <p className="text-sm text-gray-500">
                {course.provider} • {course.duration}
              </p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                {course.level}
              </span>
              <a
                href={course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                View Course <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAIRecommendations;