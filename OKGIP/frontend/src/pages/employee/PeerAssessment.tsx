import React, { useEffect, useState } from "react";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import peerAssessmentService, {
    Peer,
    PeerSkill,
    PeerAssessment as PeerAssessmentData,
    PeerAssessmentResult,
    PeerAnswer,
} from "@/services/peerAssessmentService";

const ratingOptions = [
    { value: 1, label: "Beginner" },
    { value: 2, label: "Developing" },
    { value: 3, label: "Competent" },
    { value: 4, label: "Advanced" },
    { value: 5, label: "Expert" },
];

const PeerAssessment: React.FC = () => {
    const [peers, setPeers] = useState<Peer[]>([]);
    const [skills, setSkills] = useState<PeerSkill[]>([]);
    const [assessment, setAssessment] = useState<PeerAssessmentData | null>(
        null
    );

    const [selectedPeerId, setSelectedPeerId] = useState<number | null>(null);
    const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

    const [ratings, setRatings] = useState<Record<number, number>>({});
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [result, setResult] = useState<PeerAssessmentResult | null>(null);

    const [loadingPeers, setLoadingPeers] = useState(true);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingAssessment, setLoadingAssessment] = useState(false);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // ---------------------------------------------------------
    // Load available peers
    // ---------------------------------------------------------
    useEffect(() => {
        const loadPeers = async () => {
            try {
                setLoadingPeers(true);
                setError(null);

                const data = await peerAssessmentService.getPeers();
                setPeers(data);
            } catch (err: any) {
                console.error("Failed to load peers:", err);

                setError(
                    err?.response?.data?.message ||
                        "Unable to load available peers."
                );
            } finally {
                setLoadingPeers(false);
            }
        };

        loadPeers();
    }, []);

    // ---------------------------------------------------------
    // When peer changes, load that employee's skills
    // ---------------------------------------------------------
    const handlePeerChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = event.target.value;

        setSelectedPeerId(value ? Number(value) : null);

        setSelectedSkillId(null);
        setSkills([]);
        setAssessment(null);
        setRatings({});
        setAttemptId(null);
        setResult(null);
        setError(null);

        if (!value) {
            return;
        }

        try {
            setLoadingSkills(true);

            const data = await peerAssessmentService.getPeerSkills(
                Number(value)
            );

            setSkills(data);
        } catch (err: any) {
            console.error("Failed to load peer skills:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load skills for the selected employee."
            );
        } finally {
            setLoadingSkills(false);
        }
    };

    // ---------------------------------------------------------
    // When skill changes, load peer assessment questions
    // ---------------------------------------------------------
    const handleSkillChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = event.target.value;

        setSelectedSkillId(value ? Number(value) : null);

        setAssessment(null);
        setRatings({});
        setAttemptId(null);
        setResult(null);
        setError(null);

        if (!value || !selectedPeerId) {
            return;
        }

        try {
            setLoadingAssessment(true);

            const data = await peerAssessmentService.getAssessment(
                selectedPeerId,
                Number(value)
            );

            setAssessment(data);
        } catch (err: any) {
            console.error("Failed to load peer assessment:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load the peer assessment."
            );
        } finally {
            setLoadingAssessment(false);
        }
    };

    // ---------------------------------------------------------
    // Start assessment
    // ---------------------------------------------------------
    const handleStartAssessment = async () => {
        if (!selectedPeerId || !selectedSkillId) {
            return;
        }

        try {
            setStarting(true);
            setError(null);

            const data = await peerAssessmentService.start(
                selectedPeerId,
                selectedSkillId
            );

            setAttemptId(data.attemptId);
            setResult(null);
            setRatings({});
        } catch (err: any) {
            console.error("Failed to start peer assessment:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to start the peer assessment."
            );
        } finally {
            setStarting(false);
        }
    };

    // ---------------------------------------------------------
    // Select rating for a question
    // ---------------------------------------------------------
    const handleRatingChange = (
        questionId: number,
        rating: number
    ) => {
        setRatings((previous) => ({
            ...previous,
            [questionId]: rating,
        }));
    };

    // ---------------------------------------------------------
    // Submit assessment
    // ---------------------------------------------------------
    const handleSubmit = async () => {
        if (!attemptId || !assessment) {
            return;
        }

        const unansweredQuestions = assessment.questions.filter(
            (question) => !ratings[question.questionId]
        );

        if (unansweredQuestions.length > 0) {
            setError(
                `Please answer all ${assessment.questions.length} questions before submitting.`
            );
            return;
        }

        const answers: PeerAnswer[] = assessment.questions.map(
            (question) => ({
                questionId: question.questionId,
                rating: ratings[question.questionId],
            })
        );

        try {
            setSubmitting(true);
            setError(null);

            const data = await peerAssessmentService.submit(
                attemptId,
                answers
            );

            setResult(data);
        } catch (err: any) {
            console.error("Failed to submit peer assessment:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to submit the peer assessment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedPeer = peers.find(
        (peer) => peer.employeeId === selectedPeerId
    );

    const selectedSkill = skills.find(
        (skill) => skill.skillId === selectedSkillId
    );

    const answeredCount = assessment
        ? assessment.questions.filter(
              (question) => ratings[question.questionId]
          ).length
        : 0;

    return (
        <EmployeePage
            title="Peer Assessment"
            subtitle="Evaluate a colleague's skills and provide competency feedback."
        >
            {/* -------------------------------------------------
                Error message
            ------------------------------------------------- */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* -------------------------------------------------
                Peer Selection
            ------------------------------------------------- */}
            <Card
                title="Select Peer"
                subtitle="Choose an employee whose skills you want to evaluate."
            >
                <div className="max-w-xl">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Employee
                    </label>

                    <select
                        value={selectedPeerId ?? ""}
                        onChange={handlePeerChange}
                        disabled={loadingPeers}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                    >
                        <option value="">
                            {loadingPeers
                                ? "Loading employees..."
                                : "Select employee"}
                        </option>

                        {peers.map((peer) => (
                            <option
                                key={peer.employeeId}
                                value={peer.employeeId}
                            >
                                {peer.name}
                                {peer.employeeCode
                                    ? ` (${peer.employeeCode})`
                                    : ""}
                            </option>
                        ))}
                    </select>

                    {!loadingPeers && peers.length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                            No eligible employees are available for peer
                            assessment.
                        </p>
                    )}
                </div>
            </Card>

            {/* -------------------------------------------------
                Peer Details
            ------------------------------------------------- */}
            {selectedPeer && (
                <Card
                    title="Peer Details"
                    subtitle="Information retrieved from the employee profile."
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Name
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedPeer.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Employee Code
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedPeer.employeeCode || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Department
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedPeer.department || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Role
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedPeer.role || "—"}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* -------------------------------------------------
                Skill Selection
            ------------------------------------------------- */}
            {selectedPeerId && (
                <Card
                    title="Select Skill"
                    subtitle="Choose a skill from the selected employee's skill profile."
                >
                    <div className="max-w-xl">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Skill
                        </label>

                        <select
                            value={selectedSkillId ?? ""}
                            onChange={handleSkillChange}
                            disabled={loadingSkills}
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                        >
                            <option value="">
                                {loadingSkills
                                    ? "Loading skills..."
                                    : "Select skill"}
                            </option>

                            {skills.map((skill) => (
                                <option
                                    key={skill.skillId}
                                    value={skill.skillId}
                                >
                                    {skill.skillName}
                                </option>
                            ))}
                        </select>

                        {selectedSkill && (
                            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {selectedSkill.skillName}
                                        </p>

                                        {selectedSkill.skillCategory && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {selectedSkill.skillCategory}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Current Proficiency
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                            {selectedSkill.currentProficiency ||
                                                "Not available"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* -------------------------------------------------
                Assessment
            ------------------------------------------------- */}
            {loadingAssessment && (
                <Card
                    title="Peer Assessment"
                    subtitle="Loading assessment..."
                >
                    <p className="text-sm text-slate-500">
                        Loading questions...
                    </p>
                </Card>
            )}

            {assessment && !result && !loadingAssessment && (
                <Card
                    title={assessment.assessmentName}
                    subtitle={`${assessment.skillName} • ${assessment.questions.length} competency questions`}
                >
                    <div className="space-y-6">
                        {/* Assessment information */}
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Skill
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                    {assessment.skillName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Total Marks
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                    {assessment.totalMarks}
                                </p>
                            </div>

                            {attemptId && (
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Progress
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {answeredCount}/
                                        {assessment.questions.length}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Start button */}
                        {!attemptId && (
                            <div className="rounded-lg border border-slate-200 p-5">
                                <p className="text-sm text-slate-600">
                                    Start the assessment to rate the selected
                                    employee's competency.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleStartAssessment}
                                    disabled={starting}
                                    className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {starting
                                        ? "Starting..."
                                        : "Start Assessment"}
                                </button>
                            </div>
                        )}

                        {/* Questions */}
                        {attemptId && (
                            <>
                                <div className="space-y-5">
                                    {assessment.questions.map(
                                        (question, index) => (
                                            <div
                                                key={question.questionId}
                                                className="rounded-xl border border-slate-200 p-5"
                                            >
                                                <div className="mb-4">
                                                    <p className="text-sm font-semibold leading-6 text-slate-800">
                                                        {index + 1}.{" "}
                                                        {
                                                            question.questionText
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {question.marks} marks
                                                    </p>
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-5">
                                                    {ratingOptions.map(
                                                        (option) => {
                                                            const selected =
                                                                ratings[
                                                                    question
                                                                        .questionId
                                                                ] ===
                                                                option.value;

                                                            return (
                                                                <button
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRatingChange(
                                                                            question.questionId,
                                                                            option.value
                                                                        )
                                                                    }
                                                                    className={`rounded-lg border px-3 py-3 text-left transition ${
                                                                        selected
                                                                            ? "border-slate-900 bg-slate-900 text-white"
                                                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                                                    }`}
                                                                >
                                                                    <div className="text-sm font-semibold">
                                                                        {
                                                                            option.value
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={`mt-1 text-[11px] ${
                                                                            selected
                                                                                ? "text-slate-200"
                                                                                : "text-slate-400"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </div>
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                                    <p className="text-xs text-slate-500">
                                        {answeredCount} of{" "}
                                        {assessment.questions.length} answered
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={
                                            submitting ||
                                            answeredCount !==
                                                assessment.questions.length
                                        }
                                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Assessment"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* -------------------------------------------------
                Result
            ------------------------------------------------- */}
            {result && (
                <Card
                    title="Assessment Completed"
                    subtitle="Your peer assessment has been submitted successfully."
                >
                    <div className="rounded-xl border border-slate-200 p-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Employee
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {result.employeeName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Skill
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {result.skillName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Score
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {result.score} / {result.totalMarks}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Percentage
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {result.percentage}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Status
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {result.status}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </EmployeePage>
    );
};

export default PeerAssessment;