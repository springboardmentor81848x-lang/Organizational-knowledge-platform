package com.okip.service.quiz;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import com.okip.dto.assessment.QuizDTO;
import com.okip.dto.assessment.QuizQuestionDTO;
import com.okip.exception.BadRequestException;

@Service
public class QuizBankService {

    public static class QuizEvaluationResult {
        private final int score;
        private final String proficiency;
        private final int correctCount;
        private final int totalQuestions;

        public QuizEvaluationResult(int score, String proficiency, int correctCount, int totalQuestions) {
            this.score = score;
            this.proficiency = proficiency;
            this.correctCount = correctCount;
            this.totalQuestions = totalQuestions;
        }

        public int getScore() { return score; }
        public String getProficiency() { return proficiency; }
        public int getCorrectCount() { return correctCount; }
        public int getTotalQuestions() { return totalQuestions; }
    }

    public static class IssuedQuiz {
        private final Long employeeId;
        private final Long skillId;
        private final Set<String> questionIds;
        private final Map<String, Integer> answerKeys;
        private final LocalDateTime issuedAt;

        public IssuedQuiz(Long employeeId, Long skillId, Set<String> questionIds, Map<String, Integer> answerKeys) {
            this.employeeId = employeeId;
            this.skillId = skillId;
            this.questionIds = Collections.unmodifiableSet(questionIds);
            this.answerKeys = Collections.unmodifiableMap(answerKeys);
            this.issuedAt = LocalDateTime.now();
        }

        public Long getEmployeeId() { return employeeId; }
        public Long getSkillId() { return skillId; }
        public Set<String> getQuestionIds() { return questionIds; }
        public Map<String, Integer> getAnswerKeys() { return answerKeys; }
        public LocalDateTime getIssuedAt() { return issuedAt; }
    }

    private final Map<String, List<QuizQuestion>> questionBank = new HashMap<>();
    private final Map<String, IssuedQuiz> issuedQuizzes = new ConcurrentHashMap<>();

    public QuizBankService() {
        initQuestionBank();
    }

    public QuizDTO generateQuizForSkill(Long skillId, String skillName, String skillCategory) {
        return generateQuizForSkill(0L, skillId, skillName, skillCategory);
    }

    public QuizDTO generateQuizForSkill(Long employeeId, Long skillId, String skillName, String skillCategory) {
        String cat = normalizeCategory(skillName, skillCategory);
        List<QuizQuestion> allCategoryQuestions = questionBank.getOrDefault(cat, questionBank.get("GENERAL"));

        List<QuizQuestion> beginner = allCategoryQuestions.stream()
                .filter(q -> "BEGINNER".equalsIgnoreCase(q.getDifficulty()))
                .collect(Collectors.toList());
        List<QuizQuestion> intermediate = allCategoryQuestions.stream()
                .filter(q -> "INTERMEDIATE".equalsIgnoreCase(q.getDifficulty()))
                .collect(Collectors.toList());
        List<QuizQuestion> advanced = allCategoryQuestions.stream()
                .filter(q -> "ADVANCED".equalsIgnoreCase(q.getDifficulty()))
                .collect(Collectors.toList());

        Collections.shuffle(beginner);
        Collections.shuffle(intermediate);
        Collections.shuffle(advanced);

        List<QuizQuestion> selected = new ArrayList<>();
        selected.addAll(beginner.stream().limit(8).collect(Collectors.toList()));
        selected.addAll(intermediate.stream().limit(9).collect(Collectors.toList()));
        selected.addAll(advanced.stream().limit(8).collect(Collectors.toList()));

        Collections.shuffle(selected);

        Set<String> issuedQIds = new HashSet<>();
        Map<String, Integer> answerKeys = new HashMap<>();

        for (QuizQuestion q : selected) {
            issuedQIds.add(q.getId());
            answerKeys.put(q.getId(), q.getCorrectOptionIndex());
        }

        String sessionKey = (employeeId != null ? employeeId : 0L) + "_" + skillId;
        // Atomic replacement of previous active session for this employee & skill
        issuedQuizzes.put(sessionKey, new IssuedQuiz(employeeId, skillId, issuedQIds, answerKeys));

        List<QuizQuestionDTO> dtoList = selected.stream()
                .map(q -> new QuizQuestionDTO(q.getId(), q.getQuestion(), q.getDifficulty(), q.getOptions()))
                .collect(Collectors.toList());

        return new QuizDTO(skillId, skillName, cat, dtoList.size(), dtoList);
    }

