// Comprehensive Mock Data for Knowledge Gap Intelligence Platform

export const mockCurrentUser = {
  id: "usr-101",
  name: "Alex Morgan",
  email: "alex.morgan@enterprise.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "employee", // 'employee' | 'manager' | 'admin'
  jobTitle: "Senior Frontend Engineer",
  department: "Product Engineering",
  manager: "Sarah Jenkins",
  skillReadiness: 84,
  learningHoursThisMonth: 32.5,
  coursesCompleted: 14,
  coursesInProgress: 4,
  pendingAssessments: 2,
};

export const mockSearchItems = [
  // Employees
  {
    id: "emp-1",
    title: "Sarah Jenkins",
    category: "Employees",
    description: "Engineering Director - Cloud Architecture & DevOps Lead",
    matchPercentage: 98,
    details: { email: "sarah.j@enterprise.ai", department: "Engineering", location: "San Francisco, CA", skills: ["Cloud Native", "Kubernetes", "Leadership", "System Architecture"] }
  },
  {
    id: "emp-2",
    title: "David Chen",
    category: "Employees",
    description: "Principal AI Research Scientist - LLM Fine-Tuning",
    matchPercentage: 94,
    details: { email: "david.chen@enterprise.ai", department: "AI Labs", location: "New York, NY", skills: ["PyTorch", "Transformers", "RAG Systems", "MLOps"] }
  },
  {
    id: "emp-3",
    title: "Elena Rostova",
    category: "Employees",
    description: "Lead Product Designer - Design Systems & Accessibility",
    matchPercentage: 91,
    details: { email: "elena.r@enterprise.ai", department: "UX & Design", location: "London, UK", skills: ["Figma", "Design Tokens", "User Research", "WCAG 2.1"] }
  },
  // Skills
  {
    id: "skl-1",
    title: "Kubernetes & Microservices Security",
    category: "Skills",
    description: "Advanced container orchestration, RBAC security policy, and service mesh monitoring.",
    matchPercentage: 96,
    details: { level: "Advanced", employeesProficient: 42, targetBenchmark: 90, gapSeverity: "High" }
  },
  {
    id: "skl-2",
    title: "Enterprise Generative AI Integration",
    category: "Skills",
    description: "Building production RAG architectures, prompt engineering, and LLM safety filters.",
    matchPercentage: 99,
    details: { level: "Expert", employeesProficient: 18, targetBenchmark: 85, gapSeverity: "Critical" }
  },
  {
    id: "skl-3",
    title: "GraphQL & High-Throughput API Gateway",
    category: "Skills",
    description: "Designing federated GraphQL schemas, caching strategies, and distributed tracing.",
    matchPercentage: 88,
    details: { level: "Intermediate", employeesProficient: 67, targetBenchmark: 75, gapSeverity: "Medium" }
  },
  // Courses
  {
    id: "crs-1",
    title: "Enterprise AWS Cloud Architect Certification Mastery",
    category: "Courses",
    description: "Master multi-account AWS architecture, FinOps cost optimization, and Terraform IaC.",
    matchPercentage: 97,
    details: { duration: "16 Hours", difficulty: "Advanced", provider: "Cloud Academy", instructor: "Dr. Marcus Vance", status: "Recommended" }
  },
  {
    id: "crs-2",
    title: "Practical AI & RAG Engineering for Developers",
    category: "Courses",
    description: "Hands-on guide to vector databases (Pinecone, Qdrant), LangChain, and API deployment.",
    matchPercentage: 95,
    details: { duration: "12 Hours", difficulty: "Intermediate", provider: "AI Guild", instructor: "Sophia Lin", status: "In Progress" }
  },
  {
    id: "crs-3",
    title: "Modern React 19 Server Components & Performance",
    category: "Courses",
    description: "Deep dive into hydration optimization, React compiler, and edge rendering.",
    matchPercentage: 92,
    details: { duration: "8 Hours", difficulty: "Intermediate", provider: "Frontend Masters", instructor: "Dan Abramov", status: "Recommended" }
  },
  // Departments
  {
    id: "dept-1",
    title: "Product Engineering",
    category: "Departments",
    description: "Core software engineering, platform infrastructure, and web applications.",
    matchPercentage: 90,
    details: { headCount: 145, skillReadinessScore: 82, topGap: "Kubernetes Security", lead: "Sarah Jenkins" }
  },
  {
    id: "dept-2",
    title: "Data & AI Innovations",
    category: "Departments",
    description: "Data pipelines, predictive modeling, LLM research, and enterprise analytics.",
    matchPercentage: 93,
    details: { headCount: 68, skillReadinessScore: 89, topGap: "MLOps Automated Deployment", lead: "David Chen" }
  },
  // Mentors
  {
    id: "mnt-1",
    title: "Dr. Robert Vance - Staff Cloud Architect",
    category: "Mentors",
    description: "Specializes in multi-cloud resilience, Kubernetes, and engineering career growth.",
    matchPercentage: 96,
    details: { availability: "2 slots open this week", rating: "4.9/5 (48 sessions)", expertise: ["Distributed Systems", "Cloud Governance"] }
  },
  {
    id: "mnt-2",
    title: "Amara Nwosu - Principal UI/UX Architect",
    category: "Mentors",
    description: "Focuses on scalable design systems, frontend performance, and cross-functional leadership.",
    matchPercentage: 91,
    details: { availability: "1 slot open next week", rating: "5.0/5 (32 sessions)", expertise: ["Design Tokens", "React Architecture"] }
  },
  // Reports
  {
    id: "rpt-1",
    title: "Q3 Organizational Skill Gap & AI Readiness Intelligence Report",
    category: "Reports",
    description: "Comprehensive assessment of critical technological vulnerabilities and retraining ROI.",
    matchPercentage: 98,
    details: { generatedDate: "2026-07-28", author: "AI Strategic Analytics", pages: 24, format: "PDF/Executive Brief" }
  }
];

