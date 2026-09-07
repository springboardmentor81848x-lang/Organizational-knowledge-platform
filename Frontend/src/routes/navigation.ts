import { Bell, BookOpen, Brain, BriefcaseBusiness, ChartNoAxesCombined, ClipboardCheck, GraduationCap, LayoutDashboard, Network, ScrollText, ShieldCheck, UserRound, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Array<'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'UNASSIGNED'>;
};

export const appNavigation: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: UserRound },
  { to: '/skills', label: 'My Skills', icon: Brain },
  { to: '/knowledge-gaps', label: 'Knowledge Gaps', icon: ChartNoAxesCombined },
  { to: '/learning', label: 'My Learning', icon: GraduationCap },
  { to: '/ai', label: 'AI Recommendations', icon: Network },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/certifications', label: 'Certifications', icon: ScrollText },
  { to: '/mentorship', label: 'Mentorship', icon: UsersRound },
  { to: '/knowledge-sessions', label: 'Knowledge Sessions', icon: BookOpen },
  { to: '/knowledge-resources', label: 'Knowledge Resources', icon: ScrollText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BriefcaseBusiness, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/employees', label: 'Employee Management', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/competencies', label: 'Competency Framework', icon: ShieldCheck, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/training-admin', label: 'Training Management', icon: GraduationCap, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/skills-admin', label: 'Skill Management', icon: Brain, roles: ['ADMIN'] },
];
