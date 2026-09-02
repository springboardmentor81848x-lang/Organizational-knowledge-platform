import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  MessageSquare,
  Star,
  UserRound,
  CalendarDays,
  Award,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";

function PeerReviews() {
  // Business employee ID such as EMP1002
  const employeeId = localStorage.getItem("employeeId");

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD PEER REVIEWS
  // =========================================================

  useEffect(() => {
    loadPeerReviews();
  }, []);

  const loadPeerReviews = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        throw new Error(
          "Employee ID not found. Please login again."
        );
      }

      const response = await fetch(
        `http://localhost:8080/api/peer-assessment/reviews/${employeeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Unable to load peer reviews."
        );
      }

      const data = await response.json();

      console.log("Peer reviews:", data);

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Peer reviews loading error:", err);

      setError(
        err.message ||
          "Unable to load peer reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date not available";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // GET STAR DISPLAY
  // =========================================================

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // PERFORMANCE BADGE
  // =========================================================

  const getPerformanceClass = (performanceLevel) => {
    switch (performanceLevel) {
      case "Expert":
        return "bg-green-100 text-green-700";

      case "Advanced":
        return "bg-blue-100 text-blue-700";

      case "Competent":
        return "bg-indigo-100 text-indigo-700";

      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";

      case "Beginner":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">

          <Navbar title="Peer Reviews" />

          <main className="p-8">

            <div className="bg-white rounded-2xl shadow p-8">

              <div className="flex items-center gap-3">

                <RefreshCw
                  size={22}
                  className="text-indigo-600 animate-spin"
                />

                <p className="text-gray-600">
                  Loading your peer reviews...
                </p>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar role="EMPLOYEE" />

      <div className="flex-1">

        <Navbar title="Peer Reviews" />

        <main className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="p-3 bg-indigo-100 rounded-xl">

                <MessageSquare
                  size={28}
                  className="text-indigo-600"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-800">
                  Peer Reviews
                </h1>

                <p className="text-gray-500 mt-1">
                  View feedback and skill ratings received
                  from your peers.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">

              <div className="flex items-center gap-3">

                <AlertCircle size={20} />

                <span>{error}</span>

              </div>

              <button
                onClick={loadPeerReviews}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                <RefreshCw size={16} />
                Retry
              </button>

            </div>
          )}

          {/* =================================================
              NO REVIEWS
          ================================================= */}

          {!error && reviews.length === 0 && (

            <div className="bg-white rounded-2xl shadow p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-5">

                <MessageSquare
                  size={30}
                  className="text-indigo-600"
                />

              </div>

              <h2 className="text-xl font-bold text-slate-800">
                No Peer Reviews Yet
              </h2>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                You haven't received any peer assessments yet.
                Once another employee completes a peer
                assessment for you, their review will appear
                here.
              </p>

            </div>
          )}

          {/* =================================================
              REVIEWS
          ================================================= */}

          {reviews.length > 0 && (

            <div className="space-y-6">

              {reviews.map((review) => (

                <div
                  key={review.attemptId}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >

                  {/* =================================================
                      REVIEW HEADER
                  ================================================= */}

                  <div className="p-6 border-b border-gray-100">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* Reviewer */}

                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">

                          <UserRound
                            size={28}
                            className="text-indigo-600"
                          />

                        </div>

                        <div>

                          <p className="text-sm text-gray-500">
                            Reviewed by
                          </p>

                          <h2 className="text-lg font-bold text-slate-800">

                            {review.reviewerName ||
                              "Anonymous Reviewer"}

                          </h2>

                          {review.reviewerIdentifier && (

                            <p className="text-xs text-gray-400 mt-1">

                              {review.reviewerIdentifier}

                            </p>

                          )}

                        </div>

                      </div>

                      {/* Date */}

                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        <CalendarDays size={18} />

                        <span>
                          {formatDate(
                            review.completedAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      SUMMARY
                  ================================================= */}

                  <div className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">

                      {/* Overall Score */}

                      <div className="border border-gray-200 rounded-xl p-5">

                        <div className="flex items-center gap-3 mb-2">

                          <div className="p-2 bg-indigo-100 rounded-lg">

                            <Award
                              size={20}
                              className="text-indigo-600"
                            />

                          </div>

                          <p className="text-sm text-gray-500">
                            Overall Score
                          </p>

                        </div>

                        <p className="text-2xl font-bold text-slate-800">

                          {review.overallScore ?? 0}%

                        </p>

                      </div>

                      {/* Performance */}

                      <div className="border border-gray-200 rounded-xl p-5">

                        <div className="flex items-center gap-3 mb-2">

                          <div className="p-2 bg-green-100 rounded-lg">

                            <ClipboardCheck
                              size={20}
                              className="text-green-600"
                            />

                          </div>

                          <p className="text-sm text-gray-500">
                            Performance
                          </p>

                        </div>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceClass(
                            review.performanceLevel
                          )}`}
                        >
                          {review.performanceLevel ||
                            "Not Calculated"}
                        </span>

                      </div>

                      {/* Skills Reviewed */}

                      <div className="border border-gray-200 rounded-xl p-5">

                        <div className="flex items-center gap-3 mb-2">

                          <div className="p-2 bg-purple-100 rounded-lg">

                            <Star
                              size={20}
                              className="text-purple-600"
                            />

                          </div>

                          <p className="text-sm text-gray-500">
                            Skills Reviewed
                          </p>

                        </div>

                        <p className="text-2xl font-bold text-slate-800">

                          {review.skillRatings?.length || 0}

                        </p>

                      </div>

                    </div>

                    {/* =================================================
                        SKILL RATINGS
                    ================================================= */}

                    <div>

                      <h3 className="text-lg font-bold text-slate-800 mb-4">
                        Skill Ratings
                      </h3>

                      {!review.skillRatings ||
                      review.skillRatings.length === 0 ? (

                        <div className="border border-gray-200 rounded-xl p-6 text-center">

                          <p className="text-gray-500">
                            No skill ratings available.
                          </p>

                        </div>

                      ) : (

                        <div className="space-y-3">

                          {review.skillRatings.map(
                            (skill, index) => (

                              <div
                                key={`${skill.skillName}-${index}`}
                                className="border border-gray-200 rounded-xl p-4"
                              >

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                  {/* Skill */}

                                  <div>

                                    <h4 className="font-semibold text-slate-800">
                                      {skill.skillName}
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                      Peer proficiency rating
                                    </p>

                                  </div>

                                  {/* Rating */}

                                  <div className="flex items-center gap-4">

                                    {renderStars(
                                      skill.rating
                                    )}

                                    <div className="text-right min-w-[100px]">

                                      <p className="font-bold text-slate-800">
                                        {skill.rating}/5
                                      </p>

                                      <p className="text-xs text-gray-500">
                                        {skill.ratingLevel}
                                      </p>

                                    </div>

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default PeerReviews;