export const mockNotifications = [
  {
    id: "notif-1",
    type: "reminder",
    title: "Assessment Reminder",
    message: "Q3 Senior Developer Skill Benchmark is due in 3 days. Complete now to sync career progress.",
    timestamp: "10 mins ago",
    read: false,
    category: "Assessment reminders"
  },
  {
    id: "notif-2",
    type: "recommendation",
    title: "New AI Course Recommendation",
    message: "AI Match Engine assigned 'Enterprise RAG Engineering' (95% skill fit) based on your gap analysis.",
    timestamp: "1 hour ago",
    read: false,
    category: "New course recommendations"
  },
  {
    id: "notif-3",
    type: "mentor",
    title: "Mentor Session Confirmed",
    message: "Dr. Robert Vance confirmed your 1-on-1 session on 'Cloud System Resilience' for Thursday at 2:00 PM.",
    timestamp: "3 hours ago",
    read: true,
    category: "Mentor session updates"
  },
  {
    id: "notif-4",
    type: "progress",
    title: "Learning Milestone Reached",
    message: "Congrats! You have completed 80% of 'AWS Cloud Architect Certification Mastery'. Keep it up!",
    timestamp: "1 day ago",
    read: true,
    category: "Learning progress"
  },
  {
    id: "notif-5",
    type: "system",
    title: "System Announcement",
    message: "New Q4 Enterprise Upskilling Program launching next week. Check the HR Portal for details.",
    timestamp: "2 days ago",
    read: true,
    category: "System announcements"
  }
];

export const mockRecommendedCourses = [
  {
    id: "rec-101",
    title: "Enterprise Generative AI & RAG Systems Architecture",
    category: "AI & Machine Learning",
    aiMatchScore: 97,
    skillGap: "LLM Orchestration & Vector DBs",
    difficulty: "Advanced",
    duration: "14 Hours",
    progress: 35,
    instructor: "Dr. David Chen",
    rating: 4.9,
    enrolledCount: 1420,
    saved: false,
    description: "Learn how to build production-grade Retrieval-Augmented Generation (RAG) applications using Pinecone, LangChain, and enterprise LLMs with security controls.",
    syllabi: [
      "Module 1: Vector Embeddings & Similarity Search Fundamentals",
      "Module 2: LangChain & LlamaIndex Pipelines in Enterprise",
      "Module 3: Hybrid Search with BM25 + Vector Reranking",
      "Module 4: Guardrails, Prompt Security & Data Loss Prevention"
    ]
  },
  {
    id: "rec-102",
    title: "Kubernetes Microservices Security & Zero Trust",
    category: "Cloud & DevOps",
    aiMatchScore: 92,
    skillGap: "Container RBAC & Istio Mesh",
    difficulty: "Advanced",
    duration: "18 Hours",
    progress: 0,
    instructor: "Sarah Jenkins",
    rating: 4.8,
    enrolledCount: 980,
    saved: true,
    description: "Deep dive into securing containerized microservices architectures with Istio service mesh, Falco runtime protection, and Open Policy Agent (OPA).",
    syllabi: [
      "Module 1: Zero Trust Network Architecture in K8s",
      "Module 2: Istio Mutual TLS & Traffic Management",
      "Module 3: OPA Policy as Code Enforcement",
      "Module 4: Incident Response & Runtime Anomaly Detection"
    ]
  },
  {
    id: "rec-103",
    title: "Modern React 19 State Architecture & Micro-Frontends",
    category: "Frontend Engineering",
    aiMatchScore: 89,
    skillGap: "Module Federation & Performance",
    difficulty: "Intermediate",
    duration: "10 Hours",
    progress: 75,
    instructor: "Amara Nwosu",
    rating: 4.9,
    enrolledCount: 2340,
    saved: false,
    description: "Master React Server Components, Suspense streaming patterns, state management with Context & Zustand, and scalable Webpack Module Federation.",
    syllabi: [
      "Module 1: React 19 Compiler & Server Actions",
      "Module 2: Micro-Frontend Architecture with Vite & Webpack",
      "Module 3: Advanced Hydration & Web Vitals Benchmarking"
    ]
  },
  {
    id: "rec-104",
    title: "GraphQL Federation & API Gateway Scaling",
    category: "Backend Architecture",
    aiMatchScore: 85,
    skillGap: "Distributed Schema Stitching",
    difficulty: "Intermediate",
    duration: "8 Hours",
    progress: 0,
    instructor: "Dr. Marcus Vance",
    rating: 4.7,
    enrolledCount: 760,
    saved: false,
    description: "Build unified API gateways using Apollo Federation 2, query caching strategies, rate limiting, and distributed open-telemetry tracing.",
    syllabi: [
      "Module 1: Schema Federation & Subgraphs Design",
      "Module 2: Caching & Query Deduplication Patterns",
      "Module 3: Distributed Tracing with OpenTelemetry"
    ]
  }
];