    public QuizEvaluationResult evaluateAnswers(Long employeeId, Long skillId, String skillName, String skillCategory, Map<String, Integer> userAnswers) {
        if (userAnswers == null || userAnswers.isEmpty()) {
            throw new BadRequestException("Self-assessment requires submitting answers for all 25 issued quiz questions.");
        }

        String sessionKey = (employeeId != null ? employeeId : 0L) + "_" + skillId;
        IssuedQuiz issuedQuiz = issuedQuizzes.get(sessionKey);

        if (issuedQuiz == null) {
            throw new BadRequestException("Quiz session expired or not found. Please start a new assessment.");
        }

        // Strict 25 questions count validation
        if (userAnswers.size() != 25) {
            throw new BadRequestException("Exactly 25 answered questions are required for self-assessment. Received: " + userAnswers.size());
        }

        // Validate that submitted question IDs match the exact 25 issued question IDs
        Set<String> submittedIds = userAnswers.keySet();
        if (!submittedIds.equals(issuedQuiz.getQuestionIds())) {
            throw new BadRequestException("Submitted question IDs do not match the exact 25 questions issued for this assessment.");
        }

        int correctCount = 0;

        for (Map.Entry<String, Integer> entry : userAnswers.entrySet()) {
            String qId = entry.getKey();
            Integer selectedIndex = entry.getValue();

            if (selectedIndex == null || selectedIndex < 0 || selectedIndex > 3) {
                throw new BadRequestException("Invalid option selection index for question ID: " + qId);
            }

            Integer correctIndex = issuedQuiz.getAnswerKeys().get(qId);
            if (correctIndex != null && selectedIndex.equals(correctIndex)) {
                correctCount++;
            }
        }

        // Clear issued quiz session after single authoritative evaluation
        issuedQuizzes.remove(sessionKey);

        int score = (int) Math.round(((double) correctCount / 25.0) * 100.0);
        String proficiency;
        if (score >= 85) {
            proficiency = "EXPERT";
        } else if (score >= 70) {
            proficiency = "ADVANCED";
        } else if (score >= 40) {
            proficiency = "INTERMEDIATE";
        } else {
            proficiency = "BEGINNER";
        }

        return new QuizEvaluationResult(score, proficiency, correctCount, 25);
    }

