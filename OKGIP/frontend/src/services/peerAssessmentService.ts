import API from "@/api/axios";

export interface Peer {
    employeeId: number;
    employeeCode: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
}

export interface PeerSkill {
    skillId: number;
    skillName: string;
    skillCategory?: string;
    currentProficiency?: string;
}

export interface PeerQuestion {
    questionId: number;
    questionType: "RATING";
    questionText: string;
    marks: number;
    questionOrder: number;
}

export interface PeerAssessment {
    assessmentId: number;
    employeeId: number;
    employeeName: string;
    skillId: number;
    skillName: string;
    assessmentName: string;
    totalMarks: number;
    questions: PeerQuestion[];
}

export interface PeerAnswer {
    questionId: number;
    rating: number;
}

export interface PeerAssessmentResult {
    attemptId: number;
    assessmentId: number;
    employeeId: number;
    employeeName: string;
    skillId: number;
    skillName: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
}

const peerAssessmentService = {

    getPeers: async (): Promise<Peer[]> => {
        const response = await API.get<Peer[]>(
            "/peer-assessments/peers"
        );

        return response.data;
    },

    getPeerSkills: async (
        employeeId: number
    ): Promise<PeerSkill[]> => {

        const response = await API.get<PeerSkill[]>(
            `/peer-assessments/peers/${employeeId}/skills`
        );

        return response.data;
    },

    getAssessment: async (
        employeeId: number,
        skillId: number
    ): Promise<PeerAssessment> => {

        const response = await API.get<PeerAssessment>(
            `/peer-assessments/${employeeId}/${skillId}`
        );

        return response.data;
    },

    start: async (
        employeeId: number,
        skillId: number
    ): Promise<PeerAssessmentResult> => {

        const response =
            await API.post<PeerAssessmentResult>(
                `/peer-assessments/${employeeId}/${skillId}/start`
            );

        return response.data;
    },

    submit: async (
        attemptId: number,
        answers: PeerAnswer[]
    ): Promise<PeerAssessmentResult> => {

        const response =
            await API.post<PeerAssessmentResult>(
                `/peer-assessments/attempts/${attemptId}/submit`,
                answers
            );

        return response.data;
    }
};

export default peerAssessmentService;