export const mockSkillsInventory = [
  { id: "s1", name: "React / Next.js", category: "Frontend", currentLevel: 4, requiredLevel: 5, gap: 1, priority: "Medium" },
  { id: "s2", name: "TypeScript Architecture", category: "Languages", currentLevel: 4, requiredLevel: 5, gap: 1, priority: "Medium" },
  { id: "s3", name: "Kubernetes & Docker", category: "DevOps", currentLevel: 2, requiredLevel: 4, gap: 2, priority: "High" },
  { id: "s4", name: "Generative AI / RAG", category: "AI & ML", currentLevel: 2, requiredLevel: 5, gap: 3, priority: "Critical" },
  { id: "s5", name: "GraphQL & REST APIs", category: "Backend", currentLevel: 4, requiredLevel: 4, gap: 0, priority: "None" },
  { id: "s6", name: "System Design & Security", category: "Architecture", currentLevel: 3, requiredLevel: 5, gap: 2, priority: "High" },
];

export const mockTeamMembers = [
  { id: "t1", name: "Alex Morgan", role: "Senior Frontend Engineer", readiness: 84, gaps: ["Gen AI / RAG", "K8s Security"], status: "On Track", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { id: "t2", name: "Liam Chen", role: "Backend Engineer", readiness: 76, gaps: ["GraphQL Federation", "Microservices"], status: "Needs Support", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: "t3", name: "Sophia Patel", role: "Full Stack Engineer", readiness: 92, gaps: ["Cloud FinOps"], status: "Exceeding", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: "t4", name: "Marcus Brody", role: "DevOps Engineer", readiness: 88, gaps: ["Service Mesh Security"], status: "On Track", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
  { id: "t5", name: "Jessica Taylor", role: "Data Engineer", readiness: 69, gaps: ["MLOps Pipeline", "Vector DBs"], status: "Needs Support", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
];

export const mockUsers = [
  { id: "u1", name: "Alex Morgan", email: "alex.morgan@enterprise.ai", role: "Employee", department: "Product Engineering", status: "Active" },
  { id: "u2", name: "Sarah Jenkins", email: "sarah.j@enterprise.ai", role: "Manager", department: "Product Engineering", status: "Active" },
  { id: "u3", name: "David Chen", email: "david.chen@enterprise.ai", role: "Admin", department: "Data & AI Innovations", status: "Active" },
  { id: "u4", name: "Elena Rostova", email: "elena.r@enterprise.ai", role: "Employee", department: "UX & Design", status: "Active" },
  { id: "u5", name: "Robert Vance", email: "robert.vance@enterprise.ai", role: "Manager", department: "Cloud Infrastructure", status: "Active" },
  { id: "u6", name: "Amara Nwosu", email: "amara.nwosu@enterprise.ai", role: "Employee", department: "UX & Design", status: "Inactive" },
];

export const mockDepartments = [
  { id: "d1", name: "Product Engineering", membersCount: 145, readiness: 82, topSkill: "React / Node.js", criticalGap: "Kubernetes Security" },
  { id: "d2", name: "Data & AI Innovations", membersCount: 68, readiness: 89, topSkill: "Python / PyTorch", criticalGap: "Automated MLOps" },
  { id: "d3", name: "Cloud & DevOps Infrastructure", membersCount: 52, readiness: 91, topSkill: "AWS / Terraform", criticalGap: "Zero Trust Policy" },
  { id: "d4", name: "UX & Product Design", membersCount: 34, readiness: 86, topSkill: "Design Systems", criticalGap: "Accessibility Automation" },
  { id: "d5", name: "Cybersecurity & Governance", membersCount: 29, readiness: 94, topSkill: "SIEM & SOC", criticalGap: "AI Threat Modeling" },
];

export const mockJobRoles = [
  { id: "r1", title: "Senior Frontend Engineer", department: "Product Engineering", requiredSkillCount: 8, benchmarkScore: 85 },
  { id: "r2", title: "Cloud Security Architect", department: "Cloud Infrastructure", requiredSkillCount: 10, benchmarkScore: 90 },
  { id: "r3", title: "AI Solutions Engineer", department: "Data & AI Innovations", requiredSkillCount: 9, benchmarkScore: 88 },
  { id: "r4", title: "Full Stack Team Lead", department: "Product Engineering", requiredSkillCount: 12, benchmarkScore: 92 },
];