    public QuizEvaluationResult evaluateAgainstPoolForTesting(String skillName, String skillCategory, Map<String, Integer> userAnswers) {
        if (userAnswers == null || userAnswers.size() != 25) {
            throw new BadRequestException("Exactly 25 answered questions are required for self-assessment. Received: " + (userAnswers != null ? userAnswers.size() : 0));
        }

        String cat = normalizeCategory(skillName, skillCategory);
        List<QuizQuestion> allCategoryQuestions = questionBank.getOrDefault(cat, questionBank.get("GENERAL"));

        Map<String, QuizQuestion> questionMap = allCategoryQuestions.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, q -> q, (a, b) -> a));

        int correctCount = 0;
        for (Map.Entry<String, Integer> entry : userAnswers.entrySet()) {
            String qId = entry.getKey();
            Integer selectedIndex = entry.getValue();

            if (selectedIndex == null || selectedIndex < 0 || selectedIndex > 3) {
                throw new BadRequestException("Invalid option selection index for question ID: " + qId);
            }

            QuizQuestion question = questionMap.get(qId);
            if (question == null) {
                throw new BadRequestException("Unknown question ID submitted: " + qId);
            }

            if (selectedIndex.equals(question.getCorrectOptionIndex())) {
                correctCount++;
            }
        }

        int score = (int) Math.round(((double) correctCount / 25.0) * 100.0);
        String proficiency;
        if (score >= 85) {
            proficiency = "EXPERT";
        } else if (score >= 70) {
            proficiency = "ADVANCED";
        } else if (score >= 40) {
            proficiency = "INTERMEDIATE";
        } else {
            proficiency = "BEGINNER";
        }

        return new QuizEvaluationResult(score, proficiency, correctCount, 25);
    }

    private String normalizeCategory(String skillName, String skillCategory) {
        String name = (skillName != null ? skillName : "").toLowerCase();
        String cat = (skillCategory != null ? skillCategory : "").toUpperCase();

        if (name.contains("java") || name.contains("spring") || cat.contains("BACKEND")) return "JAVA_SPRING";
        if (name.contains("react") || name.contains("script") || name.contains("front") || cat.contains("FRONTEND")) return "REACT_FRONTEND";
        if (name.contains("sql") || name.contains("postgres") || name.contains("data") || cat.contains("DATABASE")) return "DATABASE_SQL";
        if (name.contains("docker") || name.contains("devops") || name.contains("cloud") || cat.contains("DEVOPS")) return "DEVOPS_CONTAINER";
        if (name.contains("ai") || name.contains("llm") || name.contains("ml") || cat.contains("AI")) return "AI_LLM_INTELLIGENCE";

        return "GENERAL";
    }

    private void initQuestionBank() {
        // 1. JAVA_SPRING (25 questions: 8 Beginner, 9 Intermediate, 8 Advanced)
        List<QuizQuestion> javaList = new ArrayList<>();
        // Beginner (8)
        javaList.add(new QuizQuestion("J_B1", "Which component of Java is responsible for executing compiled bytecode?", "BEGINNER", Arrays.asList("JDK", "JRE", "JVM", "JIT Compiler"), 2));
        javaList.add(new QuizQuestion("J_B2", "What is the difference between '==' and '.equals()' when comparing String objects?", "BEGINNER", Arrays.asList("'==' compares memory references, while '.equals()' compares value equality", "Both compare memory references", "'==' compares values, while '.equals()' compares memory references", "There is no difference in Java"), 0));
        javaList.add(new QuizQuestion("J_B3", "What is the default bean scope in Spring Framework?", "BEGINNER", Arrays.asList("Prototype", "Request", "Singleton", "Session"), 2));
        javaList.add(new QuizQuestion("J_B4", "Which Java 8 feature prevents NullPointerException by wrapping nullable values?", "BEGINNER", Arrays.asList("Stream", "Optional", "CompletableFuture", "Lambda"), 1));
        javaList.add(new QuizQuestion("J_B5", "Which Java access modifier restricts visibility strictly to the declaring class?", "BEGINNER", Arrays.asList("protected", "package-private", "private", "public"), 2));
        javaList.add(new QuizQuestion("J_B6", "What does the @SpringBootApplication annotation combine?", "BEGINNER", Arrays.asList("@Configuration, @EnableAutoConfiguration, @ComponentScan", "@Entity, @Repository, @Service", "@Controller, @ResponseBody, @RequestMapping", "@Bean, @Autowired, @Value"), 0));
        javaList.add(new QuizQuestion("J_B7", "Which exception type in Java must be either caught or declared in the method signature?", "BEGINNER", Arrays.asList("Unchecked Exception (RuntimeException)", "Checked Exception (Exception)", "Error", "NullPointerException"), 1));
        javaList.add(new QuizQuestion("J_B8", "Why is String immutable in Java?", "BEGINNER", Arrays.asList("For security, thread safety, and String Pool memory optimization", "To prevent subclassing", "Because Java does not support pointers", "It is mutable using StringWriter"), 0));

        // Intermediate (9)
        javaList.add(new QuizQuestion("J_I1", "How does Java 8+ HashMap handle bucket collisions when bucket size exceeds TREEIFY_THRESHOLD (8)?", "INTERMEDIATE", Arrays.asList("Converts linked list to Red-Black Tree", "Doubles array capacity immediately", "Throws ConcurrentModificationException", "Uses linear probing"), 0));
        javaList.add(new QuizQuestion("J_I2", "In Spring Data JPA, what is the primary benefit of using @EntityGraph over JOIN FETCH?", "INTERMEDIATE", Arrays.asList("Allows dynamic graph selection without modifying JPQL query strings", "Bypasses second-level cache", "Disables lazy loading completely", "Prevents primary key generation"), 0));
        javaList.add(new QuizQuestion("J_I3", "What occurs when @Transactional(propagation = Propagation.REQUIRES_NEW) is invoked from an active transaction?", "INTERMEDIATE", Arrays.asList("Suspends outer transaction and executes in a new independent transaction", "Joins existing outer transaction", "Throws TransactionRequiredException", "Rolls back outer transaction immediately"), 0));
        javaList.add(new QuizQuestion("J_I4", "Which HTTP status code is most appropriate for a REST API when request validation fails?", "INTERMEDIATE", Arrays.asList("400 Bad Request", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"), 0));
        javaList.add(new QuizQuestion("J_I5", "How does Spring resolve circular dependencies between singleton beans?", "INTERMEDIATE", Arrays.asList("Using three-level cache (singletonFactories, earlySingletonObjects, singletonObjects)", "By throwing CircularDependencyException always", "Using thread-local locks", "It does not support circular dependencies"), 0));
        javaList.add(new QuizQuestion("J_I6", "What is the difference between synchronized block and ReentrantLock in Java concurrency?", "INTERMEDIATE", Arrays.asList("ReentrantLock offers tryLock(), fairness policy, and interruptible lock waits", "synchronized block is faster in all scenarios", "ReentrantLock cannot be unlocked", "synchronized supports multiple condition variables"), 0));
        javaList.add(new QuizQuestion("J_I7", "Why is Constructor Injection preferred over Field Injection (@Autowired on private fields)?", "INTERMEDIATE", Arrays.asList("Enables immutability (final fields), easier unit testing, and prevents NPEs", "Field injection is deprecated in Spring 6", "Constructor injection is faster at runtime", "Field injection cannot inject interfaces"), 0));
        javaList.add(new QuizQuestion("J_I8", "What is the purpose of Spring Security SecurityContextHolder?", "INTERMEDIATE", Arrays.asList("Stores security context and authenticated principal details per thread (ThreadLocal)", "Encodes passwords using BCrypt", "Manages JWT expiration tokens", "Stores user permissions in database cache"), 0));
        javaList.add(new QuizQuestion("J_I9", "In Java Streams, what is the key difference between map() and flatMap()?", "INTERMEDIATE", Arrays.asList("flatMap() flattens nested streams into a single stream, whereas map() transforms elements 1-to-1", "map() is terminal while flatMap() is intermediate", "flatMap() works only on numbers", "map() executes asynchronously"), 0));

        // Advanced (8)
        javaList.add(new QuizQuestion("J_A1", "How do Virtual Threads (Project Loom) in Java 21 differ from platform threads?", "ADVANCED", Arrays.asList("Virtual threads are lightweight userspace threads managed by JVM carrier thread pool", "Virtual threads bypass JVM garbage collector", "Virtual threads run directly on dedicated OS kernels", "Virtual threads do not support synchronized blocks"), 0));
        javaList.add(new QuizQuestion("J_A2", "In Spring AOP, when is CGLIB proxying used instead of JDK Dynamic Proxies?", "ADVANCED", Arrays.asList("When target class does not implement any interface", "When target class is final", "When target class is annotated with @Service", "When method is static"), 0));
        javaList.add(new QuizQuestion("J_A3", "What happens under Java Memory Model when a variable is declared 'volatile'?", "ADVANCED", Arrays.asList("Establishes happens-before relationship ensuring thread visibility and preventing instruction reordering", "Makes object operations atomic", "Locks the object memory block", "Allocates variable in off-heap memory"), 0));
        javaList.add(new QuizQuestion("J_A4", "How does Optimistic Locking (@Version) in JPA protect against concurrent updates?", "ADVANCED", Arrays.asList("Verifies version column during UPDATE WHERE id=? AND version=?; throws OptimisticLockException on mismatch", "Locks database row at SELECT phase", "Prevents read operations during update", "Retries failed transactions automatically"), 0));
        javaList.add(new QuizQuestion("J_A5", "In microservices architecture, why is the Saga Pattern preferred over 2PC (Two-Phase Commit)?", "ADVANCED", Arrays.asList("Avoids synchronous distributed locks and long database transaction holds across network boundaries", "Guarantees immediate ACID compliance", "Requires zero compensating transactions", "Only works with SQL databases"), 0));
        javaList.add(new QuizQuestion("J_A6", "How does ZGC (Z Garbage Collector) achieve sub-millisecond max pause times in large Java heaps?", "ADVANCED", Arrays.asList("Uses colored pointers and load barriers to perform concurrent compaction", "Disables mark phase", "Runs only when application is idle", "Uses stop-the-world pauses for full heap sweep"), 0));
        javaList.add(new QuizQuestion("J_A7", "What is the purpose of Spring @ConditionalOnProperty annotation?", "ADVANCED", Arrays.asList("Conditionally registers a bean based on presence or value of an environment property", "Validates bean properties at startup", "Injects configuration values into final fields", "Encrypts sensitive property values"), 0));
        javaList.add(new QuizQuestion("J_A8", "In CompletableFuture, what is the difference between exceptionally() and handle()?", "ADVANCED", Arrays.asList("handle() processes both successful result and exception, while exceptionally() triggers only on failure", "exceptionally() rethrows exception always", "handle() runs asynchronously on FJP", "There is no functional difference"), 0));

        questionBank.put("JAVA_SPRING", javaList);

        // 2. REACT_FRONTEND (25 questions)
        List<QuizQuestion> reactList = new ArrayList<>();
        // Beginner (8)
        reactList.add(new QuizQuestion("R_B1", "What is JSX in React development?", "BEGINNER", Arrays.asList("Syntax extension to JavaScript that allows writing HTML-like markup in JS code", "A new database querying language", "A CSS preprocessor", "A build tool like Webpack"), 0));
        reactList.add(new QuizQuestion("R_B2", "What is the primary function of the useState hook in React?", "BEGINNER", Arrays.asList("Declares state variables in functional components", "Fetches data from REST APIs", "Navigates between pages", "Directly mutates the DOM"), 0));
        reactList.add(new QuizQuestion("R_B3", "Why does React require a unique 'key' prop when rendering lists of elements?", "BEGINNER", Arrays.asList("Helps React identify which items have changed, been added, or removed during diffing", "Styles the list items", "Enables CSS animation", "Required by TypeScript compiler"), 0));
        reactList.add(new QuizQuestion("R_B4", "How is data passed from a parent component to a child component in React?", "BEGINNER", Arrays.asList("Through props", "Through Redux actions", "Through local storage", "Through URL params"), 0));
        reactList.add(new QuizQuestion("R_B5", "What is the Virtual DOM in React?", "BEGINNER", Arrays.asList("In-memory lightweight representation of real DOM elements for fast diffing", "Browser's native DOM tree", "A server-side database engine", "A CSS layout engine"), 0));
        reactList.add(new QuizQuestion("R_B6", "What is a controlled component in React forms?", "BEGINNER", Arrays.asList("Form element whose value is controlled by React state", "Form element managed by browser DOM natively", "Form element without event listeners", "Form element requiring server validation"), 0));
        reactList.add(new QuizQuestion("R_B7", "When does the cleanup function returned by useEffect execute?", "BEGINNER", Arrays.asList("Before component unmounts and before effect re-runs on dependency change", "Immediately when component mounts", "Only when an error occurs", "After every DOM render pass"), 0));
        reactList.add(new QuizQuestion("R_B8", "How do you run a useEffect hook strictly once after component mounts?", "BEGINNER", Arrays.asList("Pass an empty dependency array []", "Omit dependency array", "Pass null as dependency", "Call useEffect inside useState"), 0));

        // Intermediate (9)
        reactList.add(new QuizQuestion("R_I1", "What is the key difference between useCallback and useMemo hooks?", "INTERMEDIATE", Arrays.asList("useCallback memoizes callback function instances, useMemo memoizes computed values", "useCallback is for async operations", "useMemo cannot take dependency arrays", "They are identical in functionality"), 0));
        reactList.add(new QuizQuestion("R_I2", "What problem does React Context API solve?", "INTERMEDIATE", Arrays.asList("Avoids props drilling by sharing global state across component tree depth", "Replaces REST API network calls", "Speeds up bundle compilation", "Enables offline caching"), 0));
        reactList.add(new QuizQuestion("R_I3", "Why should you not mutate React state variables directly (e.g. state.count = 5)?", "INTERMEDIATE", Arrays.asList("Direct mutation does not trigger component re-render reconciliation", "Causes JavaScript syntax error", "Breaks TypeScript compiler", "Deletes state from memory"), 0));
        reactList.add(new QuizQuestion("R_I4", "What is the purpose of useRef hook in React?", "INTERMEDIATE", Arrays.asList("Persists mutable reference across renders without triggering re-render when modified", "Triggers immediate component render", "Creates global application state", "Validates component props"), 0));
        reactList.add(new QuizQuestion("R_I5", "How does React.memo optimize component rendering?", "INTERMEDIATE", Arrays.asList("Prevents component re-renders if props have not changed (shallow comparison)", "Caches HTTP responses", "Converts component to server component", "Compiles component to WebAssembly"), 0));
        reactList.add(new QuizQuestion("R_I6", "What is the purpose of React 18 useTransition hook?", "INTERMEDIATE", Arrays.asList("Marks state updates as non-urgent transitions to keep UI responsive during heavy renders", "Animates CSS transitions", "Handles page route transitions", "Manages API request retries"), 0));
        reactList.add(new QuizQuestion("R_I7", "What is the Rules of Hooks constraint in React?", "INTERMEDIATE", Arrays.asList("Call hooks only at the top level of React functions, never inside loops/conditions", "Call hooks inside event handlers only", "Declare hooks in external CSS files", "Hooks can only be called in class components"), 0));
        reactList.add(new QuizQuestion("R_I8", "How does React SyntheticEvent system handle browser event delegation?", "INTERMEDIATE", Arrays.asList("Attaches single event listener at root document level and delegates events for efficiency", "Attaches native listeners to every DOM element", "Runs event handlers on web workers", "Disables browser event bubbling"), 0));
        reactList.add(new QuizQuestion("R_I9", "What is the main advantage of custom React hooks?", "INTERMEDIATE", Arrays.asList("Extracts and reuses stateful logic across multiple components cleanly", "Replaces CSS stylesheets", "Enables server-side database access", "Speeds up initial bundle download"), 0));

        // Advanced (8)
        reactList.add(new QuizQuestion("R_A1", "How do React.lazy and Suspense work together for code splitting?", "ADVANCED", Arrays.asList("React.lazy dynamic imports component bundle, Suspense renders fallback UI until loaded", "React.lazy preloads all application routes at startup", "Suspense handles server database crashes", "React.lazy replaces Webpack bundler"), 0));
        reactList.add(new QuizQuestion("R_A2", "What causes hydration mismatch errors in Server-Side Rendered (SSR) React apps?", "ADVANCED", Arrays.asList("Rendered HTML from server differs from initial Virtual DOM generated on client", "API key missing in environment variables", "Bundle size exceeds 500KB limit", "Database connection pool timeout"), 0));
        reactList.add(new QuizQuestion("R_A3", "How does React 18 Concurrent Engine prioritize render updates?", "ADVANCED", Arrays.asList("Uses priority lanes to interrupt long-running background renders for urgent user input", "Processes updates strictly FIFO", "Executes renders synchronously on main thread", "Offloads all renders to GPU"), 0));
        reactList.add(new QuizQuestion("R_A4", "Why does uncontrolled form handling (e.g. React Hook Form) perform better in large forms than controlled state?", "ADVANCED", Arrays.asList("Avoids re-rendering entire form component tree on every keystroke by querying DOM ref", "Uses native C++ form bindings", "Bypasses browser event loop", "Stores input data directly in Redis"), 0));
        reactList.add(new QuizQuestion("R_A5", "In Module Federation micro-frontends, how are shared React instances managed?", "ADVANCED", Arrays.asList("Configures single singleton runtime instance across remote entry containers", "Duplicates React runtime inside iframe", "Bundles React into static HTML strings", "Converts micro-frontends to Web Components"), 0));
        reactList.add(new QuizQuestion("R_A6", "What is the primary architectural purpose of an Error Boundary component in React?", "ADVANCED", Arrays.asList("Catches JavaScript errors in child component tree, logs errors, and displays fallback UI", "Catches network 500 errors automatically", "Prevents syntax errors during build", "Handles unhandled promise rejections globally"), 0));
        reactList.add(new QuizQuestion("R_A7", "How does Zustand or Redux Toolkit avoid Context API re-render overhead?", "ADVANCED", Arrays.asList("Uses targeted selector subscriptions so components re-render only when selected slice changes", "Disables React reconciliation engine", "Stores state in browser cookie", "Uses iframe postMessage communication"), 0));
        reactList.add(new QuizQuestion("R_A8", "What is focus trapping in accessible modal dialogs (a11y)?", "ADVANCED", Arrays.asList("Ensures Tab key navigation cycles strictly within modal interactive elements while active", "Disables keyboard navigation", "Hides mouse cursor when modal opens", "Prevents modal from closing on Escape key"), 0));

        questionBank.put("REACT_FRONTEND", reactList);

        // 3. DATABASE_SQL (25 questions)
        List<QuizQuestion> sqlList = new ArrayList<>();
        // Beginner (8)
        sqlList.add(new QuizQuestion("S_B1", "What is the main difference between WHERE and HAVING clauses in SQL?", "BEGINNER", Arrays.asList("WHERE filters individual rows before grouping, HAVING filters aggregated groups", "WHERE works only on numbers", "HAVING cannot use comparison operators", "There is no difference in execution"), 0));
        sqlList.add(new QuizQuestion("S_B2", "Which SQL JOIN returns all rows from the left table and matched rows from the right table?", "BEGINNER", Arrays.asList("LEFT JOIN (or LEFT OUTER JOIN)", "INNER JOIN", "RIGHT JOIN", "FULL OUTER JOIN"), 0));
        sqlList.add(new QuizQuestion("S_B3", "What is the purpose of a PRIMARY KEY constraint in a SQL database?", "BEGINNER", Arrays.asList("Uniquely identifies each record in a table and enforces non-nullability", "Encrypts table data on disk", "Speeds up insert performance only", "Links table to external API"), 0));
        sqlList.add(new QuizQuestion("S_B4", "Which SQL aggregate function calculates the total sum of numeric values in a column?", "BEGINNER", Arrays.asList("SUM()", "COUNT()", "AVG()", "TOTAL()"), 0));
        sqlList.add(new QuizQuestion("S_B5", "What is the purpose of the FOREIGN KEY constraint in relational databases?", "BEGINNER", Arrays.asList("Enforces referential integrity between columns of two tables", "Prevents duplicate rows in same table", "Indexes table for full-text search", "Auto-increments numeric IDs"), 0));
        sqlList.add(new QuizQuestion("S_B6", "How does COALESCE(val1, val2, ...) function work in SQL?", "BEGINNER", Arrays.asList("Returns the first non-null expression among its arguments", "Converts strings to uppercase", "Sums up all argument values", "Deletes null rows from table"), 0));
        sqlList.add(new QuizQuestion("S_B7", "What is First Normal Form (1NF) requirement in database normalization?", "BEGINNER", Arrays.asList("Each table cell must contain a single atomic value and no repeating groups", "All foreign keys must be indexed", "Table must have at least 10 columns", "Database must be distributed"), 0));
        sqlList.add(new QuizQuestion("S_B8", "Which SQL clause is used to sort query result sets in ascending or descending order?", "BEGINNER", Arrays.asList("ORDER BY", "GROUP BY", "SORT BY", "ALIGN BY"), 0));

        // Intermediate (9)
        sqlList.add(new QuizQuestion("S_I1", "How does a B-Tree index accelerate SQL query execution?", "INTERMEDIATE", Arrays.asList("Provides O(log N) lookup time by traversing balanced tree structure instead of full table scan", "Loads entire table into RAM", "Compresses text columns using ZIP", "Deletes duplicate rows automatically"), 0));
        sqlList.add(new QuizQuestion("S_I2", "What is the Leftmost Prefix Rule in composite B-Tree indexes (e.g. index on A, B, C)?", "INTERMEDIATE", Arrays.asList("Query filters must include leftmost column 'A' for the composite index to be utilized", "Index can only be queried from right to left", "Columns must be sorted alphabetically", "Composite index only works with primary keys"), 0));
        sqlList.add(new QuizQuestion("S_I3", "Which SQL isolation level prevents Dirty Reads but allows Non-Repeatable Reads?", "INTERMEDIATE", Arrays.asList("READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE"), 0));
        sqlList.add(new QuizQuestion("S_I4", "What occurs during a database Deadlock scenario?", "INTERMEDIATE", Arrays.asList("Two transactions hold locks and wait indefinitely for locks held by each other", "Database storage runs out of disk space", "CPU usage reaches 100%", "Query returns incorrect calculation"), 0));
        sqlList.add(new QuizQuestion("S_I5", "In SQL Window Functions, what is the difference between RANK() and DENSE_RANK()?", "INTERMEDIATE", Arrays.asList("RANK() leaves gaps in sequence after ties, DENSE_RANK() produces consecutive ranks without gaps", "DENSE_RANK() works only on text", "RANK() orders descending only", "There is no difference"), 0));
        sqlList.add(new QuizQuestion("S_I6", "What is the purpose of PostgreSQL EXPLAIN ANALYZE command?", "INTERMEDIATE", Arrays.asList("Executes query and displays actual execution plan, time costs, and scan types", "Formats SQL code nicely", "Backs up database table", "Clears query result cache"), 0));
        sqlList.add(new QuizQuestion("S_I7", "What is the primary difference between a View and a Materialized View in PostgreSQL?", "INTERMEDIATE", Arrays.asList("Materialized View persists query results physically on disk and requires explicit refresh", "View stores data on disk permanently", "Materialized View cannot be queried", "View updates automatically once a month"), 0));
        sqlList.add(new QuizQuestion("S_I8", "How does ON DELETE CASCADE foreign key behavior act when parent row is deleted?", "INTERMEDIATE", Arrays.asList("Automatically deletes corresponding child rows in referencing table", "Prevents deletion of parent row", "Sets child foreign keys to NULL", "Logs error in system log"), 0));
        sqlList.add(new QuizQuestion("S_I9", "Why is SELECT * discouraged in production database queries?", "INTERMEDIATE", Arrays.asList("Increases network payload, prevents index-only scans, and breaks code when schema changes", "Causes database crash on large tables", "Syntax is deprecated in ANSI SQL", "Disables database transaction log"), 0));

        // Advanced (8)
        sqlList.add(new QuizQuestion("S_A1", "How does PostgreSQL Multi-Version Concurrency Control (MVCC) handle UPDATE operations?", "ADVANCED", Arrays.asList("Inserts new row tuple version and marks old version dead for VACUUM cleanup", "Overwrites existing row in-place", "Locks table during update", "Writes update to temporary text file"), 0));
        sqlList.add(new QuizQuestion("S_A2", "In HikariCP connection pool, what happens if all connections are active and pool limit is reached?", "ADVANCED", Arrays.asList("Request waits up to connectionTimeout before throwing SQLException", "Creates infinite dynamic connections", "Drops incoming database requests immediately", "Restarts database server"), 0));
        sqlList.add(new QuizQuestion("S_A3", "How does PostgreSQL CREATE INDEX CONCURRENTLY command prevent table locking?", "ADVANCED", Arrays.asList("Builds index in multiple passes without acquiring exclusive write lock on table", "Runs index creation in background thread without reading table", "Disables database logging", "Only indexes newly inserted rows"), 0));
        sqlList.add(new QuizQuestion("S_A4", "What is the function of Common Table Expression (CTE) WITH RECURSIVE in SQL?", "ADVANCED", Arrays.asList("Iteratively queries hierarchical data structures like org trees or graph nodes", "Loops through array elements", "Creates temporary database user", "Retries failed transactions"), 0));
        sqlList.add(new QuizQuestion("S_A5", "In query optimizer execution plans, what is a Hash Join operation?", "ADVANCED", Arrays.asList("Builds in-memory hash table from smaller input relation and probes with larger relation", "Joins tables using primary key index scan", "Sorts both tables before merging", "Executes cross join on disk"), 0));
        sqlList.add(new QuizQuestion("S_A6", "How does PostgreSQL Write-Ahead Logging (WAL) ensure durability (D in ACID)?", "ADVANCED", Arrays.asList("Writes transaction changes to WAL log file on disk before committing data pages", "Stores data in RAM indefinitely", "Replicates database to S3 every minute", "Uses synchronous JavaScript callbacks"), 0));
        sqlList.add(new QuizQuestion("S_A7", "What is Table Partitioning by Range in PostgreSQL?", "ADVANCED", Arrays.asList("Splits master table into child partition tables based on value ranges (e.g. date ranges)", "Encrypts data partitions", "Shards database across multiple physical cloud servers", "Limits query result rows"), 0));
        sqlList.add(new QuizQuestion("S_A8", "What is Raft consensus algorithm used for in Distributed SQL engines (CockroachDB / Yugabyte)?", "ADVANCED", Arrays.asList("Ensures strongly consistent state replication across distributed database node replicas", "Speeds up JSON parsing", "Generates auto-increment primary keys", "Compresses WAL logs"), 0));

        questionBank.put("DATABASE_SQL", sqlList);

        // 4. DEVOPS_CONTAINER & GENERAL
        List<QuizQuestion> devOpsList = new ArrayList<>();
        // Beginner (8)
        devOpsList.add(new QuizQuestion("D_B1", "What is the primary difference between a Docker Image and a Docker Container?", "BEGINNER", Arrays.asList("Image is static read-only blueprint, Container is runnable isolated instance", "Image runs in RAM, Container stays on disk", "Image is for Linux, Container is for Windows", "They are identical terms"), 0));
        devOpsList.add(new QuizQuestion("D_B2", "What is the purpose of Dockerfile in application containerization?", "BEGINNER", Arrays.asList("Contains text instructions to build a Docker container image", "Stores container database passwords", "Monitors CPU usage of container", "Deploys containers to AWS"), 0));
        devOpsList.add(new QuizQuestion("D_B3", "Which CLI command lists all currently running Docker containers?", "BEGINNER", Arrays.asList("docker ps", "docker run", "docker images", "docker list"), 0));
        devOpsList.add(new QuizQuestion("D_B4", "What is the function of docker-compose.yml file?", "BEGINNER", Arrays.asList("Defines and runs multi-container Docker applications together", "Compiles Java source code", "Monitors network traffic", "Creates Kubernetes clusters"), 0));
        devOpsList.add(new QuizQuestion("D_B5", "How does Docker volume facilitate container data management?", "BEGINNER", Arrays.asList("Persists container data outside container lifecycle on host file system", "Compresses log files", "Encrypts container memory", "Speeds up container boot time"), 0));
        devOpsList.add(new QuizQuestion("D_B6", "What does Continuous Integration (CI) in DevOps emphasize?", "BEGINNER", Arrays.asList("Automating code build and test execution on every repository push", "Deploying code directly to production without testing", "Manual code reviews only", "Writing documentation in Markdown"), 0));
        devOpsList.add(new QuizQuestion("D_B7", "What is the purpose of .dockerignore file?", "BEGINNER", Arrays.asList("Prevents unwanted files/directories from being included in Docker build context", "Ignores failing unit tests", "Stops Docker daemon", "Hides Docker containers from docker ps"), 0));
        devOpsList.add(new QuizQuestion("D_B8", "What does port mapping syntax '-p 8080:80' mean in docker run command?", "BEGINNER", Arrays.asList("Maps host port 8080 to container internal port 80", "Maps container port 8080 to host port 80", "Limits container bandwidth to 8080 KB", "Sets container ID to 8080"), 0));

        // Intermediate (9)
        devOpsList.add(new QuizQuestion("D_I1", "Why are Docker multi-stage builds recommended for production images?", "INTERMEDIATE", Arrays.asList("Dramatically reduces final image size by separating build tools from runtime environment", "Speeds up network downloads by 10x", "Allows container to run on multiple OS simultaneously", "Bypasses security scanning"), 0));
        devOpsList.add(new QuizQuestion("D_I2", "In Kubernetes, what is the smallest deployable computing unit?", "INTERMEDIATE", Arrays.asList("Pod", "Service", "Deployment", "Node"), 0));
        devOpsList.add(new QuizQuestion("D_I3", "What is the difference between Liveness Probe and Readiness Probe in Kubernetes?", "INTERMEDIATE", Arrays.asList("Liveness detects if container crashed and needs restart; Readiness checks if pod can accept traffic", "Liveness runs on host, Readiness runs inside pod", "Readiness probe restarts pod automatically", "They perform identical checks"), 0));
        devOpsList.add(new QuizQuestion("D_I4", "What is Kubernetes Ingress Controller used for?", "INTERMEDIATE", Arrays.asList("Manages external HTTP/HTTPS routing to cluster services with SSL termination", "Stores database backups", "Compiles container images", "Monitors pod CPU temperature"), 0));
        devOpsList.add(new QuizQuestion("D_I5", "How do Kubernetes ConfigMaps and Secrets differ?", "INTERMEDIATE", Arrays.asList("ConfigMaps store non-sensitive config data, Secrets store base64-encoded confidential credentials", "Secrets encrypt data with AES-256 automatically", "ConfigMaps can only be used by Nginx", "Secrets cannot be mounted as volumes"), 0));
        devOpsList.add(new QuizQuestion("D_I6", "What is GitOps deployment methodology (e.g. ArgoCD)?", "INTERMEDIATE", Arrays.asList("Uses Git repository as single source of truth for declarative infrastructure and continuous deployment", "Deploys code via email attachments", "Disables automated CI pipelines", "Manages database backups via Git commits"), 0));
        devOpsList.add(new QuizQuestion("D_I7", "What is the primary function of trivy or grype tools in DevOps pipelines?", "INTERMEDIATE", Arrays.asList("Scans container images and OS packages for known CVE security vulnerabilities", "Formats Dockerfiles", "Optimizes SQL queries", "Measures unit test code coverage"), 0));
        devOpsList.add(new QuizQuestion("D_I8", "What is Docker bridge network mode?", "INTERMEDIATE", Arrays.asList("Default network driver providing isolated private network for containers on same host", "Shares host network stack directly", "Connects container to external VPN", "Disables container networking"), 0));
        devOpsList.add(new QuizQuestion("D_I9", "What is Canary Deployment strategy?", "INTERMEDIATE", Arrays.asList("Rolls out new application version gradually to small percentage of traffic before full deployment", "Deploys code at midnight only", "Switches 100% traffic instantly between two environments", "Deploys code to staging environment only"), 0));

        // Advanced (8)
        devOpsList.add(new QuizQuestion("D_A1", "How does Blue-Green deployment ensure zero downtime?", "ADVANCED", Arrays.asList("Maintains two identical environments (Blue=Live, Green=New); switches router to Green upon verification", "Deploys update to 1 node every hour", "Reboots database server during deployment", "Uses container hot-swapping in RAM"), 0));
        devOpsList.add(new QuizQuestion("D_A2", "What security risk does running containers as root user introduce?", "ADVANCED", Arrays.asList("Container escape vulnerability allowing root access to host operating system kernel", "Slower container startup time", "High CPU utilization", "Inability to open network ports"), 0));
        devOpsList.add(new QuizQuestion("D_A3", "How does Kubernetes Horizontal Pod Autoscaler (HPA) scale pods dynamically?", "ADVANCED", Arrays.asList("Queries Metrics Server for CPU/Memory utilization and calculates target replica count", "Scales pods based on time of day only", "Requires manual administrator trigger", "Replaces nodes with larger VMs"), 0));
        devOpsList.add(new QuizQuestion("D_A4", "What is the role of Service Mesh (Istio / Linkerd) in cloud-native applications?", "ADVANCED", Arrays.asList("Provides transparent mTLS encryption, traffic management, and telemetry via sidecar proxy", "Replaces Kubernetes cluster", "Compiles microservices code", "Manages cloud infrastructure billing"), 0));
        devOpsList.add(new QuizQuestion("D_A5", "In Terraform, what is State Locking used for?", "ADVANCED", Arrays.asList("Prevents concurrent state modifications and corruption when multiple engineers run terraform apply", "Encrypts terraform code", "Prevents resource deletion in cloud", "Locks cloud API access keys"), 0));
        devOpsList.add(new QuizQuestion("D_A6", "What comprises the Observability Triad in cloud software systems?", "ADVANCED", Arrays.asList("Metrics, Logs, and Distributed Traces", "Build, Test, and Deploy", "CPU, RAM, and Disk Space", "Frontend, Backend, and Database"), 0));
        devOpsList.add(new QuizQuestion("D_A7", "What is Kubernetes Operator Pattern?", "ADVANCED", Arrays.asList("Extends Kubernetes API using Custom Resource Definitions (CRDs) to automate complex stateful apps", "Replaces human cluster administrators", "Manages user access passwords", "Runs Docker inside Kubernetes pods"), 0));
        devOpsList.add(new QuizQuestion("D_A8", "What is Cosign / Sigstore used for in container supply chain security?", "ADVANCED", Arrays.asList("Digitally signs container images to verify authenticity and prevent image tampering", "Compresses container layers", "Scans code for syntax errors", "Encrypts network traffic"), 0));

        questionBank.put("DEVOPS_CONTAINER", devOpsList);

        // 5. AI & GENERAL
        questionBank.put("AI_LLM_INTELLIGENCE", javaList);
        questionBank.put("GENERAL", javaList);
    }
}
