import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
function Skills() {

const employeeId = localStorage.getItem("employeeId");

const [designation, setDesignation] = useState("");

const [skills, setSkills] = useState([]);

const [allSkills, setAllSkills] = useState([]);

const [selectedSkill, setSelectedSkill] = useState("");

const [newSkillLevel, setNewSkillLevel] = useState(3);


const levelNames = {
  1: "Beginner",
  2: "Intermediate",
  3: "Competent",
  4: "Advanced",
  5: "Expert",
};


useEffect(() => {

  if(!employeeId){
    alert("Employee information not found. Please login again.");
    return;
  }

  loadEmployeeSkills();
  loadAllSkills();

  setDesignation(localStorage.getItem("designation"));

}, []);



const loadEmployeeSkills = async () => {

  try {

    const response = await api.get(
      `/employee-skills/employee/${employeeId}`
    );

    setSkills(response.data);

  } catch (error) {

    console.error(
      "Error loading employee skills",
      error
    );

  }

};



const loadAllSkills = async () => {

  try {

    const response = await api.get("/skills");

    setAllSkills(response.data);

  } catch (error) {

    console.error(
      "Error loading skills",
      error
    );

  }

};



const addSkill = async (e) => {

  e.preventDefault();


  if (!selectedSkill) {

    alert("Please select a skill");
    return;

  }


  const alreadyExists = skills.some(
    (s) => s.skill.id === Number(selectedSkill)
  );


  if(alreadyExists){

    alert("Skill already added");
    return;

  }



  try {

    await api.post("/employee-skills/add", {

      employeeId: employeeId,
      skillId: Number(selectedSkill),
      currentLevel: newSkillLevel,

    });



    alert("Skill added successfully");


    setSelectedSkill("");

    setNewSkillLevel(3);


    loadEmployeeSkills();



  } catch (error) {

    console.error(error);

    alert("Unable to add skill");

  }

};




const updateSkillLevel = async (
  employeeSkillId,
  level
) => {

  try {


    await api.put(
      `/employee-skills/${employeeSkillId}`,
      {
        currentLevel: level
      }
    );


    loadEmployeeSkills();


  } catch (error) {

    console.error(error);

    alert("Unable to update skill");

  }

};
return (
  <div className="flex min-h-screen bg-gray-100">
    <Sidebar role={localStorage.getItem("role") || "EMPLOYEE"} />

    <div className="flex-1">
      <Navbar title="Skill Inventory" />

      <div className="p-8">

        <h2 className="text-2xl font-bold">Skill Inventory</h2>

        <p className="text-gray-500 mb-6">
          Manage your current skills and proficiency levels.
        </p>

        <div className="mb-6 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-lg">Designation</h3>
          <p className="text-indigo-600 font-semibold">
            {designation}
          </p>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">

          {/* Current Skills */}

<div className="xl:col-span-2 bg-white rounded-xl shadow p-6">

  <h3 className="text-lg font-semibold mb-4">
    Current Skills
  </h3>


  <div className="space-y-5">

    {skills.length === 0 && (
      <p className="text-gray-500">
        No skills added yet.
      </p>
    )}


    {skills.map((skill) => (

      <div
        key={skill.id}
        className="border rounded-xl p-4"
      >

        <div className="flex justify-between">

          <div>

            <h4 className="font-semibold">
              {skill.skill?.skillName}
            </h4>

            <p className="text-sm text-gray-500">
              {skill.skill?.category}
            </p>

          </div>


          <span className="text-indigo-600 font-semibold">
            {levelNames[skill.currentLevel]}
          </span>


        </div>


        <div className="mt-4">

          <label className="text-sm text-gray-600">
            Update Level
          </label>


          <select
            value={skill.currentLevel}
            onChange={(e) =>
              updateSkillLevel(
                skill.id,
                Number(e.target.value)
              )
            }
            className="mt-2 w-full border rounded-lg px-3 py-2"
          >

            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Competent</option>
            <option value={4}>Advanced</option>
            <option value={5}>Expert</option>

          </select>


        </div>


      </div>

    ))}

  </div>

</div>

          {/* Add Skill */}

          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-lg font-semibold mb-4">
              Add New Skill
            </h3>

            <form onSubmit={addSkill} className="space-y-4">

              <div>

                <label className="block mb-2">
                  Skill
                </label>

                <select
                  value={selectedSkill}
                  onChange={(e) =>
                    setSelectedSkill(e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-3"
                >

                  <option value="">
                    Select Skill
                  </option>

                  {allSkills
                .filter(
                (skill) =>
                  !skills.some(
                    (s) => s.skill?.id === skill.id
                  )
              )
              .map((skill) => (

                <option
                  key={skill.id}
                  value={skill.id}
                >
                  {skill.skillName}
                </option>

              ))}

                </select>

              </div>

              <div>

                <label className="block mb-2">
                  Proficiency Level
                </label>

                <select
                  value={newSkillLevel}
                  onChange={(e) =>
                    setNewSkillLevel(Number(e.target.value))
                  }
                  className="w-full border rounded-lg px-3 py-3"
                >

                  <option value={1}>Beginner</option>
                  <option value={2}>Intermediate</option>
                  <option value={3}>Competent</option>
                  <option value={4}>Advanced</option>
                  <option value={5}>Expert</option>

                </select>

              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-lg py-3 hover:bg-indigo-700"
              >
                Add Skill
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  </div>
);}
export default Skills;