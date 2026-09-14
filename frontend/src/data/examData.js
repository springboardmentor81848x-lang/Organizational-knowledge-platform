export const JOB_ROLES = [
  { id: 'backend', label: 'Backend Engineer (Java/Spring Boot)', icon: '⚙️', requiredSkills: ['Java Spring Boot', 'SQL & PostgreSQL', 'Docker & Kubernetes', 'Microservices', 'REST APIs'] },
  { id: 'frontend', label: 'Frontend Developer (React.js)', icon: '🎨', requiredSkills: ['React.js', 'TypeScript', 'Node.js', 'UX Research', 'HTML5/CSS3'] },
  { id: 'data', label: 'Data Analyst & ML Specialist', icon: '📊', requiredSkills: ['Python', 'SQL & PostgreSQL', 'Tableau / Power BI', 'Machine Learning', 'Data Analysis'] },
  { id: 'devops', label: 'DevOps & Cloud Architect', icon: '☁️', requiredSkills: ['AWS Cloud', 'Docker & Kubernetes', 'Python', 'Node.js', 'Cybersecurity'] },
  { id: 'security', label: 'Security & Compliance Analyst', icon: '🛡️', requiredSkills: ['Cybersecurity', 'Python', 'SQL & PostgreSQL', 'Security Audit'] },
  { id: 'product', label: 'Product Manager & Strategy', icon: '🚀', requiredSkills: ['Project Management', 'SQL & PostgreSQL', 'Data Analysis', 'Agile'] },
];

export const SKILL_COURSES = [
  { id: 1, title: 'Advanced Cloud Architectures (AWS + Azure)', provider: 'Internal Engineering', duration: '12h', level: 'Advanced', category: 'DevOps', description: 'Master cloud infrastructure design & microservices scalability', rating: 4.8, enrolled: 142, match_score: 98 },
  { id: 2, title: 'Generative AI for Business Professionals', provider: 'Coursera Enterprise', duration: '4h', level: 'Beginner', category: 'AI/ML', description: 'Practical GenAI for workplace automation & prompt engineering', rating: 4.9, enrolled: 389, match_score: 92 },
  { id: 3, title: 'Advanced Data Visualization with Tableau', provider: 'Udemy Business', duration: '8h', level: 'Mid', category: 'Analytics', description: 'Create stunning executive dashboards & analytical reporting', rating: 4.5, enrolled: 67, match_score: 85 },
  { id: 4, title: 'Predictive Analytics with Python & Scikit-learn', provider: 'LinkedIn Learning', duration: '10h', level: 'Advanced', category: 'AI/ML', description: 'Build predictive ML models and regression algorithms', rating: 4.7, enrolled: 44, match_score: 88 },
  { id: 5, title: 'Cybersecurity & Compliance Fundamentals 2026', provider: 'Internal HR', duration: '6h', level: 'Beginner', category: 'Security', description: 'Essential security training, OWASP top 10 & data privacy', rating: 4.3, enrolled: 450, match_score: 76 },
  { id: 6, title: 'React.js Advanced Design Patterns & Performance', provider: 'Frontend Masters', duration: '8h', level: 'Advanced', category: 'Frontend', description: 'Custom hooks, state optimization & micro-frontend architecture', rating: 4.8, enrolled: 156, match_score: 90 },
  { id: 7, title: 'Java Spring Boot 3 Security & Microservices', provider: 'Internal Academy', duration: '14h', level: 'Advanced', category: 'Backend', description: 'JWT auth, Spring Cloud API gateway, and JPA persistence', rating: 4.9, enrolled: 210, match_score: 95 },
];

