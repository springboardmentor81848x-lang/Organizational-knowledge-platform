export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'HR Specialist'
  | 'Department Head'
  | 'L&D Admin / Mentor'
  | 'Employee'
  | 'ROLE_ADMIN'
  | 'ROLE_MANAGER'
  | 'ROLE_HR'
  | 'ROLE_DEPARTMENT_HEAD'
  | 'ROLE_MENTOR'
  | 'ROLE_EMPLOYEE'
  | string;

export interface User {
  id: number;
  email: string;
  role: UserRole;
  employee?: Employee | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  head_employee_id: number | null;
  head_name?: string;
  employee_count?: number;
  active_gaps_count?: number;
  high_priority_gaps?: number;
  required_skills?: Array<{
    id: number;
    skill_id: number;
    required_proficiency: number;
    skill_name?: string;
    category?: string;
  }>;
}

export interface TargetRole {
  id: number;
  title: string;
  department_id: number;
  department_name?: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal' | 'Executive';
  description: string;
  salary_band?: string;
  required_skills: Array<{
    skill_id: number;
    skill_name: string;
    category: string;
    required_proficiency: number;
  }>;
}

export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location?: string;
  designation: string;
  target_role?: string;
  target_role_id?: number | null;
  target_role_readiness?: number;
  department_id: number | null;
  department_name?: string;
  join_date: string;
  photo_url: string | null;
  status: 'Active' | 'On Leave' | 'Terminated';
  skills_count?: number;
  gaps_count?: number;
  high_gaps_count?: number;
}

export interface Skill {
  id: number;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Domain Knowledge' | 'Compliance';
  description: string;
  assessed_employees_count?: number;
  required_in_departments?: string[];
  gap_count?: number;
  high_priority_gaps?: number;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  current_proficiency: number;
  assessed_date: string;
  verified_by: string;
  skill?: Skill;
  skill_name?: string;
  category?: string;
}

export interface KnowledgeGap {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_designation?: string;
  employee_photo?: string | null;
  department_name: string;
  skill_id: number;
  skill_name: string;
  skill_category: string;
  required_proficiency: number;
  current_proficiency: number;
  gap_score: number;
  competency_percentage: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Identified' | 'In Training' | 'Resolved';
  created_at: string;
  recommended_training?: {
    id: number;
    title: string;
    duration_hours: number;
    provider: string;
  } | null;
}

export interface CourseModuleItem {
  id: number;
  name: string;
  duration_minutes?: number;
  progress_percentage: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface LearningMilestoneItem {
  id: number;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completion_date?: string | null;
}

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  target_skill_id: number;
  target_skill_name?: string;
  min_proficiency_gain: number;
  duration_hours: number;
  provider: string;
  status: 'Active' | 'Draft' | 'Archived';
  modules?: CourseModuleItem[];
  milestones?: LearningMilestoneItem[];
  total_enrolled?: number;
  completed_count?: number;
  completion_rate?: number;
}

export type TrainingAssignmentStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Certified'
  | 'Expired / Renewal'
  | 'Assigned'
  | 'Overdue';

export interface TrainingAssignment {
  id: number;
  training_program_id: number;
  program_title: string;
  program_category: string;
  program_description?: string;
  duration_hours: number;
  provider?: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_designation?: string;
  department_name: string;
  target_skill_id?: number;
  target_skill_name: string;
  assigned_date: string;
  start_date: string;
  expected_completion_date: string;
  actual_completion_date?: string | null;
  due_date: string;
  status: TrainingAssignmentStatus;
  progress_percentage: number;
  recommendation_reason?: string;
  modules: CourseModuleItem[];
  milestones: LearningMilestoneItem[];
  completed_modules_count?: number;
  total_modules_count?: number;
  completed_modules_list?: CourseModuleItem[];
  remaining_modules_list?: CourseModuleItem[];
  completed_milestones_count?: number;
  total_milestones_count?: number;
  completed_milestones_list?: LearningMilestoneItem[];
  remaining_milestones_list?: LearningMilestoneItem[];
  certificate_url?: string | null;
  certificate_number?: string | null;
  certificate_expiry_date?: string | null;
  is_certified?: boolean;
  completed_at?: string | null;
}

export interface KnowledgeSession {
  id: number;
  title: string;
  description: string;
  host_mentor_id: number;
  host_mentor_name?: string;
  host_mentor_email?: string;
  host_mentor_designation?: string;
  skill_id: number;
  skill_name?: string;
  session_date: string;
  duration_minutes: number;
  max_capacity: number;
  meeting_link: string;
  location?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  average_rating: number;
  effectiveness_score: number;
  registered_count: number;
  is_user_registered?: boolean;
  user_attendance_status?: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED' | null;
  user_rating?: number | null;
  user_feedback?: string | null;
  registrations?: Array<{
    id: number;
    session_id: number;
    employee_id: number;
    employee_name?: string;
    employee_email?: string;
    designation?: string;
    department_name?: string;
    attendance_status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED';
    rating?: number;
    feedback?: string;
    registered_at: string;
  }>;
  created_at: string;
}

