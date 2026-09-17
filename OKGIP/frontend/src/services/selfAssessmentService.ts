import API from "@/api/axios";

export interface AssessmentOption { optionId:number; optionText:string; optionOrder:number; }
export interface AssessmentQuestion { questionId:number; type:"MCQ"|"CODING"; difficulty:"EASY"|"INTERMEDIATE"|"HARD"; questionText:string; marks:number; starterCode?:string; options:AssessmentOption[]; }
export interface SelfAssessment { assessmentId:number; skillId:number; skillName:string; assessmentName:string; totalMarks:number; questions:AssessmentQuestion[]; }
export interface AssessmentResult { attemptId:number; assessmentId:number; skillName:string; score:number; totalMarks:number; percentage:number; status:string; }
export interface Answer { questionId:number; selectedOptionId?:number; codeAnswer?:string; }
const selfAssessmentService={
 getMyAssessments:async()=> (await API.get<SelfAssessment[]>("/self-assessments/my")).data,
 getAssessment:async(id:number)=> (await API.get<SelfAssessment>(`/self-assessments/${id}`)).data,
 start:async(id:number)=> (await API.post<AssessmentResult>(`/self-assessments/${id}/start`)).data,
 submit:async(attemptId:number,answers:Answer[])=> (await API.post<AssessmentResult>(`/self-assessments/attempts/${attemptId}/submit`,{answers})).data,
};
export default selfAssessmentService;