export const ROLE_EXAMS = {
  backend: {
    title: 'Java Spring Boot & Backend Systems Evaluation',
    skills: ['Java Spring Boot', 'SQL & PostgreSQL', 'Docker & Kubernetes', 'REST APIs'],
    questions: [
      { id: 1, skill: 'Java Spring Boot', question: 'Which annotation in Spring Boot is used to mark a class as a REST controller that combines @Controller and @ResponseBody?', options: ['@Service', '@RestController', '@Component', '@Repository'], correct: 1 },
      { id: 2, skill: 'Java Spring Boot', question: 'What is the purpose of Spring Security JwtAuthenticationFilter in a stateless application?', options: ['To store user session in HTTP session', 'To intercept HTTP requests and validate JWT bearer tokens', 'To encrypt database password', 'To serve static HTML pages'], correct: 1 },
      { id: 3, skill: 'SQL & PostgreSQL', question: 'In PostgreSQL, which join type returns all records from the left table and matching records from the right table?', options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'], correct: 2 },
      { id: 4, skill: 'Docker & Kubernetes', question: 'What is the primary Kubernetes resource used to deploy a set of identical pods and maintain replica count?', options: ['Deployment', 'Ingress', 'ConfigMap', 'Volume'], correct: 0 },
      { id: 5, skill: 'REST APIs', question: 'Which HTTP method should be idempotent and used to replace an entire resource entity?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correct: 1 },
    ],
  },
  frontend: {
    title: 'React.js & Frontend Architecture Evaluation',
    skills: ['React.js', 'TypeScript', 'Node.js', 'UX Research'],
    questions: [
      { id: 1, skill: 'React.js', question: 'Which hook in React is used to execute side effects like fetching data or subscribing to events?', options: ['useState', 'useMemo', 'useEffect', 'useCallback'], correct: 2 },
      { id: 2, skill: 'React.js', question: 'What is the benefit of using React.memo or useMemo in performance optimization?', options: ['Auto-saves component to localStorage', 'Prevents unnecessary re-renders by memoizing computed values/components', 'Converts JavaScript to WebAssembly', 'Handles server-side routing'], correct: 1 },
      { id: 3, skill: 'TypeScript', question: 'How do you specify an optional property in a TypeScript interface?', options: ['property: optional', 'property?: type', 'property!: type', 'optional property: type'], correct: 1 },
      { id: 4, skill: 'Node.js', question: 'What mechanism does Node.js use to achieve non-blocking I/O operations?', options: ['Multithreading', 'Event Loop and Async I/O', 'Synchronous blocking calls', 'Virtual Machines'], correct: 1 },
      { id: 5, skill: 'UX Research', question: 'What usability testing metric measures the percentage of users who successfully complete a defined task?', options: ['Net Promoter Score (NPS)', 'Task Completion Rate', 'Click-Through Rate (CTR)', 'Bounce Rate'], correct: 1 },
    ],
  },
  data: {
    title: 'Data Science & Analytics Evaluation',
    skills: ['Python', 'SQL & PostgreSQL', 'Machine Learning', 'Data Analysis'],
    questions: [
      { id: 1, skill: 'Python', question: 'Which Python library is primarily used for data manipulation and tabular data analysis?', options: ['NumPy', 'Pandas', 'Matplotlib', 'SciPy'], correct: 1 },
      { id: 2, skill: 'Machine Learning', question: 'What evaluation metric is best suited for imbalanced classification tasks?', options: ['Accuracy', 'F1-Score / AUC-ROC', 'Mean Squared Error', 'R-Squared'], correct: 1 },
    ],
  },
  devops: {
    title: 'DevOps & Cloud Architecture Evaluation',
    skills: ['AWS Cloud', 'Docker & Kubernetes', 'Cybersecurity'],
    questions: [
      { id: 1, skill: 'AWS Cloud', question: 'Which AWS service provides resizable compute capacity in the cloud?', options: ['S3', 'EC2', 'RDS', 'Lambda'], correct: 1 },
    ],
  },
  security: {
    title: 'Security & Compliance Evaluation',
    skills: ['Cybersecurity', 'Python', 'SQL & PostgreSQL'],
    questions: [
      { id: 1, skill: 'Cybersecurity', question: 'Which type of attack involves injecting malicious SQL queries into database entry fields?', options: ['Cross-Site Scripting (XSS)', 'SQL Injection', 'Man-in-the-Middle', 'DDoS'], correct: 1 },
    ],
  },
  product: {
    title: 'Product Strategy & Management Evaluation',
    skills: ['Project Management', 'Data Analysis'],
    questions: [
      { id: 1, skill: 'Project Management', question: 'In Agile Scrum, what is the fixed timeperiod during which a team works to complete targeted work items?', options: ['Sprint', 'Backlog', 'Epic', 'Retrospective'], correct: 0 },
    ],
  },
};
