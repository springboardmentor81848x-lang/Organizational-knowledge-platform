import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Target,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  BarChart3,
  Bot,
  Globe,
  Award,
  Zap,
  Building2,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const IntroTourModal: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const ONE_HOUR_MS = 60 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    // Check if first time or > 1 hour elapsed since last view
    const lastShownStr = localStorage.getItem('okgip_intro_last_shown');
    const now = Date.now();

    if (!lastShownStr) {
      // First time after login!
      setIsOpen(true);
      localStorage.setItem('okgip_intro_last_shown', now.toString());
    } else {
      const lastShown = parseInt(lastShownStr, 10);
      if (isNaN(lastShown) || now - lastShown >= ONE_HOUR_MS) {
        setIsOpen(true);
        localStorage.setItem('okgip_intro_last_shown', now.toString());
      }
    }

    // Listen for manual trigger events from Navbar or Help buttons
    const handleManualOpen = () => {
      setStep(0);
      setIsOpen(true);
    };

    window.addEventListener('open-okgip-intro', handleManualOpen);
    return () => {
      window.removeEventListener('open-okgip-intro', handleManualOpen);
    };
  }, [user]);

  const handleClose = () => {
    localStorage.setItem('okgip_intro_last_shown', Date.now().toString());
    setIsOpen(false);
  };

  if (!user) return null;

  const role = user.role || 'Employee';
  const deptName = user.department?.name || 'Software Engineering';
  const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Team Member';
  const designation = user.designation || 'Specialist';

  // Dynamic role-based slide content
  const getRoleDetails = () => {
    switch (role) {
      case 'Manager':
        return {
          roleBadge: 'Team Lead / Manager Focus',
          roleTitle: 'Team Heatmaps & High-Risk Gap Mitigation',
          roleDesc: `As a Team Lead in ${deptName}, your portal gives you strict visibility into your direct reports, live skill coverage heatmaps, and priority risk flags.`,
          rolePoints: [
            'Monitor team skill proficiency matrix across 5 standardized competency tiers',
            'Instantly spot high-risk deficits (Gap Delta ≥ 2) across ongoing initiatives',
            'Assign targeted training courses directly to individual team members with 1 click',
            'Evaluate completed assessments and review team certification milestones'
          ]
        };
      case 'Department Head':
        return {
          roleBadge: 'Department Head Executive Focus',
          roleTitle: 'Department Competency Index & Macro Analytics',
          roleDesc: `As Department Head for ${deptName}, access high-level skill distribution benchmarks, department-wide completion rates, and talent readiness metrics.`,
          rolePoints: [
            'Track Macro Competency Index for all sub-teams within ' + deptName,
            'Oversee departmental training budgets, resource allocation, and progress velocity',
            'Analyze skill readiness against upcoming strategic organization objectives',
            'Export comprehensive executive PDF and Excel audit reports in seconds'
          ]
        };
      case 'HR Specialist':
        return {
          roleBadge: 'HR & Talent Governance Focus',
          roleTitle: 'Workforce Inventory & Compliance Oversight',
          roleDesc: 'Govern organization-wide employee records, talent onboarding lifecycles, leave management, and mandatory skill compliance.',
          rolePoints: [
            'Maintain complete employee directory with active designation & role mappings',
            'Review leave requests, department staffing balance, and attendance patterns',
            'Audit mandatory compliance certifications and automated renewal reminders',
            'Forecast talent gaps for recruitment planning and team structuring'
          ]
        };
      case 'L&D Admin / Mentor':
        return {
          roleBadge: 'Learning & Mentorship Center',
          roleTitle: 'Course Curriculum & 1-on-1 Mentorship',
          roleDesc: 'Design targeted training modules, host interactive knowledge-sharing sessions, and guide colleagues through dedicated mentorship programs.',
          rolePoints: [
            'Publish new learning modules, quizzes, and practical milestone roadmaps',
            'Manage 1-on-1 mentorship requests, session logs, and mentee progress notes',
            'Host live knowledge workshops with interactive chat and attendee feedback',
            'Issue verifiable digital badge credentials upon course graduation'
          ]
        };
      case 'Admin':
        return {
          roleBadge: 'Enterprise System Administrator',
          roleTitle: 'Full Governance, RBAC & Intelligence Hub',
          roleDesc: 'You have unrestricted control over user accounts, role definitions, audit logs, system configurations, and cross-departmental intelligence.',
          rolePoints: [
            'Manage all user accounts, RBAC permissions, and department hierarchies',
            'Use the instant Role Switcher to inspect the platform from any user lens',
            'Inspect immutable security audit trails for all system mutations',
            'Configure intelligence thresholds, skill taxonomies, and assessment weights'
          ]
        };
      default: // Employee
        return {
          roleBadge: 'Personal Growth & Upskilling',
          roleTitle: 'Your Skill Profile & Adaptive Growth Path',
          roleDesc: `Welcome to your personal career development hub within ${deptName}. Take assessments, identify skill gaps, and level up your competencies.`,
          rolePoints: [
            'View your personal Competency Radar across key domain requirements',
            'Take interactive skill assessments to benchmark your actual proficiency (Tiers 1–5)',
            'Follow AI-recommended learning paths tailored directly to your identified gaps',
            'Connect with internal mentors and earn certified skill milestone badges'
          ]
        };
    }
  };

  const getDepartmentSkills = () => {
    if (deptName.toLowerCase().includes('data') || deptName.toLowerCase().includes('analytic')) {
      return ['Python & Pandas', 'Machine Learning Models', 'BigQuery / SQL', 'Data Visualizations (D3/Tableau)', 'ETL Pipeline Design'];
    }
    if (deptName.toLowerCase().includes('cyber') || deptName.toLowerCase().includes('security')) {
      return ['Threat Analysis & SIEM', 'Zero Trust Architecture', 'Penetration Testing', 'ISO 27001 / SOC2 Compliance', 'Incident Response'];
    }
    if (deptName.toLowerCase().includes('product')) {
      return ['Agile & Scrum Methodologies', 'User Journey Mapping', 'Product Analytics & KPIs', 'Feature Roadmapping', 'Stakeholder Alignment'];
    }
    if (deptName.toLowerCase().includes('resource') || deptName.toLowerCase().includes('hr')) {
      return ['Talent Acquisition & Sourcing', 'Compensation & Benefits', 'Conflict Resolution', 'Labor Law & Compliance', 'Performance Review Systems'];
    }
    // Default Engineering
    return ['TypeScript & React Architecture', 'Node.js & RESTful APIs', 'Cloud & Container Deployments', 'Database Optimization', 'Automated CI/CD Pipelines'];
  };

  const roleInfo = getRoleDetails();
  const deptSkills = getDepartmentSkills();

  const slides = [
    {
      badge: 'Welcome to OKGIP',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: `Welcome, ${userName}`,
      subtitle: `${designation} • ${deptName} (${role})`,
      icon: <BrainCircuit className="w-8 h-8 text-emerald-600" />,
      desc: 'The Organizational Knowledge Gap Intelligence Platform (OKGIP) unites skill assessments, automated gap diagnostics, and targeted upskilling into one centralized web platform.',
      bullets: [
        'Real-time competency tracking across 5 proficiency tiers (Novice to Master)',
        'Automated Gap Math: Gap Score = Required Proficiency − Assessed Proficiency',
        `Customized experience dynamically configured for your ${role} access role`
      ]
    },
    {
      badge: roleInfo.roleBadge,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      title: roleInfo.roleTitle,
      subtitle: `Tailored workflows for ${role} permissions`,
      icon: <Target className="w-8 h-8 text-teal-600" />,
      desc: roleInfo.roleDesc,
      bullets: roleInfo.rolePoints
    },
    {
      badge: `${deptName} Blueprint`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Department Competency Matrix',
      subtitle: `Core skill taxonomy for ${deptName}`,
      icon: <Building2 className="w-8 h-8 text-indigo-600" />,
      desc: `Every department in OKGIP has custom-tailored competency benchmarks. Key skills tracked in your department include:`,
      isSkillList: true,
      skills: deptSkills,
      bullets: [
        'Skills are weighted by critical department impact and project urgency',
        'Automatic re-calculation when assessments or trainings are completed',
        'Department heatmaps provide instant visual clarity on team readiness'
      ]
    },
    {
      badge: 'Web Platform Features',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Navigation, AI Assistant & Tools',
      subtitle: 'Everything you need in one unified interface',
      icon: <Zap className="w-8 h-8 text-amber-600" />,
      desc: 'Explore OKGIP’s productivity suite designed for seamless web workflows:',
      bullets: [
        'Floating AI Chat Assistant: Instant intelligent answers in the bottom right corner',
        'Multi-Language & Theme Support: Switch between 6 languages and Dark/Light modes in the top navbar',
        '1-Click Export: Generate executive PDF reports and Excel workbooks from Reports & Gaps',
        'Interactive Leaderboard & Badges: Celebrate learning milestones and top team contributors'
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative overflow-hidden my-auto"
          >
            {/* Top Bar with Brand & Skip Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-emerald-600/30">
                  O
                </div>
                <div>
                  <div className="font-extrabold text-xs tracking-wider text-slate-900 uppercase flex items-center gap-1.5">
                    <span>OKGIP Platform Intro</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {step + 1} of {slides.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Role-tailored onboarding
                  </div>
                </div>
              </div>

              {/* Skip Intro Button */}
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Skip and close intro"
              >
                <span>Skip Tour</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slide Body with Smooth Fade-Slide Motion */}
            <div className="py-6 min-h-[310px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  {/* Slide Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs shrink-0">
                      {slides[step].icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${slides[step].badgeColor}`}>
                        {slides[step].badge}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
                        {slides[step].title}
                      </h2>
                      <p className="text-xs font-bold text-slate-500">
                        {slides[step].subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Slide Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {slides[step].desc}
                  </p>

                  {/* Skills Grid (For Department Slide) */}
                  {slides[step].isSkillList && (
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Key Tracked Competencies for {deptName}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {slides[step].skills?.map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold bg-white text-indigo-900 px-2.5 py-1 rounded-xl border border-indigo-200/80 shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            <span>{sk}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bullets List */}
                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {slides[step].bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="font-medium leading-normal">{b}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls & Step Dots */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {/* Step Dots with Direct Click Navigation */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStep(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      step === idx
                        ? 'w-6 bg-emerald-600'
                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {step < slides.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
