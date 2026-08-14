import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Skills() {
  const employeeId = localStorage.getItem("employeeId");

  const [designation, setDesignation] = useState("");
  const [skills, setSkills] = useState([]);

  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  useEffect(() => {
    if (!employeeId) {
      alert("Employee information not found. Please login again.");
      return;
    }

    loadEmployeeSkills();
    setDesignation(localStorage.getItem("designation") || "");
  }, []);

  const loadEmployeeSkills = async () => {
    try {
      const response = await api.get(
        `/employee-skills/employee/${employeeId}`
      );

      setSkills(response.data);
    } catch (error) {
      console.error("Error loading employee skills", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={localStorage.getItem("role") || "EMPLOYEE"} />

      <div className="flex-1">
        <Navbar title="Skill Inventory" />

        <div className="p-8">

          <h2 className="text-2xl font-bold">
            Skill Inventory
          </h2>

          <p className="text-gray-500 mb-6">
            Your skills and proficiency levels based on your assessments.
          </p>

          {/* Designation */}

          <div className="mb-6 bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-lg">
              Designation
            </h3>

            <p className="text-indigo-600 font-semibold">
              {designation}
            </p>
          </div>

          {/* Current Skills */}

          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-lg font-semibold mb-4">
              Current Skills
            </h3>

            <div className="space-y-5">

              {skills.length === 0 && (
                <p className="text-gray-500">
                  No assessment-based skills available yet.
                </p>
              )}

              {skills.map((skill) => (

                <div
                  key={skill.id}
                  className="border rounded-xl p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <h4 className="font-semibold">
                        {skill.skill?.skillName}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {skill.skill?.category}
                      </p>

                    </div>

                    <span className="text-indigo-600 font-semibold">
                      {levelNames[skill.currentLevel] ||
                        "Not Assessed"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Skills;