export interface ExpertItem {
  id: string;
  employee_id: number;
  expert_name: string;
  email: string;
  phone: string;
  designation: string;
  department_id: number;
  department_name: string;
  skill_id: number;
  skill_name: string;
  skill_category: string;
  current_proficiency: number;
  proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner' | 'Novice';
  rating: number;
  active_mentees_count: number;
  hosted_sessions_count: number;
  availability: string;
  photo_url?: string | null;
}

export type MentorshipStatus =
  | 'Pending Admin Review'
  | 'PENDING_ADMIN_APPROVAL'
  | 'Mentor Recommended'
  | 'MENTOR_RECOMMENDED'
  | 'Approved'
  | 'APPROVED'
  | 'Rejected'
  | 'REJECTED'
  | 'Active'
  | 'ACTIVE'
  | 'Completed'
  | 'COMPLETED'
  | 'Cancelled'
  | 'CANCELLED';

export interface MentorRequestHistoryItem {
  id: number;
  request_id: number;
  action: string;
  performed_by_id: number;
  performed_by_name: string;
  performed_by_role: string;
  old_status: string;
  new_status: string;
  comments: string;
  created_at: string;
}

export interface MentorRequestItem {
  id: number;
  mentor_id: number;
  requested_mentor_id?: number;
  recommended_mentor_id?: number | null;
  assigned_mentor_id?: number | null;
  mentee_id: number;
  skill_id: number;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  requested_at?: string;
  recommended_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  approved_by?: string | null;
  rejected_by?: string | null;
  rating?: number;
  feedback?: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_designation?: string;
  mentor_department?: string;
  mentor_photo?: string | null;
  requested_mentor_name?: string;
  requested_mentor_email?: string;
  requested_mentor_designation?: string;
  requested_mentor_department?: string;
  requested_mentor_photo?: string | null;
  recommended_mentor_name?: string | null;
  recommended_mentor_email?: string | null;
  recommended_mentor_designation?: string | null;
  recommended_mentor_department?: string | null;
  recommended_mentor_photo?: string | null;
  mentee_name?: string;
  mentee_email?: string;
  mentee_designation?: string;
  mentee_department?: string;
  mentee_photo?: string | null;
  skill_name?: string;
  skill_category?: string;
  gap_score?: number;
  gap_priority?: string;
  history?: MentorRequestHistoryItem[];
  created_at: string;
  updated_at?: string;
}

export interface MentorshipMatch {
  mentor_id: number;
  mentor_name: string;
  mentor_email: string;
  mentor_designation: string;
  department_name: string;
  skill_name: string;
  skill_category: string;
  mentor_proficiency: number;
  mentee_proficiency: number;
  proficiency_gap_gain: number;
  same_department: boolean;
  match_score: number;
  rating: number;
  completed_mentorships: number;
  availability: string;
  match_reasons: string[];
}

export interface TrainingRecommendation {
  gap_id: number;
  skill_id: number;
  skill_name: string;
  category: string;
  required_proficiency: number;
  current_proficiency: number;
  gap_score: number;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  recommended_program: {
    id: number;
    title: string;
    description: string;
    provider: string;
    duration_hours: number;
    min_proficiency_gain: number;
    modules_count: number;
    milestones_count: number;
  };
  is_enrolled: boolean;
  enrollment_status?: string | null;
  assignment_id?: number | null;
}

export interface NotificationChannelStatus {
  in_app: boolean;
  email?: { sent: boolean; sent_at?: string; recipient_email?: string };
  sms?: { sent: boolean; sent_at?: string; recipient_phone?: string };
  push?: { sent: boolean; sent_at?: string; device_token?: string };
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type:
    | 'Gap Alert'
    | 'Training Reminder'
    | 'Training Assigned'
    | 'Mentorship Reminder'
    | 'Learning Milestone'
    | 'Learning Achievement'
    | 'Assessment Reminder'
    | 'Recommendation Alert'
    | 'Skill Verified'
    | 'Leave Approved'
    | 'Task Assigned'
    | 'Certificate Earned'
    | 'Manager Message'
    | 'System'
    | string;
  priority?: 'High' | 'Medium' | 'Low';
  channels?: NotificationChannelStatus;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  metrics: {
    totalEmployees: number;
    totalDepartments: number;
    totalSkills: number;
    totalGaps: number;
    highPriorityGaps: number;
    mediumPriorityGaps: number;
    lowPriorityGaps: number;
    inTrainingCount: number;
    avgGapScore: number;
  };
  departmentBreakdown: Array<{
    department_id: number;
    department_name: string;
    total_gaps: number;
    high_gaps: number;
  }>;
  skillDeficiencies: Array<{
    skill_id: number;
    skill_name: string;
    category: string;
    gap_count: number;
    avg_deficit: number;
  }>;
}
