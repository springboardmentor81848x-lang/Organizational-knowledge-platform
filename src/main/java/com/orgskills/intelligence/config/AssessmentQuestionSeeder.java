package com.orgskills.intelligence.config;

import com.orgskills.intelligence.entity.AssessmentQuestion;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.repository.AssessmentQuestionRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Seeds the multiple-choice question bank the target-role assessment draws on.
 *
 * <p>Separate from {@link DataSeeder}, and guarded on its own table rather than on the skills
 * table, for a specific reason: {@code DataSeeder} returns early whenever skills already exist,
 * so folding these questions into it would leave every database created before this feature
 * without a single question - and an assessment with no questions fails outright. Guarding on
 * {@code assessment_questions} means an existing installation picks up the bank on next start.
 *
 * <p>Questions are attached per skill and skipped for any skill that is absent, so an
 * installation with a trimmed or extended skill list seeds whatever it does have.
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class AssessmentQuestionSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<AssessmentQuestion> bank = new ArrayList<>();
        bank.addAll(javaQuestions());
        bank.addAll(springBootQuestions());
        bank.addAll(reactQuestions());
        bank.addAll(typeScriptQuestions());
        bank.addAll(pythonQuestions());
        bank.addAll(sqlQuestions());
        bank.addAll(testingQuestions());
        bank.addAll(dockerQuestions());
        bank.addAll(linuxQuestions());
        bank.addAll(awsQuestions());
        bank.addAll(securityQuestions());
        bank.addAll(dataAnalysisQuestions());
        bank.addAll(machineLearningQuestions());
        bank.addAll(productManagementQuestions());
        bank.addAll(communicationQuestions());
        bank.addAll(leadershipQuestions());
        bank.addAll(agileQuestions());

        if (bank.isEmpty()) {
            log.info("Assessment question bank is up to date; no questions were added.");
            return;
        }

        assessmentQuestionRepository.saveAll(bank);
        log.info("Seeded {} assessment questions across the skill catalogue.", bank.size());
    }

    // ── Per-skill banks ─────────────────────────────────────────────────────────

    private List<AssessmentQuestion> javaQuestions() {
        return forSkill("Java", builder -> List.of(
                builder.ask("Which keyword prevents a Java class from being subclassed?",
                        "static", "final", "sealed", "private", "B", ProficiencyLevel.BEGINNER,
                        "A final class cannot be extended. 'sealed' restricts which classes may extend it, but does not forbid it outright."),
                builder.ask("What is the size of an int in Java, regardless of platform?",
                        "16 bits", "32 bits", "64 bits", "Platform dependent", "B", ProficiencyLevel.BEGINNER,
                        "Java's primitive sizes are fixed by the language specification; an int is always 32 bits signed."),
                builder.ask("Which collection guarantees insertion order and allows duplicate elements?",
                        "HashSet", "TreeSet", "ArrayList", "HashMap", "C", ProficiencyLevel.BEGINNER,
                        "ArrayList is an ordered sequence that permits duplicates. Sets reject duplicates; HashMap stores key-value pairs."),
                builder.ask("What does the Stream API's map() operation do?",
                        "Filters elements by a predicate", "Transforms each element into another value",
                        "Reduces the stream to a single value", "Sorts the stream", "B", ProficiencyLevel.INTERMEDIATE,
                        "map() applies a function to each element, producing a new stream of the results. filter() takes a predicate; reduce() folds to one value."),
                builder.ask("Why is String immutable in Java?",
                        "To make it faster to concatenate", "To allow safe sharing, caching and hashing across threads",
                        "Because it is a primitive type", "To reduce its memory footprint", "B", ProficiencyLevel.INTERMEDIATE,
                        "Immutability lets strings be shared freely between threads, interned in a pool, and safely cached as hash keys."),
                builder.ask("What problem does the volatile keyword solve?",
                        "It makes compound operations atomic", "It guarantees visibility of writes across threads",
                        "It prevents a variable being garbage collected", "It replaces synchronized entirely", "B",
                        ProficiencyLevel.ADVANCED,
                        "volatile guarantees visibility and ordering, but not atomicity: i++ on a volatile int is still a race."),
                builder.ask("In the Java memory model, what does 'happens-before' establish?",
                        "The order in which threads are scheduled", "A visibility guarantee between two actions",
                        "That code runs on a single core", "Garbage collection timing", "B", ProficiencyLevel.EXPERT,
                        "happens-before is the ordering relation guaranteeing that one action's memory effects are visible to another."),
                builder.ask("Why can a HashMap resize under concurrent writes corrupt its internal state?",
                        "Because hashCode is not thread safe", "Because rehashing is not atomic and can interleave, historically producing a cycle",
                        "Because it uses a red-black tree", "Because entries are stored off-heap", "B",
                        ProficiencyLevel.EXPERT,
                        "Concurrent rehashing can interleave and leave the bucket list inconsistent, which is why ConcurrentHashMap exists.")));
    }

    private List<AssessmentQuestion> springBootQuestions() {
        return forSkill("Spring Boot", builder -> List.of(
                builder.ask("Which annotation marks the entry point of a Spring Boot application?",
                        "@Component", "@SpringBootApplication", "@EnableAutoConfiguration only", "@Configuration only",
                        "B", ProficiencyLevel.BEGINNER,
                        "@SpringBootApplication combines @Configuration, @EnableAutoConfiguration and @ComponentScan."),
                builder.ask("Which file conventionally holds Spring Boot configuration?",
                        "pom.xml", "application.yml or application.properties", "web.xml", "settings.gradle", "B",
                        ProficiencyLevel.BEGINNER,
                        "Spring Boot reads application.properties or application.yml from the classpath and config locations."),
                builder.ask("What does constructor injection give you that field injection does not?",
                        "Faster startup", "Immutable dependencies and straightforward unit testing without a container",
                        "Automatic transaction management", "Lazy initialisation by default", "B",
                        ProficiencyLevel.INTERMEDIATE,
                        "Constructor injection allows final fields and lets a test construct the object directly with test doubles."),
                builder.ask("What is the default propagation of @Transactional?",
                        "REQUIRES_NEW", "REQUIRED", "NESTED", "SUPPORTS", "B", ProficiencyLevel.INTERMEDIATE,
                        "REQUIRED joins an existing transaction if one is active, otherwise starts a new one."),
                builder.ask("Why does calling a @Transactional method from another method in the same class not start a transaction?",
                        "Transactions are disabled for internal calls", "The call bypasses the proxy that applies the advice",
                        "Spring caches the first result", "Only public static methods are advised", "B",
                        ProficiencyLevel.ADVANCED,
                        "Spring's transactional advice lives on a proxy; a self-invocation never crosses it, so the annotation has no effect."),
                builder.ask("What risk does spring.jpa.open-in-view=true introduce under load?",
                        "Lazy loading stops working", "A database connection is held for the whole request, exhausting the pool",
                        "Entities are detached too early", "Queries bypass the cache", "B", ProficiencyLevel.EXPERT,
                        "Open Session In View keeps the persistence context, and its connection, open until the response is written.")));
    }

    private List<AssessmentQuestion> reactQuestions() {
        return forSkill("React", builder -> List.of(
                builder.ask("What does JSX compile down to?",
                        "HTML strings", "Calls that create React elements", "Web Components", "Template literals", "B",
                        ProficiencyLevel.BEGINNER,
                        "JSX is syntax sugar for element-creation calls such as React.createElement or the automatic JSX runtime."),
                builder.ask("Which hook stores state in a function component?",
                        "useEffect", "useState", "useMemo", "useRef", "B", ProficiencyLevel.BEGINNER,
                        "useState returns the current value and a setter that triggers a re-render."),
                builder.ask("What is the purpose of the dependency array in useEffect?",
                        "It lists props to render", "It decides when the effect re-runs",
                        "It memoises the component", "It sets the render order", "B", ProficiencyLevel.INTERMEDIATE,
                        "The effect re-runs only when a listed value changes; an empty array runs it once after mount."),
                builder.ask("Why should a list's key be stable and unique rather than the array index?",
                        "Indexes are slower to compare", "Reordering with index keys makes React reuse the wrong element state",
                        "Indexes are not allowed by React", "Keys must be strings", "B", ProficiencyLevel.INTERMEDIATE,
                        "With index keys, inserting or reordering shifts every key, so React reuses elements against the wrong data."),
                builder.ask("What problem does useMemo actually solve?",
                        "It prevents re-renders entirely", "It avoids recomputing an expensive value on every render",
                        "It replaces useState", "It batches network calls", "B", ProficiencyLevel.ADVANCED,
                        "useMemo caches a computed value between renders; it does not stop the component re-rendering."),
                builder.ask("Why can reading state immediately after calling its setter return the old value?",
                        "The setter is asynchronous and state is captured per render", "State updates are never batched",
                        "React caches DOM nodes", "Because of strict mode only", "A", ProficiencyLevel.EXPERT,
                        "The state variable is a const captured in that render's closure; the new value is only visible in the next render.")));
    }

    private List<AssessmentQuestion> pythonQuestions() {
        return forSkill("Python", builder -> List.of(
                builder.ask("Which of these is an immutable built-in type?",
                        "list", "dict", "tuple", "set", "C", ProficiencyLevel.BEGINNER,
                        "Tuples cannot be modified after creation; lists, dicts and sets can."),
                builder.ask("What does len() return for the string 'hello'?",
                        "4", "5", "6", "It raises an error", "B", ProficiencyLevel.BEGINNER,
                        "len() returns the number of characters, which is 5."),
                builder.ask("What is a list comprehension used for?",
                        "Declaring types", "Building a list from an iterable in a single expression",
                        "Importing modules", "Defining a class", "B", ProficiencyLevel.INTERMEDIATE,
                        "A comprehension such as [x*2 for x in items] builds a list inline, usually more readably than a loop."),
                builder.ask("Why is a mutable default argument such as def f(x=[]) a common bug?",
                        "It is a syntax error", "The default is created once and shared across every call",
                        "It makes the function slower", "Python copies it each call", "B", ProficiencyLevel.ADVANCED,
                        "Default arguments are evaluated once at definition time, so mutations persist between calls."),
                builder.ask("What does the Global Interpreter Lock prevent in CPython?",
                        "Any concurrency at all", "Two threads executing Python bytecode simultaneously",
                        "Use of multiprocessing", "Garbage collection", "B", ProficiencyLevel.EXPERT,
                        "The GIL serialises bytecode execution, so CPU-bound threads do not scale across cores; I/O-bound work still benefits.")));
    }

    private List<AssessmentQuestion> sqlQuestions() {
        return forSkill("SQL", builder -> List.of(
                builder.ask("Which clause filters rows before any grouping is applied?",
                        "HAVING", "WHERE", "ORDER BY", "LIMIT", "B", ProficiencyLevel.BEGINNER,
                        "WHERE filters individual rows before GROUP BY; HAVING filters the groups afterwards."),
                builder.ask("What does an INNER JOIN return?",
                        "All rows from both tables", "Only rows with a match in both tables",
                        "All rows from the left table", "Rows with no match", "B", ProficiencyLevel.BEGINNER,
                        "An INNER JOIN keeps only the rows where the join condition is satisfied on both sides."),
                builder.ask("What is the difference between UNION and UNION ALL?",
                        "None", "UNION removes duplicate rows, UNION ALL keeps them",
                        "UNION ALL sorts the result", "UNION only works on two tables", "B", ProficiencyLevel.INTERMEDIATE,
                        "UNION performs a distinct operation, which costs a sort or hash; UNION ALL simply concatenates."),
                builder.ask("Why can an index on a column make a query slower to write but faster to read?",
                        "Indexes compress the table", "Every insert or update must also maintain the index",
                        "Indexes lock the table permanently", "Reads bypass the index", "B", ProficiencyLevel.ADVANCED,
                        "An index is a second structure that must be kept in step on every write, which is the cost paid for faster lookups."),
                builder.ask("What problem does the isolation level READ COMMITTED still permit?",
                        "Dirty reads", "Non-repeatable reads", "Nothing", "Lost updates only", "B",
                        ProficiencyLevel.EXPERT,
                        "READ COMMITTED prevents dirty reads, but the same row can change between two reads in one transaction.")));
    }

    private List<AssessmentQuestion> dockerQuestions() {
        return forSkill("Docker", builder -> List.of(
                builder.ask("What is a Docker image?",
                        "A running process", "A read-only template used to create containers",
                        "A virtual machine", "A network bridge", "B", ProficiencyLevel.BEGINNER,
                        "An image is an immutable layered filesystem plus metadata; a container is a running instance of one."),
                builder.ask("Which instruction in a Dockerfile sets the command run when the container starts?",
                        "RUN", "CMD", "COPY", "FROM", "B", ProficiencyLevel.BEGINNER,
                        "RUN executes at build time; CMD (or ENTRYPOINT) defines what runs when the container starts."),
                builder.ask("Why does ordering Dockerfile instructions from least to most frequently changed speed up builds?",
                        "It reduces image size", "Unchanged leading layers are reused from the build cache",
                        "It parallelises the build", "It avoids network calls", "B", ProficiencyLevel.INTERMEDIATE,
                        "Each instruction is a cached layer; the cache is invalidated from the first changed instruction onwards."),
                builder.ask("What does a multi-stage build primarily achieve?",
                        "Faster container startup", "A smaller final image containing only runtime artefacts",
                        "Automatic health checks", "Multi-architecture support", "B", ProficiencyLevel.ADVANCED,
                        "Build tooling stays in an earlier stage; only the compiled output is copied into the slim final image."),
                builder.ask("Why is writing application data to the container filesystem rather than a volume a problem?",
                        "It is slower to read", "The data is lost when the container is replaced",
                        "It cannot be backed up at all", "Docker forbids it", "B", ProficiencyLevel.EXPERT,
                        "The writable layer belongs to that container instance; replacing the container discards it. Volumes outlive containers.")));
    }

    private List<AssessmentQuestion> awsQuestions() {
        return forSkill("AWS", builder -> List.of(
                builder.ask("Which AWS service provides object storage?",
                        "EBS", "S3", "EFS", "RDS", "B", ProficiencyLevel.BEGINNER,
                        "S3 stores objects in buckets. EBS is block storage, EFS is a file system, RDS is a managed database."),
                builder.ask("What does an AWS Region contain?",
                        "A single data centre", "Multiple isolated Availability Zones",
                        "One virtual machine", "A billing account", "B", ProficiencyLevel.BEGINNER,
                        "A Region is a geographic area made up of several Availability Zones, each with independent power and networking."),
                builder.ask("What is the principle of least privilege in IAM?",
                        "Give every user administrator access", "Grant only the permissions a principal actually needs",
                        "Use the root account for daily work", "Disable MFA to simplify access", "B",
                        ProficiencyLevel.INTERMEDIATE,
                        "Each role or user should hold the narrowest permission set that lets it do its job."),
                builder.ask("Why should an EC2 instance use an IAM role rather than embedded access keys?",
                        "Roles are cheaper", "Credentials are issued temporarily and rotated automatically",
                        "Roles allow more requests", "Keys do not work on EC2", "B", ProficiencyLevel.ADVANCED,
                        "An instance profile supplies short-lived rotating credentials, so there is no long-lived secret to leak."),
                builder.ask("What does deploying across multiple Availability Zones protect against?",
                        "Application bugs", "Failure of a single data centre's power or network",
                        "Region-wide outages", "Cost overruns", "B", ProficiencyLevel.EXPERT,
                        "Multi-AZ covers the loss of one AZ. Surviving a whole-Region failure needs a multi-Region design.")));
    }

    private List<AssessmentQuestion> communicationQuestions() {
        return forSkill("Communication", builder -> List.of(
                builder.ask("What does active listening involve?",
                        "Planning your reply while the other person talks", "Attending fully and confirming understanding before responding",
                        "Taking notes silently and not responding", "Repeating every word back", "B",
                        ProficiencyLevel.BEGINNER,
                        "Active listening means giving full attention and reflecting back to check you understood before answering."),
                builder.ask("When writing an update for a busy stakeholder, what belongs first?",
                        "The full background", "The conclusion or decision needed",
                        "A list of everyone involved", "The technical detail", "B", ProficiencyLevel.INTERMEDIATE,
                        "Leading with the outcome or the ask lets the reader decide immediately how much of the detail they need."),
                builder.ask("What is the main advantage of written asynchronous updates over a status meeting?",
                        "They are always shorter", "They are searchable and let readers engage on their own schedule",
                        "They avoid the need for decisions", "They remove the need for any meetings", "B",
                        ProficiencyLevel.INTERMEDIATE,
                        "A written update leaves a record and does not require everyone to be free at the same moment."),
                builder.ask("How is difficult feedback best framed?",
                        "As a judgement of the person", "As specific observed behaviour and its concrete impact",
                        "Anonymously through a third party", "Only in a group setting", "B", ProficiencyLevel.ADVANCED,
                        "Naming the behaviour and its effect keeps the conversation about something changeable rather than about character."),
                builder.ask("When explaining a technical risk to a non-technical audience, what matters most?",
                        "Complete implementation detail", "Translating it into business consequence, likelihood and options",
                        "Using precise jargon", "Avoiding the topic until it happens", "B", ProficiencyLevel.EXPERT,
                        "Decision-makers need the impact, the odds and their choices, not the mechanism.")));
    }

    private List<AssessmentQuestion> leadershipQuestions() {
        return forSkill("Leadership", builder -> List.of(
                builder.ask("What does delegation primarily require?",
                        "Handing over tasks and stepping away entirely", "Matching the task to the person and agreeing the outcome and support",
                        "Keeping all decisions yourself", "Assigning work at random", "B", ProficiencyLevel.BEGINNER,
                        "Effective delegation pairs the right person with a clear outcome, agreed authority and available support."),
                builder.ask("What is psychological safety on a team?",
                        "Never disagreeing", "The shared belief that speaking up carries no interpersonal risk",
                        "Guaranteed job security", "Avoiding all difficult work", "B", ProficiencyLevel.INTERMEDIATE,
                        "It is the confidence that raising a problem, question or mistake will not be punished."),
                builder.ask("A team consistently misses estimates. What is the most useful first response?",
                        "Set tighter deadlines", "Investigate the causes with the team before changing anything",
                        "Replace the team members", "Stop estimating", "B", ProficiencyLevel.INTERMEDIATE,
                        "Understanding whether the cause is scope, interruption, unknowns or estimation practice comes before any remedy."),
                builder.ask("How should a leader handle a decision they disagreed with but that has been made?",
                        "Undermine it quietly", "Commit to it publicly while recording the concern through the proper channel",
                        "Ignore the decision", "Announce their disagreement to the team", "B", ProficiencyLevel.ADVANCED,
                        "Disagree and commit keeps the team aligned without pretending the concern never existed."),
                builder.ask("What distinguishes a lagging from a leading indicator when measuring team health?",
                        "Nothing", "A lagging indicator reports what already happened; a leading one predicts what is coming",
                        "Leading indicators are always financial", "Lagging indicators are more accurate", "B",
                        ProficiencyLevel.EXPERT,
                        "Attrition is lagging; engagement signals and cycle-time trends lead it, giving time to act.")));
    }

    private List<AssessmentQuestion> agileQuestions() {
        return forSkill("Agile", builder -> List.of(
                builder.ask("What is a sprint in Scrum?",
                        "A daily meeting", "A fixed-length iteration producing a potentially releasable increment",
                        "A bug-fixing phase", "A release approval gate", "B", ProficiencyLevel.BEGINNER,
                        "A sprint is a timeboxed iteration, usually one to four weeks, ending in a usable increment."),
                builder.ask("Who owns the product backlog?",
                        "The Scrum Master", "The Product Owner", "The developers", "The sponsor", "B",
                        ProficiencyLevel.BEGINNER,
                        "The Product Owner is accountable for the backlog's content, ordering and clarity."),
                builder.ask("What is the purpose of a retrospective?",
                        "To assign blame for failures", "To inspect how the team works and agree improvements",
                        "To demonstrate the increment", "To re-estimate the backlog", "B", ProficiencyLevel.INTERMEDIATE,
                        "The retrospective examines process and collaboration, and produces concrete changes to try next."),
                builder.ask("What does a Kanban work-in-progress limit achieve?",
                        "It increases the number of parallel tasks", "It exposes bottlenecks and shortens cycle time",
                        "It removes the need for estimates", "It guarantees deadlines", "B", ProficiencyLevel.ADVANCED,
                        "Capping WIP forces finishing over starting, which surfaces the constraint and reduces time in progress."),
                builder.ask("Why is velocity a poor measure to compare across two teams?",
                        "It is always inaccurate", "Story points are relative to each team's own baseline",
                        "It changes weekly", "It only counts bugs", "B", ProficiencyLevel.EXPERT,
                        "Points are calibrated within a team, so the same number means different things elsewhere; velocity is for that team's own forecasting.")));
    }

    private List<AssessmentQuestion> typeScriptQuestions() {
        return forSkill("TypeScript", builder -> List.of(
                builder.ask("What does TypeScript add to JavaScript?",
                        "A faster runtime", "Static types checked before the code runs",
                        "Automatic memory management", "A new module system", "B", ProficiencyLevel.BEGINNER,
                        "TypeScript is JavaScript with types checked at compile time. It compiles away entirely, so the runtime is unchanged."),
                builder.ask("What is the difference between 'any' and 'unknown'?",
                        "They are identical", "'unknown' must be narrowed before use, 'any' disables checking",
                        "'any' is newer", "'unknown' is only for errors", "B", ProficiencyLevel.BEGINNER,
                        "'any' opts out of type checking entirely. 'unknown' accepts any value but forces you to narrow it before doing anything with it, so it stays safe."),
                builder.ask("What does the '?' in 'interface User { name?: string }' mean?",
                        "The property is read-only", "The property is optional",
                        "The property may be null only", "The property is computed", "B", ProficiencyLevel.BEGINNER,
                        "A '?' marks the property optional, so the type allows objects that omit it."),
                builder.ask("What is a discriminated union used for?",
                        "Merging two interfaces", "Narrowing a union by checking a shared literal field",
                        "Declaring generics", "Importing types", "B", ProficiencyLevel.INTERMEDIATE,
                        "Giving each member a common literal field (often 'kind') lets the compiler narrow the union from a simple check, and verify you handled every case."),
                builder.ask("Why does 'as' (a type assertion) not make code safe?",
                        "It is slow", "It tells the compiler to trust you without checking anything at runtime",
                        "It only works on strings", "It is deprecated", "B", ProficiencyLevel.INTERMEDIATE,
                        "An assertion silences the compiler; it performs no runtime check. If the value is not what you asserted, it fails later and further away."),
                builder.ask("What does 'strictNullChecks' change?",
                        "It forbids the null keyword", "null and undefined stop being assignable to every type",
                        "It makes all properties optional", "It enables decorators", "B", ProficiencyLevel.ADVANCED,
                        "With it on, null and undefined only belong to types that explicitly include them, so the compiler can find the places you forgot to handle them."),
                builder.ask("What problem do conditional types such as 'T extends U ? X : Y' solve?",
                        "Runtime branching", "Expressing a type that depends on another type",
                        "Faster compilation", "Replacing interfaces", "B", ProficiencyLevel.EXPERT,
                        "They let a library describe a return type derived from its input type, which is how utilities like ReturnType and Awaited are written.")));
    }

    private List<AssessmentQuestion> testingQuestions() {
        return forSkill("Testing", builder -> List.of(
                builder.ask("What does a unit test aim to verify?",
                        "That the whole system works end to end", "One small piece of behaviour in isolation",
                        "That the database schema is correct", "That the UI renders on every browser", "B", ProficiencyLevel.BEGINNER,
                        "A unit test exercises one unit of behaviour with its collaborators controlled, so a failure points at a specific cause."),
                builder.ask("In the arrange-act-assert pattern, what happens in 'arrange'?",
                        "The assertion is checked", "The system under test and its inputs are set up",
                        "The test is cleaned up", "The test is named", "B", ProficiencyLevel.BEGINNER,
                        "Arrange builds the state the test needs, act performs the one operation under test, assert checks the outcome."),
                builder.ask("What is the practical difference between a stub and a mock?",
                        "None", "A stub supplies canned answers, a mock also asserts how it was called",
                        "A mock is faster", "A stub only works for databases", "B", ProficiencyLevel.INTERMEDIATE,
                        "A stub exists to get the test past a dependency. A mock additionally makes the interaction itself the thing being verified."),
                builder.ask("Why is a test that passes or fails without any code change a problem?",
                        "It runs slowly", "A flaky test destroys trust, so real failures get ignored",
                        "It uses more memory", "It cannot be run in CI", "B", ProficiencyLevel.INTERMEDIATE,
                        "Once a suite cries wolf, people rerun until green and stop reading failures — which is worse than not having the test."),
                builder.ask("What does the test pyramid recommend?",
                        "Mostly end-to-end tests", "Many fast unit tests, fewer integration, fewest end-to-end",
                        "Equal numbers of each", "Only integration tests", "B", ProficiencyLevel.ADVANCED,
                        "Lower tests are faster and more precise, so most coverage belongs there; the slow, brittle end-to-end tests are reserved for critical journeys."),
                builder.ask("Why is 100% line coverage a weak measure of a suite's quality?",
                        "It is expensive to compute", "Executing a line is not the same as asserting it behaves correctly",
                        "It only counts comments", "Coverage tools are inaccurate", "B", ProficiencyLevel.EXPERT,
                        "Coverage says a line ran, not that its outcome was checked. A suite with no assertions can still reach full coverage.")));
    }

    private List<AssessmentQuestion> linuxQuestions() {
        return forSkill("Linux", builder -> List.of(
                builder.ask("Which command shows the current working directory?",
                        "ls", "pwd", "cd", "whoami", "B", ProficiencyLevel.BEGINNER,
                        "pwd prints the working directory. ls lists its contents and cd changes it."),
                builder.ask("What do the permissions 'rw-r--r--' grant?",
                        "Everyone can write", "Owner reads and writes; group and others only read",
                        "Nobody can read", "Owner can execute", "B", ProficiencyLevel.BEGINNER,
                        "The triplets are owner, group, others. Here the owner has read and write, everyone else read only, and nobody has execute."),
                builder.ask("What does the pipe in 'cat log.txt | grep ERROR' do?",
                        "Runs the commands in parallel", "Feeds the first command's output into the second's input",
                        "Writes output to a file", "Runs the second command only on failure", "B", ProficiencyLevel.BEGINNER,
                        "A pipe connects stdout of the left command to stdin of the right, so grep filters what cat produced."),
                builder.ask("What is the difference between a hard link and a symbolic link?",
                        "None", "A symlink points at a path; a hard link is another name for the same inode",
                        "Hard links work across filesystems", "Symlinks cannot be deleted", "B", ProficiencyLevel.INTERMEDIATE,
                        "A hard link references the inode directly, so the data survives deleting the original name. A symlink stores a path and breaks if that path goes away."),
                builder.ask("What does a process's exit code of 0 conventionally mean?",
                        "It failed", "It succeeded", "It is still running", "It was killed", "B", ProficiencyLevel.INTERMEDIATE,
                        "Zero means success; any non-zero value signals an error, which is what shell operators like && test."),
                builder.ask("Why is sending SIGKILL different from SIGTERM?",
                        "SIGKILL is slower", "SIGTERM can be handled and cleaned up after; SIGKILL cannot be caught",
                        "They are identical", "SIGTERM only works as root", "B", ProficiencyLevel.ADVANCED,
                        "SIGTERM asks a process to stop, letting it flush and close cleanly. SIGKILL is executed by the kernel with no chance to run shutdown code.")));
    }

    private List<AssessmentQuestion> securityQuestions() {
        return forSkill("Security", builder -> List.of(
                builder.ask("What is the reliable defence against SQL injection?",
                        "Escaping quotes by hand", "Parameterised queries that keep data out of the statement",
                        "Hiding error messages", "Using POST instead of GET", "B", ProficiencyLevel.BEGINNER,
                        "Parameter binding sends the statement and the values separately, so input can never be parsed as SQL. Manual escaping repeatedly proves incomplete."),
                builder.ask("Why should passwords never be stored as plain text?",
                        "They take more space", "Anyone who reads the database gets every user's password",
                        "They cannot be indexed", "They expire", "B", ProficiencyLevel.BEGINNER,
                        "A single database leak would expose every credential, including ones reused on other services. Passwords are stored as salted hashes for this reason."),
                builder.ask("What does cross-site scripting (XSS) let an attacker do?",
                        "Read files on the server", "Run their own JavaScript in another user's browser session",
                        "Drop database tables", "Intercept TLS", "B", ProficiencyLevel.INTERMEDIATE,
                        "Untrusted input rendered as markup executes with the victim's session, so it can act as them or steal what their page can read."),
                builder.ask("What is the point of the principle of least privilege?",
                        "It reduces licence costs", "A compromised account or service can reach only what it actually needs",
                        "It makes systems faster", "It simplifies passwords", "B", ProficiencyLevel.INTERMEDIATE,
                        "Granting the minimum necessary access bounds the damage of any single compromise, because the attacker inherits only those rights."),
                builder.ask("Why is bcrypt preferred over SHA-256 for hashing passwords?",
                        "It produces shorter hashes", "It is deliberately slow and salted, making guessing expensive",
                        "It is newer", "It is reversible", "B", ProficiencyLevel.ADVANCED,
                        "General-purpose hashes are fast, which helps an attacker guess billions per second. bcrypt has a tunable cost and built-in salt, so brute force stays expensive."),
                builder.ask("Why is a secret committed to git still a problem after you delete it?",
                        "It slows down clones", "It remains in the repository history and in every clone",
                        "Git refuses to delete files", "It corrupts the branch", "B", ProficiencyLevel.EXPERT,
                        "Removing it in a later commit does not erase the earlier one. The secret must be rotated, because anyone with history has it.")));
    }

    private List<AssessmentQuestion> dataAnalysisQuestions() {
        return forSkill("Data Analysis", builder -> List.of(
                builder.ask("When is the median a better summary than the mean?",
                        "Never", "When the data is skewed or has extreme outliers",
                        "Only for small samples", "Only for categories", "B", ProficiencyLevel.BEGINNER,
                        "The mean is dragged by extreme values; the median describes the typical case, which is why incomes and response times are usually reported as medians."),
                builder.ask("What does a bar chart show better than a pie chart?",
                        "Nothing", "Comparisons between categories, because lengths are easier to judge than angles",
                        "Proportions only", "Change over time only", "B", ProficiencyLevel.BEGINNER,
                        "People read length far more accurately than angle or area, so bars make differences between categories legible."),
                builder.ask("What does it mean that correlation does not imply causation?",
                        "Correlation is useless", "Two variables can move together because of a third cause or chance",
                        "Causation is unmeasurable", "Correlation is always wrong", "B", ProficiencyLevel.INTERMEDIATE,
                        "A shared driver or coincidence produces the same pattern as cause and effect. Establishing causation needs an experiment or a design that rules out alternatives."),
                builder.ask("Why does dropping every row with a missing value risk biasing an analysis?",
                        "It is slow", "Missingness is often related to the outcome, so what is left is not representative",
                        "It breaks joins", "It changes column types", "B", ProficiencyLevel.INTERMEDIATE,
                        "If the reason data is missing correlates with the thing being measured, the surviving rows are a skewed sample rather than a smaller fair one."),
                builder.ask("What is Simpson's paradox?",
                        "A sampling error", "A trend that holds in every subgroup but reverses when they are combined",
                        "A type of chart", "A missing-data method", "B", ProficiencyLevel.ADVANCED,
                        "Aggregating over groups of very different sizes or baselines can invert the apparent direction, which is why segmentation matters before concluding."),
                builder.ask("What does a p-value of 0.04 actually tell you?",
                        "There is a 96% chance the hypothesis is true", "Data this extreme would be uncommon if the null hypothesis held",
                        "The effect is large", "The sample was big enough", "B", ProficiencyLevel.EXPERT,
                        "It is the probability of the observed data under the null hypothesis, not the probability that any hypothesis is true, and it says nothing about effect size.")));
    }

    private List<AssessmentQuestion> machineLearningQuestions() {
        return forSkill("Machine Learning", builder -> List.of(
                builder.ask("What distinguishes supervised from unsupervised learning?",
                        "Supervised is faster", "Supervised learns from labelled examples; unsupervised finds structure without labels",
                        "Unsupervised needs more data", "They are the same", "B", ProficiencyLevel.BEGINNER,
                        "Supervised learning is given the answer for each training example. Unsupervised learning, such as clustering, is not."),
                builder.ask("What is overfitting?",
                        "The model is too simple", "The model learns noise in the training data and generalises poorly",
                        "Training takes too long", "The data is unlabelled", "B", ProficiencyLevel.BEGINNER,
                        "An overfitted model performs well on data it has seen and badly on data it has not, because it memorised specifics rather than the pattern."),
                builder.ask("Why hold out a test set rather than scoring on training data?",
                        "To save memory", "Training scores measure memorisation, not performance on unseen data",
                        "To speed up training", "Because labels are wrong", "B", ProficiencyLevel.INTERMEDIATE,
                        "The only honest estimate of real-world performance comes from data the model has never been fitted on."),
                builder.ask("For a dataset where 99% of cases are negative, why is accuracy misleading?",
                        "It is hard to compute", "Predicting the majority class always scores 99% while finding nothing",
                        "Accuracy needs balanced classes to run", "It ignores the training set", "B", ProficiencyLevel.INTERMEDIATE,
                        "With heavy imbalance, accuracy rewards ignoring the rare class. Precision, recall and the confusion matrix show what is actually happening."),
                builder.ask("What is the precision/recall trade-off?",
                        "Both rise together", "Raising the threshold usually raises precision and lowers recall",
                        "They are unrelated", "It only applies to regression", "B", ProficiencyLevel.ADVANCED,
                        "Being stricter about predicting positive makes the positives you do predict more reliable, at the cost of missing more real ones. Which matters depends on the cost of each error."),
                builder.ask("What is data leakage in a training pipeline?",
                        "Losing rows", "Information unavailable at prediction time leaks into training, inflating scores",
                        "A memory leak", "Exporting data insecurely", "B", ProficiencyLevel.EXPERT,
                        "Scaling or imputing using statistics computed over the whole dataset, or using a feature derived from the outcome, produces excellent validation scores that collapse in production.")));
    }

    private List<AssessmentQuestion> productManagementQuestions() {
        return forSkill("Product Management", builder -> List.of(
                builder.ask("What does an MVP mean in product terms?",
                        "The cheapest possible build", "The smallest release that tests the central assumption with real users",
                        "A prototype never shipped", "The first version with every planned feature", "B", ProficiencyLevel.BEGINNER,
                        "The point is learning, not thrift: it is the least you can ship that tells you whether the idea holds."),
                builder.ask("What belongs in a product backlog?",
                        "Only bugs", "Everything that might be built, ordered by value",
                        "The engineering rota", "Finished work", "B", ProficiencyLevel.BEGINNER,
                        "The backlog is the ordered list of possible work; ordering it is the product manager's main lever."),
                builder.ask("Why is a user story written from the user's perspective?",
                        "It is shorter", "It keeps the team focused on the outcome rather than a prescribed solution",
                        "It is required by Scrum", "It avoids estimates", "B", ProficiencyLevel.INTERMEDIATE,
                        "Naming who wants what and why leaves room for a better implementation than the one first imagined."),
                builder.ask("What makes a good product metric?",
                        "It always goes up", "It moves when the product genuinely improves for users",
                        "It is easy to collect", "It is reported weekly", "B", ProficiencyLevel.INTERMEDIATE,
                        "A metric that can be raised without helping anyone will be, so it should be tied to real user value rather than mere activity."),
                builder.ask("What is the risk of prioritising purely by loudest customer request?",
                        "It is slow", "You optimise for the vocal few and miss the silent majority and non-customers",
                        "It breaks the roadmap format", "Requests are always wrong", "B", ProficiencyLevel.ADVANCED,
                        "Requests are evidence, not a ranking. Weighing them against reach, impact and the people who churned without complaining gives a truer order."),
                builder.ask("Why should a roadmap communicate outcomes rather than dated features?",
                        "Dates are impossible", "Committing to problems keeps flexibility in the solution as you learn",
                        "Stakeholders dislike dates", "It avoids accountability", "B", ProficiencyLevel.EXPERT,
                        "A feature-and-date roadmap locks in the solution before the learning happens, and turns every discovery into a broken promise.")));
    }

    // ── Plumbing ────────────────────────────────────────────────────────────────

    /**
     * Builds the questions for one skill, or nothing at all when the skill is absent.
     *
     * <p>Skipping quietly is deliberate: the bank should seed cleanly against an installation
     * whose skill catalogue has been trimmed or renamed, rather than failing startup over a
     * question that has nowhere to attach.
     */
    private List<AssessmentQuestion> forSkill(String skillName, QuestionFactory factory) {
        Optional<Skill> skill = skillRepository.findByNameIgnoreCase(skillName);
        if (skill.isEmpty()) {
            log.debug("Skill '{}' is not in the catalogue; its questions were not seeded.", skillName);
            return List.of();
        }
        // Per skill rather than per table, so a release that adds a skill reaches an installation
        // whose bank was already seeded — while never duplicating questions for a skill that has
        // them, nor overwriting questions an administrator has since authored.
        if (assessmentQuestionRepository.countBySkillId(skill.get().getId()) > 0) {
            return List.of();
        }
        return factory.build(new Builder(skill.get()));
    }

    @FunctionalInterface
    private interface QuestionFactory {
        List<AssessmentQuestion> build(Builder builder);
    }

    /** Binds a skill so each question below reads as just its content. */
    private static final class Builder {
        private final Skill skill;

        private Builder(Skill skill) {
            this.skill = skill;
        }

        private AssessmentQuestion ask(String text, String a, String b, String c, String d,
                                       String correct, ProficiencyLevel difficulty, String explanation) {
            return AssessmentQuestion.builder()
                    .skill(skill)
                    .questionText(text)
                    .optionA(a)
                    .optionB(b)
                    .optionC(c)
                    .optionD(d)
                    .correctOption(correct)
                    .difficulty(difficulty)
                    .explanation(explanation)
                    .build();
        }
    }
}
