import React, { useEffect, useState } from "react";
import api from "../services/api";

const Reviews = () => {
  const [reviewType, setReviewType] = useState("SELF");

  const [employeeId, setEmployeeId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [overallRating, setOverallRating] = useState("");
  const [comments, setComments] = useState("");

  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(false);
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
    }
  }, []);

  // =========================================================
  // LOAD SKILLS
  // =========================================================

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await api.get("/skills");

      setSkills(response.data || []);
    } catch (err) {
      console.error("Failed to load skills:", err);
    }
  };

  // =========================================================
  // HANDLE SKILL RATING
  // =========================================================

  const handleSkillRating = (skillId, rating) => {
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
      setError("Employee ID not found. Please login again.");
      return;
    }

    if (!overallRating) {
      setError("Please select an overall rating.");
      return;
    }

    if (
      reviewType === "PEER" &&
      !revieweeId
    ) {
      setError("Please enter the employee ID.");
      return;
    }

    if (
      reviewType === "MANAGER" &&
      !revieweeId
    ) {
      setError("Please enter the employee ID to review.");
      return;
    }

    try {
      setLoading(true);

      const skillRatings = skills
        .filter((skill) => ratings[skill.id] !== undefined)
        .map((skill) => ({
          skillId: skill.id,
          rating: ratings[skill.id],
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
          overallRating: Number(overallRating),
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
          reviewerId: Number(employeeId),
          revieweeId: Number(revieweeId),
          overallRating: Number(overallRating),
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
          managerId: Number(managerId),
          employeeId: Number(revieweeId),
          overallRating: Number(overallRating),
          comments: comments,
          ratings: skillRatings,
        };
      }

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
      console.error(err);

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
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              onChange(star)
            }
            style={{
              border: "none",
              background: "transparent",
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
        ))}
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
      <h1>Employee Reviews</h1>

      <p
        style={{
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Submit self, peer, or manager reviews.
      </p>

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
            border: "1px solid #ccc",
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
            border: "1px solid #ccc",
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
            border: "1px solid #ccc",
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

        {/* SELF */}

        {reviewType === "SELF" && (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "#f3f4f6",
              borderRadius: "8px",
            }}
          >
            <strong>Self Review</strong>

            <p>
              You are reviewing your own performance.
            </p>

            <p>
              Employee ID:
              <strong>
                {" "}
                {employeeId || "Not available"}
              </strong>
            </p>
          </div>
        )}

        {/* PEER / MANAGER EMPLOYEE ID */}

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

        {/* =================================================
            OVERALL RATING
        ================================================== */}

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

        {/* =================================================
            SKILL RATINGS
        ================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h3>
            Skill Ratings
          </h3>

          {skills.length === 0 && (
            <p>
              No skills available.
            </p>
          )}

          {skills.map((skill) => (
            <div
              key={skill.id}
              style={{
                padding: "15px",
                marginBottom: "10px",
                border:
                  "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>
                {skill.skillName}
              </strong>

              {renderStars(
                ratings[skill.id] || 0,
                (value) =>
                  handleSkillRating(
                    skill.id,
                    value
                  )
              )}
            </div>
          ))}
        </div>

        {/* =================================================
            COMMENTS
        ================================================== */}

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

        {/* =================================================
            MESSAGE
        ================================================== */}

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

        {/* =================================================
            SUBMIT
        ================================================== */}

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