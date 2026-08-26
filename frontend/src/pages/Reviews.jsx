import React, { useEffect, useState } from "react";
import api from "../services/api";

const Reviews = () => {
  const [reviewType, setReviewType] = useState("SELF");

  const [employeeId, setEmployeeId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [targetRoleId, setTargetRoleId] = useState(null);
  const [targetRoleName, setTargetRoleName] = useState("");

  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState("");

  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // ROLE ID -> ROLE NAME
  // =========================================================

  const getRoleName = (roleId) => {
    const roles = {
      1: "Software Developer",
      2: "Software Tester",
      3: "Data Analyst",
      4: "Data Scientist",
      5: "DevOps Engineer",
      6: "UI/UX Designer",
      7: "Cybersecurity Analyst",
      8: "Database Administrator",
    };

    return roles[Number(roleId)] || `Role ID: ${roleId}`;
  };

  // =========================================================
  // GET EMPLOYEE ID
  // =========================================================

  useEffect(() => {
    const findEmployeeId = async () => {
      setError("");
      setSkillsLoading(true);

      const storedEmployeeId =
        localStorage.getItem("employeeId");

      const storedUserId =
        localStorage.getItem("userId");

      console.log("=================================");
      console.log("REVIEWS PAGE");
      console.log("employeeId:", storedEmployeeId);
      console.log("userId:", storedUserId);
      console.log("role:", localStorage.getItem("role"));
      console.log("userRole:", localStorage.getItem("userRole"));
      console.log("token exists:", !!localStorage.getItem("token"));
      console.log("=================================");

      let id =
        storedEmployeeId ||
        storedUserId;

      // -------------------------------------------------------
      // If employeeId is available, use it
      // -------------------------------------------------------

      if (id) {
        setEmployeeId(id);
        setManagerId(id);

        await loadEmployee(id);
        return;
      }

      // -------------------------------------------------------
      // If no ID exists, try loading all employees
      // and identify the logged-in employee using email.
      // -------------------------------------------------------

      try {
        const email =
          localStorage.getItem("email");

        if (!email) {
          setError(
            "Employee ID is not available. Please logout and login again."
          );

          setSkillsLoading(false);
          return;
        }

        const response =
          await api.get("/employees");

        const employees =
          response.data || [];

        const employee =
          employees.find(
            (emp) =>
              emp.email?.toLowerCase() ===
              email.toLowerCase()
          );

        if (!employee) {
          setError(
            "Could not find the logged-in employee."
          );

          setSkillsLoading(false);
          return;
        }

        id = employee.id;

        setEmployeeId(String(id));
        setManagerId(String(id));

        // Save it for future pages
        localStorage.setItem(
          "employeeId",
          String(id)
        );

        await loadEmployeeData(employee);

      } catch (err) {
        console.error(
          "Unable to find employee:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load employee information."
        );

        setSkillsLoading(false);
      }
    };

    findEmployeeId();
  }, []);

  // =========================================================
  // LOAD EMPLOYEE
  // =========================================================

  const loadEmployee = async (id) => {
    try {
      console.log(
        "Loading employee:",
        id
      );

      const response =
        await api.get(
          `/employees/${id}`
        );

      console.log(
        "Employee response:",
        response.data
      );

      await loadEmployeeData(
        response.data
      );

    } catch (err) {
      console.error(
        "Failed to load employee:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load employee information."
      );

      setSkillsLoading(false);
    }
  };

  // =========================================================
  // PROCESS EMPLOYEE DATA
  // =========================================================

  const loadEmployeeData = async (employee) => {
    console.log(
      "Employee data:",
      employee
    );

    // -------------------------------------------------------
    // IMPORTANT:
    // Employee entity contains:
    //
    // private Long targetRoleId;
    //
    // -------------------------------------------------------

    const roleId =
      employee.targetRoleId;

    console.log(
      "Target Role ID:",
      roleId
    );

    if (
      roleId === null ||
      roleId === undefined
    ) {
      setTargetRoleId(null);
      setTargetRoleName("");

      setSkills([]);

      setError(
        "No target role has been selected for this employee. Please select a target role during signup."
      );

      setSkillsLoading(false);

      return;
    }

    setTargetRoleId(roleId);

    // We already know the role name from the ID.
    setTargetRoleName(
      getRoleName(roleId)
    );

    // Load skills
    await loadRoleSkills(roleId);
  };

  // =========================================================
  // LOAD ROLE SKILLS
  // =========================================================

  const loadRoleSkills = async (roleId) => {
    try {
      setSkillsLoading(true);

      console.log(
        "================================="
      );

      console.log(
        "Loading skills for role:",
        roleId
      );

      console.log(
        "Endpoint:",
        `/role-skills/role/${roleId}`
      );

      console.log(
        "================================="
      );

      const response =
        await api.get(
          `/role-skills/role/${roleId}`
        );

      console.log(
        "Role skills response:",
        response.data
      );

      const roleSkills =
        Array.isArray(response.data)
          ? response.data
          : [];

      setSkills(roleSkills);

      if (roleSkills.length === 0) {
        setError(
          "The target role exists, but no skills are mapped to this role yet."
        );
      } else {
        setError("");
      }

    } catch (err) {
      console.error(
        "Failed to load role skills:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      setSkills([]);

      setError(
        err.response?.data?.message ||
        "Failed to load skills for your target role."
      );

    } finally {
      setSkillsLoading(false);
    }
  };

  // =========================================================
  // HANDLE SKILL RATING
  // =========================================================

  const handleSkillRating = (
    skillId,
    rating
  ) => {
    setRatings((previous) => ({
      ...previous,
      [skillId]: Number(rating),
    }));
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!employeeId) {
      setError(
        "Employee ID not found. Please logout and login again."
      );
      return;
    }

    if (!overallRating) {
      setError(
        "Please select an overall rating."
      );
      return;
    }

    if (
      (reviewType === "PEER" ||
        reviewType === "MANAGER") &&
      !revieweeId
    ) {
      setError(
        "Please enter the employee ID to review."
      );
      return;
    }

    try {
      setLoading(true);

      const skillRatings =
        skills
          .filter(
            (skill) =>
              ratings[skill.skillId] !==
              undefined
          )
          .map((skill) => ({
            skillId: skill.skillId,
            rating:
              ratings[skill.skillId],
            comments: "",
          }));

      let endpoint = "";
      let requestData = {};

      // -------------------------------------------------------
      // SELF
      // -------------------------------------------------------

      if (reviewType === "SELF") {
        endpoint =
          "/reviews/self";

        requestData = {
          employeeId:
            Number(employeeId),

          overallRating:
            Number(overallRating),

          comments,

          ratings:
            skillRatings,
        };
      }

      // -------------------------------------------------------
      // PEER
      // -------------------------------------------------------

      if (reviewType === "PEER") {
        endpoint =
          "/reviews/peer";

        requestData = {
          reviewerId:
            Number(employeeId),

          revieweeId:
            Number(revieweeId),

          overallRating:
            Number(overallRating),

          comments,

          ratings:
            skillRatings,
        };
      }

      // -------------------------------------------------------
      // MANAGER
      // -------------------------------------------------------

      if (reviewType === "MANAGER") {
        endpoint =
          "/reviews/manager";

        requestData = {
          managerId:
            Number(managerId),

          employeeId:
            Number(revieweeId),

          overallRating:
            Number(overallRating),

          comments,

          ratings:
            skillRatings,
        };
      }

      console.log(
        "Submitting:",
        requestData
      );

      await api.post(
        endpoint,
        requestData
      );

      setMessage(
        "Review submitted successfully!"
      );

      setOverallRating(0);
      setComments("");
      setRevieweeId("");
      setRatings({});

    } catch (err) {
      console.error(
        "Review submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to submit review."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STAR RATING
  // =========================================================

  const renderStars = (
    value,
    onChange
  ) => {
    return (
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "8px",
        }}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                onChange(star)
              }
              style={{
                border: "none",
                background:
                  "transparent",
                cursor: "pointer",
                fontSize: "30px",
                color:
                  star <= value
                    ? "#f59e0b"
                    : "#cbd5e1",
              }}
            >
              ★
            </button>
          )
        )}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "35px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Employee Reviews
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Submit self, peer, or manager
            performance reviews.
          </p>
        </div>

        {/* TARGET ROLE */}

        <div
          style={{
            padding: "20px",
            marginBottom: "25px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#1e3a8a",
            }}
          >
            Target Role
          </h3>

          <p
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin:
                "10px 0 5px",
              color: "#1e40af",
            }}
          >
            {targetRoleName ||
              "Not available"}
          </p>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Target Role ID:{" "}
            {targetRoleId ??
              "Not available"}
          </p>
        </div>

        {/* REVIEW TYPE */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "25px",
          }}
        >
          {[
            ["SELF", "Self Review"],
            ["PEER", "Peer Review"],
            [
              "MANAGER",
              "Manager Review",
            ],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setReviewType(value)
                }
                style={{
                  padding:
                    "10px 18px",
                  borderRadius: "8px",
                  border:
                    "1px solid #cbd5e1",
                  cursor: "pointer",
                  background:
                    reviewType === value
                      ? "#2563eb"
                      : "#fff",
                  color:
                    reviewType === value
                      ? "#fff"
                      : "#0f172a",
                  fontWeight: "600",
                }}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            border:
              "1px solid #e2e8f0",
          }}
        >
          {/* SELF */}

          {reviewType ===
            "SELF" && (
            <div
              style={{
                padding: "15px",
                marginBottom: "25px",
                background:
                  "#f1f5f9",
                borderRadius: "8px",
              }}
            >
              <strong>
                Self Review
              </strong>

              <p
                style={{
                  marginBottom: 0,
                }}
              >
                Employee ID:{" "}
                <strong>
                  {employeeId ||
                    "Not available"}
                </strong>
              </p>
            </div>
          )}

          {/* PEER / MANAGER */}

          {(reviewType ===
            "PEER" ||
            reviewType ===
              "MANAGER") && (
            <div
              style={{
                marginBottom: "25px",
              }}
            >
              <label
                style={{
                  fontWeight: "600",
                }}
              >
                Employee ID to Review
              </label>

              <input
                type="number"
                value={revieweeId}
                onChange={(e) =>
                  setRevieweeId(
                    e.target.value
                  )
                }
                placeholder="Enter employee ID"
                style={{
                  width: "100%",
                  padding: "11px",
                  marginTop: "8px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>
          )}

          {/* OVERALL RATING */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                fontWeight: "600",
              }}
            >
              Overall Rating
            </label>

            {renderStars(
              overallRating,
              setOverallRating
            )}
          </div>

          {/* SKILLS */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <h3>
              Skills for Your Target Role
            </h3>

            {skillsLoading && (
              <p
                style={{
                  color: "#64748b",
                }}
              >
                Loading role-related
                skills...
              </p>
            )}

            {!skillsLoading &&
              skills.length === 0 && (
                <div
                  style={{
                    padding: "15px",
                    background:
                      "#fef3c7",
                    color: "#92400e",
                    borderRadius: "8px",
                  }}
                >
                  No skills have been
                  mapped to your target
                  role yet.
                </div>
              )}

            {!skillsLoading &&
              skills.map((skill) => (
                <div
                  key={
                    skill.skillId
                  }
                  style={{
                    padding: "18px",
                    marginBottom:
                      "12px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "10px",
                  }}
                >
                  <strong>
                    {skill.skillName ||
                      skill.skill?.skillName ||
                      "Skill"}
                  </strong>

                  {skill.category && (
                    <span
                      style={{
                        marginLeft:
                          "10px",
                        padding:
                          "4px 8px",
                        borderRadius:
                          "12px",
                        fontSize:
                          "12px",
                        background:
                          "#e0e7ff",
                        color:
                          "#3730a3",
                      }}
                    >
                      {skill.category}
                    </span>
                  )}

                  {skill.requiredLevel && (
                    <p
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#64748b",
                      }}
                    >
                      Required Level:{" "}
                      {
                        skill.requiredLevel
                      }
                    </p>
                  )}

                  {renderStars(
                    ratings[
                      skill.skillId
                    ] || 0,
                    (value) =>
                      handleSkillRating(
                        skill.skillId,
                        value
                      )
                  )}
                </div>
              ))}
          </div>

          {/* COMMENTS */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                fontWeight: "600",
              }}
            >
              Comments
            </label>

            <textarea
              value={comments}
              onChange={(e) =>
                setComments(
                  e.target.value
                )
              }
              placeholder="Write your comments..."
              rows={5}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                resize: "vertical",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              style={{
                padding: "12px",
                marginBottom: "15px",
                background:
                  "#dcfce7",
                color: "#166534",
                borderRadius: "8px",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px",
                marginBottom: "15px",
                background:
                  "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background:
                loading
                  ? "#94a3b8"
                  : "#2563eb",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;