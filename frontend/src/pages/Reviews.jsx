import React, { useEffect, useState } from "react";
import api from "../services/api";

const Reviews = () => {

  const [reviewType, setReviewType] = useState("SELF");

  const [employeeId, setEmployeeId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [targetRoleId, setTargetRoleId] = useState(null);
  const [targetRoleName, setTargetRoleName] = useState("");

  const [overallRating, setOverallRating] = useState("");
  const [comments, setComments] = useState("");

  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // GET LOGGED-IN EMPLOYEE ID
  // =========================================================

  useEffect(() => {

    const storedEmployeeId =
      localStorage.getItem("employeeId") ||
      localStorage.getItem("userId");

    if (storedEmployeeId) {

      setEmployeeId(storedEmployeeId);

      setManagerId(storedEmployeeId);

      loadEmployeeTargetRole(storedEmployeeId);
    }

  }, []);

  // =========================================================
  // GET EMPLOYEE TARGET ROLE
  // =========================================================

  const loadEmployeeTargetRole = async (id) => {

    try {

      setSkillsLoading(true);
      setError("");

      /*
       * This endpoint should return the logged-in employee.
       *
       * Example:
       * GET /employees/15
       */

      const response =
        await api.get(`/employees/${id}`);

      const employee = response.data;

      console.log(
        "Logged-in employee:",
        employee
      );

      const roleId =
        employee.targetRoleId;

      if (!roleId) {

        setError(
          "No target role has been selected for this employee."
        );

        setSkills([]);

        return;
      }

      setTargetRoleId(roleId);

      // Load skills belonging ONLY to this target role
      await loadRoleSkills(roleId);

      /*
       * If employee response contains target role name,
       * use it.
       */

      if (employee.targetRoleName) {

        setTargetRoleName(
          employee.targetRoleName
        );

      } else if (employee.targetRole) {

        setTargetRoleName(
          employee.targetRole.roleName || ""
        );
      }

    } catch (err) {

      console.error(
        "Failed to load employee:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load employee information."
      );

    } finally {

      setSkillsLoading(false);
    }
  };

  // =========================================================
  // LOAD ONLY ROLE-RELATED SKILLS
  // =========================================================

  const loadRoleSkills = async (roleId) => {

    try {

      const response =
        await api.get(
          `/role-skills/role/${roleId}`
        );

      console.log(
        "Skills for target role:",
        response.data
      );

      setSkills(
        response.data || []
      );

    } catch (err) {

      console.error(
        "Failed to load role skills:",
        err
      );

      setSkills([]);

      setError(
        "Failed to load skills for your target role."
      );
    }
  };

  // =========================================================
  // HANDLE SKILL RATING
  // =========================================================

  const handleSkillRating = (
    skillId,
    rating
  ) => {

    setRatings((prev) => ({
      ...prev,
      [skillId]: Number(rating),
    }));
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    if (!employeeId) {

      setError(
        "Employee ID not found. Please login again."
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

      // =====================================================
      // CREATE SKILL RATINGS
      // =====================================================

      const skillRatings = skills
        .filter(
          (skill) =>
            ratings[skill.skillId] !== undefined
        )
        .map((skill) => ({
          skillId: skill.skillId,
          rating: ratings[skill.skillId],
          comments: "",
        }));

      let requestData = {};
      let endpoint = "";

      // =====================================================
      // SELF REVIEW
      // =====================================================

      if (reviewType === "SELF") {

        endpoint = "/reviews/self";

        requestData = {

          employeeId: Number(employeeId),

          overallRating:
            Number(overallRating),

          comments: comments,

          ratings: skillRatings,
        };
      }

      // =====================================================
      // PEER REVIEW
      // =====================================================

      else if (reviewType === "PEER") {

        endpoint = "/reviews/peer";

        requestData = {

          reviewerId:
            Number(employeeId),

          revieweeId:
            Number(revieweeId),

          overallRating:
            Number(overallRating),

          comments: comments,

          ratings: skillRatings,
        };
      }

      // =====================================================
      // MANAGER REVIEW
      // =====================================================

      else if (reviewType === "MANAGER") {

        endpoint = "/reviews/manager";

        requestData = {

          managerId:
            Number(managerId),

          employeeId:
            Number(revieweeId),

          overallRating:
            Number(overallRating),

          comments: comments,

          ratings: skillRatings,
        };
      }

      console.log(
        "Submitting review:",
        requestData
      );

      await api.post(
        endpoint,
        requestData
      );

      setMessage(
        "Review submitted successfully!"
      );

      setOverallRating("");

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
          gap: "5px",
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
                fontSize: "28px",
                color:
                  star <= value
                    ? "#f59e0b"
                    : "#d1d5db",
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
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >

      <h1>
        Employee Reviews
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Submit self, peer, or manager reviews.
      </p>

      {/* =====================================================
          TARGET ROLE
      ====================================================== */}

      <div
        style={{
          padding: "15px",
          marginBottom: "25px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
        }}
      >

        <strong>
          Target Role
        </strong>

        <p
          style={{
            marginTop: "6px",
            marginBottom: "0",
          }}
        >

          {targetRoleName ||
            (targetRoleId
              ? `Role ID: ${targetRoleId}`
              : "Loading...")}

        </p>

        <small
          style={{
            color: "#64748b",
          }}
        >
          Only skills related to your target role
          are shown below.
        </small>

      </div>

      {/* =====================================================
          REVIEW TYPE
      ====================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
        }}
      >

        <button
          type="button"
          onClick={() =>
            setReviewType("SELF")
          }
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border:
              "1px solid #ccc",
            cursor: "pointer",
            background:
              reviewType === "SELF"
                ? "#2563eb"
                : "#fff",
            color:
              reviewType === "SELF"
                ? "#fff"
                : "#000",
          }}
        >
          Self Review
        </button>

        <button
          type="button"
          onClick={() =>
            setReviewType("PEER")
          }
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border:
              "1px solid #ccc",
            cursor: "pointer",
            background:
              reviewType === "PEER"
                ? "#2563eb"
                : "#fff",
            color:
              reviewType === "PEER"
                ? "#fff"
                : "#000",
          }}
        >
          Peer Review
        </button>

        <button
          type="button"
          onClick={() =>
            setReviewType("MANAGER")
          }
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border:
              "1px solid #ccc",
            cursor: "pointer",
            background:
              reviewType === "MANAGER"
                ? "#2563eb"
                : "#fff",
            color:
              reviewType === "MANAGER"
                ? "#fff"
                : "#000",
          }}
        >
          Manager Review
        </button>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <form onSubmit={handleSubmit}>

        {/* SELF REVIEW */}

        {reviewType === "SELF" && (

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "#f3f4f6",
              borderRadius: "8px",
            }}
          >

            <strong>
              Self Review
            </strong>

            <p>
              You are reviewing your own performance.
            </p>

            <p>
              Employee ID:
              <strong>
                {" "}
                {employeeId ||
                  "Not available"}
              </strong>
            </p>

          </div>
        )}

        {/* PEER / MANAGER */}

        {(reviewType === "PEER" ||
          reviewType === "MANAGER") && (

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label>
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
                padding: "10px",
                marginTop: "8px",
                border:
                  "1px solid #ccc",
                borderRadius: "6px",
              }}
            />

          </div>
        )}

        {/* =====================================================
            OVERALL RATING
        ====================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <label>
            <strong>
              Overall Rating
            </strong>
          </label>

          {renderStars(
            Number(overallRating),
            setOverallRating
          )}

        </div>

        {/* =====================================================
            ROLE SKILL RATINGS
        ====================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <h3>
            Skills for Your Target Role
          </h3>

          {skillsLoading && (

            <p>
              Loading role-related skills...
            </p>

          )}

          {!skillsLoading &&
            skills.length === 0 && (

              <div
                style={{
                  padding: "15px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  color: "#92400e",
                }}
              >
                No skills have been mapped
                to your target role yet.
              </div>

            )}

          {!skillsLoading &&
            skills.map((skill) => (

              <div
                key={skill.skillId}
                style={{
                  padding: "15px",
                  marginBottom: "10px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fff",
                }}
              >

                <strong>
                  {skill.skillName}
                </strong>

                {skill.category && (

                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "12px",
                      padding: "4px 8px",
                      background: "#e0e7ff",
                      color: "#3730a3",
                      borderRadius: "12px",
                    }}
                  >
                    {skill.category}
                  </span>

                )}

                {skill.requiredLevel && (

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Required Level:{" "}
                    {skill.requiredLevel}
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

        {/* =====================================================
            COMMENTS
        ====================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <label>
            <strong>
              Comments
            </strong>
          </label>

          <textarea
            value={comments}
            onChange={(e) =>
              setComments(
                e.target.value
              )
            }
            placeholder="Write your comments..."
            rows="5"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              border:
                "1px solid #ccc",
              borderRadius: "6px",
              resize: "vertical",
            }}
          />

        </div>

        {/* =====================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {message && (

          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "6px",
            }}
          >
            {message}
          </div>

        )}

        {/* =====================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (

          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>

        )}

        {/* =====================================================
            SUBMIT
        ====================================================== */}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "6px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "16px",
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
  );
};

export default Reviews;