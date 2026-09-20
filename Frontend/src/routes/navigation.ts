import { Bell, BookOpen, Brain, BriefcaseBusiness, ChartNoAxesCombined, ClipboardCheck, GraduationCap, LayoutDashboard, Network, ScrollText, ShieldCheck, UserRound, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Array<'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'UNASSIGNED'>;
};

export const appNavigation: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
  { to: '/profile', label: 'My Profile', icon: UserRound, roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
  { to: '/skills', label: 'My Skills', icon: Brain, roles: ['EMPLOYEE'] },
  { to: '/knowledge-gaps', label: 'Knowledge Gaps', icon: ChartNoAxesCombined, roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  { to: '/learning', label: 'My Learning', icon: GraduationCap, roles: ['EMPLOYEE', 'MANAGER'] },
  { to: '/ai', label: 'AI Recommendations', icon: Network, roles: ['EMPLOYEE'] },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck, roles: ['EMPLOYEE', 'MANAGER'] },
  { to: '/certifications', label: 'Certifications', icon: ScrollText, roles: ['EMPLOYEE'] },
  { to: '/mentorship', label: 'Mentorship', icon: UsersRound, roles: ['EMPLOYEE', 'MANAGER'] },
  { to: '/knowledge-sessions', label: 'Knowledge Sessions', icon: BookOpen, roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  { to: '/knowledge-resources', label: 'Knowledge Resources', icon: ScrollText, roles: ['EMPLOYEE', 'HR'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
  { to: '/reports', label: 'Reports', icon: BriefcaseBusiness, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/employees', label: 'Employee Management', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/competencies', label: 'Competency Framework', icon: ShieldCheck, roles: ['ADMIN', 'HR'] },
  { to: '/training-admin', label: 'Training Management', icon: GraduationCap, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/skills-admin', label: 'Skill Management', icon: Brain, roles: ['ADMIN'] },
];
