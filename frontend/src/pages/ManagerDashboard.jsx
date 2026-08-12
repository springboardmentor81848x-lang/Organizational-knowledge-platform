import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  Target,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  BookOpen,
  UserCheck,
  Lightbulb,
  Flame,
} from "lucide-react";

function ManagerDashboard() {
  // Temporary frontend data
  // These can be replaced with backend API data later

  const teamMembers = [
    {
      name: "Rahul",
      role: "Java Developer",
      skillCoverage: 85,
      progress: 82,
      training: 75,
      status: "On Track",
    },
    {
      name: "Anjali",
      role: "Frontend Developer",
      skillCoverage: 72,
      progress: 76,
      training: 80,
      status: "On Track",
    },
    {
      name: "Kiran",
      role: "Backend Developer",
      skillCoverage: 55,
      progress: 58,
      training: 45,
      status: "Needs Attention",
    },
    {
      name: "Priya",
      role: "Software Engineer",
      skillCoverage: 92,
      progress: 91,
      training: 90,
      status: "Excellent",
    },
  ];

  const skillCoverage = [
    { skill: "Java", coverage: 85 },
    { skill: "Spring Boot", coverage: 72 },
    { skill: "SQL", coverage: 78 },
    { skill: "React", coverage: 65 },
    { skill: "Git", coverage: 88 },
  ];

  const highRiskGaps = [
    {
      skill: "Spring Boot",
      employees: 5,
      severity: "Critical",
    },
    {
      skill: "React",
      employees: 4,
      severity: "High",
    },
    {
      skill: "SQL",
      employees: 3,
      severity: "High",
    },
  ];

  const heatmap = [
    {
      name: "Rahul",
      skills: ["strong", "medium", "strong", "weak", "strong"],
    },
    {
      name: "Anjali",
      skills: ["strong", "strong", "medium", "strong", "strong"],
    },
    {
      name: "Kiran",
      skills: ["weak", "weak", "medium", "strong", "medium"],
    },
    {
      name: "Priya",
      skills: ["strong", "strong", "strong", "strong", "strong"],
    },
  ];

  const heatmapColors = {
    strong: "bg-emerald-500",
    medium: "bg-amber-400",
    weak: "bg-red-500",
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">

      {/* Sidebar */}
      <Sidebar role="MANAGER" />

      <div className="flex-1">

        {/* Navbar */}
        <Navbar title="Manager Dashboard" />

        <div className="p-8">

          {/* ============================= */}
          {/* HEADER */}
          {/* ============================= */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Manager Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Monitor your team's skills, knowledge gaps,
              training and learning progress.
            </p>
          </div>


          {/* ============================= */}
          {/* SUMMARY CARDS */}
          {/* ============================= */}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Team Members */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-indigo-100">
                    Team Members
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    18
                  </h2>

                  <p className="text-sm text-indigo-100 mt-2">
                    Active team members
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <Users size={34} />
                </div>

              </div>
            </div>


            {/* Skill Coverage */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-blue-100">
                    Team Skill Coverage
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    76%
                  </h2>

                  <p className="text-sm text-blue-100 mt-2">
                    ↑ 6% this month
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <Target size={34} />
                </div>

              </div>
            </div>


            {/* High Risk Gaps */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-red-100">
                    High-Risk Gaps
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    7
                  </h2>

                  <p className="text-sm text-red-100 mt-2">
                    Requires attention
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <AlertTriangle size={34} />
                </div>

              </div>
            </div>


            {/* Training Adoption */}
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-purple-100">
                    Training Adoption
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    68%
                  </h2>

                  <p className="text-sm text-purple-100 mt-2">
                    ↑ 10% this month
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <GraduationCap size={34} />
                </div>

              </div>
            </div>

          </div>


          {/* ============================= */}
          {/* TEAM GAP HEATMAP */}
          {/* ============================= */}

          <div className="bg-white rounded-2xl shadow-lg mt-8 p-6">

            <div className="flex justify-between items-center mb-6">

              <div className="flex items-center gap-3">

                <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                  <Flame size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Team Gap Heatmap
                  </h2>

                  <p className="text-sm text-slate-500">
                    Skill proficiency across team members
                  </p>
                </div>

              </div>


              {/* Heatmap Legend */}
              <div className="flex gap-4 text-sm">

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
                  Strong
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-400 rounded-sm"></span>
                  Moderate
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
                  Gap
                </span>

              </div>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-4 px-3 text-slate-600">
                      Employee
                    </th>

                    {[
                      "Java",
                      "Spring Boot",
                      "SQL",
                      "React",
                      "Git",
                    ].map((skill) => (

                      <th
                        key={skill}
                        className="text-center py-4 px-3 text-slate-600"
                      >
                        {skill}
                      </th>

                    ))}

                  </tr>

                </thead>


                <tbody>

                  {heatmap.map((member) => (

                    <tr
                      key={member.name}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="py-4 px-3 font-semibold text-slate-700">
                        {member.name}
                      </td>

                      {member.skills.map((level, index) => (

                        <td
                          key={index}
                          className="text-center py-4 px-3"
                        >

                          <div
                            className={`w-10 h-10 mx-auto rounded-lg ${heatmapColors[level]} shadow-sm`}
                          ></div>

                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* ============================= */}
          {/* SKILL COVERAGE + HIGH RISK */}
          {/* ============================= */}

          <div className="grid xl:grid-cols-2 gap-6 mt-8">

            {/* Team Skill Coverage */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Target size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Team Skill Coverage
                  </h2>

                  <p className="text-sm text-slate-500">
                    Current coverage by skill
                  </p>
                </div>

              </div>


              {skillCoverage.map((item) => (

                <div
                  key={item.skill}
                  className="mb-6"
                >

                  <div className="flex justify-between mb-2">

                    <span className="font-medium text-slate-700">
                      {item.skill}
                    </span>

                    <span className="font-semibold text-slate-600">
                      {item.coverage}%
                    </span>

                  </div>


                  <div className="bg-slate-100 rounded-full h-3 overflow-hidden">

                    <div
                      className={`h-3 rounded-full ${
                        item.coverage >= 80
                          ? "bg-gradient-to-r from-emerald-400 to-green-600"
                          : item.coverage >= 60
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                          : "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                      style={{
                        width: `${item.coverage}%`,
                      }}
                    ></div>

                  </div>

                </div>

              ))}

            </div>


            {/* High Risk Gaps */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    High-Risk Skill Gaps
                  </h2>

                  <p className="text-sm text-slate-500">
                    Skills requiring immediate attention
                  </p>
                </div>

              </div>


              <div className="space-y-4">

                {highRiskGaps.map((gap) => (

                  <div
                    key={gap.skill}
                    className={`p-4 rounded-xl border-l-4 ${
                      gap.severity === "Critical"
                        ? "bg-red-50 border-red-500"
                        : "bg-orange-50 border-orange-500"
                    }`}
                  >

                    <div className="flex justify-between items-center">

                      <div>

                        <h3 className="font-bold text-slate-800">
                          {gap.skill}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {gap.employees} employees below
                          required level
                        </p>

                      </div>


                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          gap.severity === "Critical"
                            ? "bg-red-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {gap.severity}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* ============================= */}
          {/* TRAINING ADOPTION */}
          {/* ============================= */}

          <div className="bg-white rounded-2xl shadow-lg mt-8 p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                <GraduationCap size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Training Adoption
                </h2>

                <p className="text-sm text-slate-500">
                  Team participation in recommended learning
                </p>

              </div>

            </div>


            <div className="grid md:grid-cols-3 gap-6">

              {/* Completed */}

              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-green-200">

                <p className="text-green-700 font-medium">
                  Completed
                </p>

                <h3 className="text-3xl font-bold text-green-800 mt-2">
                  45%
                </h3>

                <div className="mt-4 bg-green-200 rounded-full h-2">

                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>

                </div>

              </div>


              {/* In Progress */}

              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">

                <p className="text-blue-700 font-medium">
                  In Progress
                </p>

                <h3 className="text-3xl font-bold text-blue-800 mt-2">
                  23%
                </h3>

                <div className="mt-4 bg-blue-200 rounded-full h-2">

                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "23%" }}
                  ></div>

                </div>

              </div>


              {/* Not Started */}

              <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-6 border border-red-200">

                <p className="text-red-700 font-medium">
                  Not Started
                </p>

                <h3 className="text-3xl font-bold text-red-800 mt-2">
                  32%
                </h3>

                <div className="mt-4 bg-red-200 rounded-full h-2">

                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: "32%" }}
                  ></div>

                </div>

              </div>

            </div>

          </div>


          {/* ============================= */}
          {/* INDIVIDUAL PROGRESS */}
          {/* ============================= */}

          <div className="bg-white rounded-2xl shadow-lg mt-8 p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <TrendingUp size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Individual Progress
                </h2>

                <p className="text-sm text-slate-500">
                  Monitor team member learning progress
                </p>

              </div>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b bg-slate-50">

                    <th className="text-left py-4 px-3">
                      Employee
                    </th>

                    <th className="text-left">
                      Role
                    </th>

                    <th className="text-left">
                      Skill Coverage
                    </th>

                    <th className="text-left">
                      Learning Progress
                    </th>

                    <th className="text-left">
                      Training
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {teamMembers.map((member) => (

                    <tr
                      key={member.name}
                      className="border-b hover:bg-indigo-50/50 transition"
                    >

                      <td className="py-4 px-3">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                            {member.name.charAt(0)}
                          </div>

                          <span className="font-semibold text-slate-700">
                            {member.name}
                          </span>

                        </div>

                      </td>


                      <td className="text-slate-500">
                        {member.role}
                      </td>


                      <td>

                        <div className="flex items-center gap-2">

                          <div className="w-20 bg-slate-200 rounded-full h-2">

                            <div
                              className="bg-gradient-to-r from-blue-400 to-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${member.skillCoverage}%`,
                              }}
                            ></div>

                          </div>

                          <span className="text-sm font-medium">
                            {member.skillCoverage}%
                          </span>

                        </div>

                      </td>


                      <td>

                        <div className="flex items-center gap-2">

                          <div className="w-20 bg-slate-200 rounded-full h-2">

                            <div
                              className="bg-gradient-to-r from-emerald-400 to-green-600 h-2 rounded-full"
                              style={{
                                width: `${member.progress}%`,
                              }}
                            ></div>

                          </div>

                          <span className="text-sm font-medium">
                            {member.progress}%
                          </span>

                        </div>

                      </td>


                      <td>

                        <span className="font-semibold text-purple-600">
                          {member.training}%
                        </span>

                      </td>


                      <td>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            member.status === "Excellent"
                              ? "bg-emerald-100 text-emerald-700"
                              : member.status === "On Track"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {member.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* ============================= */}
          {/* LEARNING INTERVENTIONS */}
          {/* ============================= */}

          <div className="bg-gradient-to-br from-slate-800 to-indigo-950 rounded-2xl shadow-lg mt-8 p-6 text-white">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-yellow-400/20 text-yellow-300 p-3 rounded-xl">
                <Lightbulb size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Recommended Learning Interventions
                </h2>

                <p className="text-slate-300 text-sm">
                  Suggested actions based on team skill gaps
                </p>

              </div>

            </div>


            <div className="grid md:grid-cols-3 gap-5">

              {/* Spring Boot */}

              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/10 hover:bg-white/15 transition">

                <BookOpen
                  size={28}
                  className="text-cyan-300 mb-4"
                />

                <h3 className="font-semibold text-lg">
                  Spring Boot Training
                </h3>

                <p className="text-sm text-slate-300 mt-2">
                  5 team members have significant Spring Boot
                  knowledge gaps.
                </p>

                <button className="mt-5 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  Recommend Training
                </button>

              </div>


              {/* React */}

              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/10 hover:bg-white/15 transition">

                <GraduationCap
                  size={28}
                  className="text-purple-300 mb-4"
                />

                <h3 className="font-semibold text-lg">
                  React Learning Path
                </h3>

                <p className="text-sm text-slate-300 mt-2">
                  4 employees would benefit from React
                  development training.
                </p>

                <button className="mt-5 bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  Recommend Learning
                </button>

              </div>


              {/* Mentoring */}

              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/10 hover:bg-white/15 transition">

                <UserCheck
                  size={28}
                  className="text-emerald-300 mb-4"
                />

                <h3 className="font-semibold text-lg">
                  Individual Mentoring
                </h3>

                <p className="text-sm text-slate-300 mt-2">
                  3 employees may require additional mentoring
                  support.
                </p>

                <button className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  View Employees
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;