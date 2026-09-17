package com.okip.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentOption;
import com.okip.entity.assessment.AssessmentQuestion;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.master.Role;
import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;
import com.okip.entity.master.TrainingModule;
import com.okip.entity.master.TrainingResource;
import com.okip.entity.transaction.TrainingSkill;
import com.okip.enums.AccountStatus;
import com.okip.enums.RoleType;
import com.okip.enums.SkillCategory;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.JobRoleRepository;
import com.okip.repository.RoleRepository;
import com.okip.repository.SkillRepository;
import com.okip.repository.TrainingModuleRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.TrainingResourceRepository;
import com.okip.repository.TrainingSkillRepository;
import com.okip.repository.assessment.AssessmentOptionRepository;
import com.okip.repository.assessment.AssessmentQuestionRepository;
import com.okip.repository.assessment.AssessmentRepository;


@Component
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;
	private final DepartmentRepository departmentRepository;
	private final EmployeeRepository employeeRepository;
	private final SkillRepository skillRepository;
	private final PasswordEncoder passwordEncoder;
	private final JobRoleRepository jobRoleRepository;
	private final TrainingRepository trainingRepository;
	private final TrainingSkillRepository trainingSkillRepository;
	private final TrainingModuleRepository trainingModuleRepository;
	private final TrainingResourceRepository trainingResourceRepository;
	private final AssessmentRepository assessmentRepository;
	private final AssessmentQuestionRepository assessmentQuestionRepository;
	private final AssessmentOptionRepository assessmentOptionRepository;

	public DataInitializer(
	        RoleRepository roleRepository,
	        DepartmentRepository departmentRepository,
	        EmployeeRepository employeeRepository,
	        SkillRepository skillRepository,
	        JobRoleRepository jobRoleRepository,
	        TrainingRepository trainingRepository,
	        TrainingSkillRepository trainingSkillRepository,
	        TrainingModuleRepository trainingModuleRepository,
	        TrainingResourceRepository trainingResourceRepository,
	        AssessmentRepository assessmentRepository,
	        AssessmentQuestionRepository assessmentQuestionRepository,
	        AssessmentOptionRepository assessmentOptionRepository,
	        PasswordEncoder passwordEncoder) {

	    this.roleRepository = roleRepository;
	    this.departmentRepository = departmentRepository;
	    this.employeeRepository = employeeRepository;
	    this.skillRepository = skillRepository;
	    this.jobRoleRepository = jobRoleRepository;
	    this.trainingRepository = trainingRepository;
	    this.trainingSkillRepository = trainingSkillRepository;
	    this.trainingModuleRepository = trainingModuleRepository;
	    this.trainingResourceRepository = trainingResourceRepository;
	    this.assessmentRepository = assessmentRepository;
	    this.assessmentQuestionRepository = assessmentQuestionRepository;
	    this.assessmentOptionRepository = assessmentOptionRepository;
	    this.passwordEncoder = passwordEncoder;
	}
	@Override
	public void run(String... args) throws Exception {

	    initializeRoles();

	    initializeDepartments();

	    initializeSkills();

	    initializeDefaultUsers();

	    initializeJobRoles();

	    initializeTrainings();

	    initializeTrainingSkills();

	    initializeTrainingContent();
		initializeSelfAssessments();
		initializePeerAssessments();
	}
	private void initializeRoles() {

		for (RoleType roleType : RoleType.values()) {

			if (roleRepository.findByRoleName(roleType).isEmpty()) {

				Role role = new Role();
				role.setRoleName(roleType);
				role.setDescription(roleType.name() + " Role");

				roleRepository.save(role);
			}
		}
	}

	private void initializeDepartments() {

		List<String> departments = Arrays.asList("IT", "HR", "Finance", "Sales");

		for (String departmentName : departments) {

			if (departmentRepository.findByDepartmentName(departmentName).isEmpty()) {

				Department department = new Department();
				department.setDepartmentName(departmentName);
				department.setDescription(departmentName + " Department");

				departmentRepository.save(department);
			}
		}
	}

	private void initializeSkills() {

		createSkill("Java", SkillCategory.PROGRAMMING_LANGUAGE);
		createSkill("Spring Boot", SkillCategory.FRAMEWORK);
		createSkill("Spring Security", SkillCategory.FRAMEWORK);
		createSkill("REST API", SkillCategory.FRAMEWORK);
		createSkill("Microservices", SkillCategory.FRAMEWORK);

		createSkill("MySQL", SkillCategory.DATABASE);
		createSkill("PostgreSQL", SkillCategory.DATABASE);

		createSkill("Git", SkillCategory.TOOL);
		createSkill("Maven", SkillCategory.TOOL);

		createSkill("Docker", SkillCategory.DEVOPS);
		createSkill("Kubernetes", SkillCategory.DEVOPS);

		createSkill("AWS", SkillCategory.CLOUD);
	}

	private void createSkill(String skillName, SkillCategory skillCategory) {

		if (skillRepository.findBySkillNameIgnoreCase(skillName).isPresent()) {

			return;
		}

		Skill skill = new Skill();

		skill.setSkillName(skillName);
		skill.setSkillCategory(skillCategory);
		skill.setDescription(skillName + " Skill");

		skillRepository.save(skill);
	}

	private void initializeDefaultUsers() {

		createUser("ADMIN001", "System", "Admin", "admin@okip.com", "Password@123", RoleType.ROLE_ADMIN, "IT");

		createUser("HR001", "Default", "HR", "hr@okip.com", "Password@123", RoleType.ROLE_HR, "HR");

		createUser("MGR001", "Default", "Manager", "manager@okip.com", "Password@123", RoleType.ROLE_MANAGER, "IT");
	}

	private void initializeJobRoles() {

	    createJobRole(
	            "Java Developer",
	            "Backend Java Development");

	    createJobRole(
	            "Backend Developer",
	            "Backend Service Development");

	    createJobRole(
	            "Full Stack Developer",
	            "Frontend and Backend Development");

	    createJobRole(
	            "Frontend Developer",
	            "Frontend UI Development");

	    createJobRole(
	            "DevOps Engineer",
	            "DevOps and CI/CD");

	    createJobRole(
	            "Data Engineer",
	            "Data Engineering");

	    createJobRole(
	            "QA Engineer",
	            "Software Testing");

	    createJobRole(
	            "Engineering Manager",
	            "Engineering Team Management");

	    createJobRole(
	            "HR Executive",
	            "Human Resource Operations");

	    createJobRole(
	            "Project Manager",
	            "Project Planning and Delivery");
	}
	private void initializeTrainings() {

	    createTraining(
	            "Java Fundamentals",
	            "Oracle",
	            "6 Weeks",
	            "BEGINNER",
	            "Core Java programming, OOP, collections, exception handling and Java fundamentals.",
	            "https://dev.java/learn/");

	    createTraining(
	            "Advanced Java Programming",
	            "Oracle",
	            "8 Weeks",
	            "ADVANCED",
	            "Advanced Java concepts including streams, concurrency, generics and modern Java features.",
	            "https://dev.java/learn/");

	    createTraining(
	            "Spring Boot Fundamentals",
	            "Spring",
	            "6 Weeks",
	            "BEGINNER",
	            "Spring Boot fundamentals, dependency injection, REST APIs and application configuration.",
	            "https://spring.io/guides/gs/spring-boot");

	    createTraining(
	            "Spring Boot Advanced Development",
	            "Spring",
	            "8 Weeks",
	            "ADVANCED",
	            "Advanced Spring Boot development including Spring Data JPA, security and microservices.",
	            "https://spring.io/guides");

	    createTraining(
	            "MySQL Fundamentals",
	            "MySQL",
	            "4 Weeks",
	            "BEGINNER",
	            "SQL fundamentals, CRUD operations, joins, aggregation and relational database concepts.",
	            "https://dev.mysql.com/doc/mysql-getting-started/en/");

	    createTraining(
	            "Advanced MySQL and SQL",
	            "MySQL",
	            "6 Weeks",
	            "INTERMEDIATE",
	            "Advanced SQL queries, joins, subqueries, indexing and database optimization.",
	            "https://dev.mysql.com/doc/refman/9.7/en/tutorial.html");
	}
	private void initializeTrainingContent() {

	    createTrainingContent("Java Fundamentals", new String[][] {
	            {"Java Basics", "Variables, data types, operators and program structure.", "30"},
	            {"Object-Oriented Programming", "Classes, objects, inheritance, polymorphism and encapsulation.", "45"},
	            {"Collections", "List, Set, Map and common collection patterns.", "40"},
	            {"Exception Handling", "Checked exceptions, unchecked exceptions and robust error handling.", "30"},
	            {"Java Streams", "Stream pipelines, lambdas, filtering, mapping and collecting.", "45"}
	    });

	    createTrainingContent("Advanced Java Programming", new String[][] {
	            {"Generics", "Generic classes, methods, bounds and type safety.", "40"},
	            {"Functional Programming", "Lambdas, functional interfaces and method references.", "45"},
	            {"Streams and Collectors", "Advanced stream operations and collector patterns.", "50"},
	            {"Concurrency", "Threads, executors, synchronization and concurrent collections.", "60"},
	            {"Modern Java", "Records, sealed classes, pattern matching and modern APIs.", "45"}
	    });

	    createTrainingContent("Spring Boot Fundamentals", new String[][] {
	            {"Spring Boot Setup", "Project structure, starters and application configuration.", "30"},
	            {"Dependency Injection", "Beans, components, constructor injection and configuration.", "40"},
	            {"REST APIs", "Controllers, request mappings, DTOs and HTTP responses.", "45"},
	            {"Validation and Error Handling", "Bean validation and centralized exception handling.", "35"},
	            {"Data Access Basics", "Spring Data repositories and basic persistence.", "50"}
	    });

	    createTrainingContent("Spring Boot Advanced Development", new String[][] {
	            {"Spring Data JPA", "Entity mapping, repositories, relationships and queries.", "55"},
	            {"Security", "Authentication, authorization and securing REST endpoints.", "60"},
	            {"Transactions", "Transactional boundaries, propagation and consistency.", "45"},
	            {"Testing", "Unit tests, integration tests and controller testing.", "45"},
	            {"Microservices", "Service boundaries, communication and production patterns.", "60"}
	    });

	    createTrainingContent("MySQL Fundamentals", new String[][] {
	            {"SQL Basics", "Databases, tables, data types and basic SELECT queries.", "30"},
	            {"CRUD Operations", "INSERT, UPDATE, DELETE and safe data modification.", "35"},
	            {"Joins", "INNER, LEFT, RIGHT joins and relational query patterns.", "45"},
	            {"Aggregation", "GROUP BY, HAVING and aggregate functions.", "35"},
	            {"Database Design", "Keys, relationships and normalization basics.", "45"}
	    });

	    createTrainingContent("Advanced MySQL and SQL", new String[][] {
	            {"Advanced Joins and Subqueries", "Complex joins, correlated subqueries and query composition.", "50"},
	            {"Indexes", "Index design, selectivity and query performance.", "45"},
	            {"Query Optimization", "EXPLAIN, execution plans and optimization techniques.", "55"},
	            {"Transactions and Locking", "Transactions, isolation levels and locking behavior.", "50"},
	            {"Advanced SQL", "CTEs, window functions and advanced analytical queries.", "60"}
	    });
	}

	private void createTrainingContent(String trainingName, String[][] modules) {
	    Training training = trainingRepository.findByTrainingNameIgnoreCase(trainingName)
	            .orElseThrow(() -> new RuntimeException("Training not found: " + trainingName));

	    for (int i = 0; i < modules.length; i++) {
	        int order = i + 1;
	        TrainingModule module = trainingModuleRepository
	                .findByTrainingTrainingIdAndModuleOrder(training.getTrainingId(), order)
	                .orElseGet(TrainingModule::new);

	        module.setTraining(training);
	        module.setModuleTitle(modules[i][0]);
	        module.setDescription(modules[i][1]);
	        module.setModuleOrder(order);
	        module.setEstimatedMinutes(Integer.parseInt(modules[i][2]));
	        module = trainingModuleRepository.save(module);

	        if (trainingResourceRepository.findByModuleModuleIdOrderByResourceOrderAsc(module.getModuleId()).isEmpty()) {
	            String query = modules[i][0].replace(" ", "+") + "+" + trainingName.replace(" ", "+");
	            createResource(module, 1, "Video lessons", TrainingResource.ResourceType.VIDEO,
	                    "https://www.youtube.com/results?search_query=" + query,
	                    "Video learning resources for this module.");
	            createResource(module, 2, "Reference article", TrainingResource.ResourceType.ARTICLE,
	                    articleUrl(trainingName, order), "Reference reading and examples.");
	            createResource(module, 3, "Course notes (PDF)", TrainingResource.ResourceType.PDF,
                    pdfUrl(trainingName), "Reference documentation in PDF format.");
            createResource(module, 4, "Practice", TrainingResource.ResourceType.PRACTICE,
                    practiceUrl(trainingName, order), "Practice and exercises for the module.");
	        }
	    }
	}

	private void createResource(TrainingModule module, int order, String title,
	        TrainingResource.ResourceType type, String url, String description) {
	    TrainingResource resource = new TrainingResource();
	    resource.setModule(module);
	    resource.setTitle(title);
	    resource.setResourceType(type);
	    resource.setResourceUrl(url);
	    resource.setDescription(description);
	    resource.setResourceOrder(order);
	    trainingResourceRepository.save(resource);
	}

	private String articleUrl(String trainingName, int order) {
	    if (trainingName.toLowerCase().contains("mysql")) {
	        return "https://www.geeksforgeeks.org/mysql/";
	    }
	    if (trainingName.toLowerCase().contains("spring")) {
	        return "https://www.geeksforgeeks.org/spring/";
	    }
	    return "https://www.geeksforgeeks.org/java/";
	}

	private String pdfUrl(String trainingName) {
	    String name = trainingName.toLowerCase();
	    if (name.contains("spring boot")) {
	        return "https://docs.spring.io/spring-boot/docs/current/reference/pdf/spring-boot-reference.pdf";
	    }
	    if (name.contains("spring")) {
	        return "https://docs.spring.io/spring-framework/docs/current/reference/pdf/spring-framework-reference.pdf";
	    }
	    if (name.contains("mysql")) {
	        return "https://downloads.mysql.com/docs/mysql-tutorial-excerpt-8.4-en.pdf";
	    }
	    return "https://docs.oracle.com/javase/specs/jls/se21/jls21.pdf";
	}

	private String practiceUrl(String trainingName, int order) {
	    if (trainingName.toLowerCase().contains("mysql")) {
	        return "https://www.w3schools.com/mysql/";
	    }
	    if (trainingName.toLowerCase().contains("spring")) {
	        return "https://spring.io/guides";
	    }
	    return "https://dev.java/learn/";
	}

	private void initializeTrainingSkills() {

	    mapTrainingToSkill(
	            "Java Fundamentals",
	            "Java");

	    mapTrainingToSkill(
	            "Advanced Java Programming",
	            "Java");

	    mapTrainingToSkill(
	            "Spring Boot Fundamentals",
	            "Spring Boot");

	    mapTrainingToSkill(
	            "Spring Boot Advanced Development",
	            "Spring Boot");

	    mapTrainingToSkill(
	            "MySQL Fundamentals",
	            "MySQL");

	    mapTrainingToSkill(
	            "Advanced MySQL and SQL",
	            "MySQL");
	}
	
	private void createUser(String employeeCode, String firstName, String lastName, String email, String password,
			RoleType roleType, String departmentName) {

		if (employeeRepository.existsByOfficialEmail(email)) {
			return;
		}

		Role role = roleRepository.findByRoleName(roleType).orElseThrow();

		Department department = departmentRepository.findByDepartmentName(departmentName).orElseThrow();

		Employee employee = new Employee();

		employee.setEmployeeCode(employeeCode);
		employee.setFirstName(firstName);
		employee.setLastName(lastName);
		employee.setOfficialEmail(email);

		employee.setPassword(passwordEncoder.encode(password));

		employee.setRole(role);
		employee.setDepartment(department);
		employee.setStatus(AccountStatus.APPROVED);

		employeeRepository.save(employee);
	}
	private void createJobRole(
	        String jobRoleName,
	        String description) {

	    if (jobRoleRepository
	            .findByJobRoleNameIgnoreCase(jobRoleName)
	            .isPresent()) {

	        return;
	    }

	    JobRole jobRole = new JobRole();

	    jobRole.setJobRoleName(jobRoleName);
	    jobRole.setDescription(description);

	    jobRoleRepository.save(jobRole);
	}
	private void initializeSelfAssessments() {
		createJavaAssessment();
		createSpringBootAssessment();
		createSpringSecurityAssessment();
		createRestApiAssessment();
		createMicroservicesAssessment();
		createMySqlAssessment();
		createPostgreSqlAssessment();
		createGitAssessment();
		createMavenAssessment();
		createDockerAssessment();
		createKubernetesAssessment();
		createAwsAssessment();
	}

	private void initializePeerAssessments() {

    createJavaPeerAssessment();
    createSpringBootPeerAssessment();
    createSpringSecurityPeerAssessment();
    createRestApiPeerAssessment();
    createMicroservicesPeerAssessment();
    createMySqlPeerAssessment();
    createPostgreSqlPeerAssessment();
    createGitPeerAssessment();
    createMavenPeerAssessment();
    createDockerPeerAssessment();
    createKubernetesPeerAssessment();
    createAwsPeerAssessment();
}

private void createPeerAssessment(
        String skillName,
        String assessmentName,
        String[] questions) {

    Skill skill = skillRepository
            .findBySkillNameIgnoreCase(skillName)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Skill not found: " + skillName));

    Assessment assessment =
            assessmentRepository
                    .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                            skill.getSkillId(),
                            Assessment.AssessmentType.PEER)
                    .orElseGet(Assessment::new);

    assessment.setSkill(skill);
    assessment.setAssessmentType(
            Assessment.AssessmentType.PEER
    );
    assessment.setAssessmentName(assessmentName);
    assessment.setTotalMarks(questions.length * 5);
    assessment.setActive(true);

    assessment =
            assessmentRepository.save(assessment);

    /*
     * Do not create duplicate questions
     * when the application restarts.
     */
    if (!assessmentQuestionRepository
            .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                    assessment.getAssessmentId())
            .isEmpty()) {

        return;
    }

    for (int i = 0; i < questions.length; i++) {

        AssessmentQuestion question =
                new AssessmentQuestion();

        question.setAssessment(assessment);

        question.setQuestionType(
                AssessmentQuestion.QuestionType.RATING
        );

        /*
         * Peer assessment uses competency ratings,
         * so difficulty is not actually meaningful.
         * The current entity requires a value,
         * therefore EASY is used.
         */
        question.setDifficulty(
                AssessmentQuestion.Difficulty.EASY
        );

        question.setQuestionText(questions[i]);

        /*
         * Rating scale:
         * 1 = Beginner
         * 2 = Developing
         * 3 = Competent
         * 4 = Advanced
         * 5 = Expert
         */
        question.setMarks(5);

        question.setQuestionOrder(i + 1);

        assessmentQuestionRepository.save(question);
    }
}

private void createJavaPeerAssessment() {

    createPeerAssessment(
            "Java",
            "Java Peer Assessment",
            new String[] {
                    "Understands Java fundamentals and core concepts.",
                    "Applies object-oriented programming principles effectively.",
                    "Writes clean, readable and maintainable Java code.",
                    "Handles exceptions and edge cases appropriately.",
                    "Uses Java collections and standard APIs effectively."
            }
    );
}

private void createSpringBootPeerAssessment() {

    createPeerAssessment(
            "Spring Boot",
            "Spring Boot Peer Assessment",
            new String[] {
                    "Understands Spring Boot application structure.",
                    "Creates and maintains REST controllers effectively.",
                    "Uses dependency injection appropriately.",
                    "Handles configuration and application properties correctly.",
                    "Writes maintainable Spring Boot services and components."
            }
    );
}

private void createSpringSecurityPeerAssessment() {

    createPeerAssessment(
            "Spring Security",
            "Spring Security Peer Assessment",
            new String[] {
                    "Understands authentication and authorization concepts.",
                    "Configures Spring Security appropriately.",
                    "Applies role-based access control correctly.",
                    "Handles authentication errors and security concerns.",
                    "Follows secure coding practices in Spring applications."
            }
    );
}

private void createRestApiPeerAssessment() {

    createPeerAssessment(
            "REST API",
            "REST API Peer Assessment",
            new String[] {
                    "Understands REST architectural principles.",
                    "Uses HTTP methods correctly.",
                    "Designs meaningful and consistent API endpoints.",
                    "Handles API errors and HTTP status codes appropriately.",
                    "Creates maintainable API request and response structures."
            }
    );
}

private void createMicroservicesPeerAssessment() {

    createPeerAssessment(
            "Microservices",
            "Microservices Peer Assessment",
            new String[] {
                    "Understands microservices architecture concepts.",
                    "Identifies appropriate service boundaries.",
                    "Handles service-to-service communication effectively.",
                    "Understands distributed system challenges.",
                    "Applies resilience and monitoring practices appropriately."
            }
    );
}

private void createMySqlPeerAssessment() {

    createPeerAssessment(
            "MySQL",
            "MySQL Peer Assessment",
            new String[] {
                    "Writes effective SQL queries.",
                    "Understands relational database concepts.",
                    "Uses joins, filtering and aggregation correctly.",
                    "Understands indexing and query performance.",
                    "Maintains data integrity using appropriate constraints."
            }
    );
}

private void createPostgreSqlPeerAssessment() {

    createPeerAssessment(
            "PostgreSQL",
            "PostgreSQL Peer Assessment",
            new String[] {
                    "Understands PostgreSQL database concepts.",
                    "Writes effective PostgreSQL queries.",
                    "Uses joins, constraints and indexes appropriately.",
                    "Uses PostgreSQL data types and features effectively.",
                    "Handles database performance and data integrity appropriately."
            }
    );
}

private void createGitPeerAssessment() {

    createPeerAssessment(
            "Git",
            "Git Peer Assessment",
            new String[] {
                    "Understands Git version control concepts.",
                    "Uses branches and merges effectively.",
                    "Writes meaningful and informative commit messages.",
                    "Handles merge conflicts appropriately.",
                    "Follows good Git collaboration practices."
            }
    );
}
private void createMavenPeerAssessment() {

    createPeerAssessment(
            "Maven",
            "Maven Peer Assessment",
            new String[] {
                    "Understands Maven project structure.",
                    "Manages project dependencies correctly.",
                    "Understands Maven lifecycle phases.",
                    "Maintains an appropriate pom.xml configuration.",
                    "Uses Maven effectively for builds and testing."
            }
    );
}

private void createDockerPeerAssessment() {

    createPeerAssessment(
            "Docker",
            "Docker Peer Assessment",
            new String[] {
                    "Understands Docker containers and images.",
                    "Writes and maintains Dockerfiles effectively.",
                    "Uses Docker Compose appropriately.",
                    "Handles container configuration and networking.",
                    "Applies good practices for containerized applications."
            }
    );
}

private void createKubernetesPeerAssessment() {

    createPeerAssessment(
            "Kubernetes",
            "Kubernetes Peer Assessment",
            new String[] {
                    "Understands Kubernetes architecture and components.",
                    "Creates and manages Kubernetes workloads.",
                    "Understands Services and networking.",
                    "Uses ConfigMaps and Secrets appropriately.",
                    "Understands scaling and deployment concepts."
            }
    );
}

private void createAwsPeerAssessment() {

    createPeerAssessment(
            "AWS",
            "AWS Peer Assessment",
            new String[] {
                    "Understands fundamental AWS cloud concepts.",
                    "Selects appropriate AWS services for application needs.",
                    "Understands IAM and access control.",
                    "Understands basic cloud deployment practices.",
                    "Considers scalability, reliability and cost."
            }
    );
}


	private void createJavaAssessment() {
		Skill skill = skillRepository.findBySkillNameIgnoreCase("Java").orElseThrow();
		Assessment a = assessmentRepository
                .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                        skill.getSkillId(),
                        Assessment.AssessmentType.SELF)
                .orElseGet(Assessment::new);
		a.setSkill(skill);
		a.setAssessmentType(Assessment.AssessmentType.SELF);
		a.setAssessmentName("Java Technical Self Assessment");
		a.setTotalMarks(50);
		a.setActive(true);
		a=assessmentRepository.save(a);
		if (!assessmentQuestionRepository.findByAssessmentAssessmentIdOrderByQuestionOrderAsc(a.getAssessmentId()).isEmpty()) return;
		String[][] mcqs = new String[][] {
			{"Which keyword is used to inherit a class in Java?","extends","implement","inherits","super","1"},
			{"Which collection does not allow duplicate elements?","List","Set","Map","Queue","2"},
			{"What is the default value of an instance int variable?","0","1","null","undefined","1"},
			{"Which method starts a Java thread?","run()","start()","begin()","execute()","2"},
			{"Which concept allows the same method name with different parameters?","Inheritance","Encapsulation","Overloading","Abstraction","3"},
			{"Which interface is the root of the Java collection hierarchy?","Collection","Iterable","List","Map","2"},
			{"Which keyword prevents a class from being inherited?","static","const","final","private","3"},
			{"Which exception is unchecked?","IOException","SQLException","ClassNotFoundException","NullPointerException","4"},
			{"Which Java feature provides automatic memory management?","Generics","Garbage collection","Reflection","Serialization","2"},
			{"Which type stores key-value pairs?","Set","List","Map","Queue","3"},
			{"What does JVM stand for?","Java Variable Machine","Java Virtual Machine","Java Verified Machine","Java Visual Machine","2"},
			{"Which access modifier gives the widest visibility?","private","protected","default","public","4"},
			{"Which keyword refers to the current object?","this","self","current","object","1"},
			{"Which class is commonly used for mutable strings?","String","StringBuilder","Character","Text","2"},
			{"Which Stream operation transforms each element?","filter","map","reduce","sorted","2"}
		};
		for(int i=0;i<mcqs.length;i++){String[] m=mcqs[i]; AssessmentQuestion q=new AssessmentQuestion();q.setAssessment(a);q.setQuestionType(AssessmentQuestion.QuestionType.MCQ);q.setDifficulty(i<5?AssessmentQuestion.Difficulty.EASY:i<10?AssessmentQuestion.Difficulty.INTERMEDIATE:AssessmentQuestion.Difficulty.HARD);q.setQuestionText(m[0]);q.setMarks(2);q.setQuestionOrder(i+1);q=assessmentQuestionRepository.save(q);String[] opts={m[1],m[2],m[3],m[4]};int correct=Integer.parseInt(m[5]);for(int j=0;j<4;j++){AssessmentOption o=new AssessmentOption();o.setQuestion(q);o.setOptionText(opts[j]);o.setOptionOrder(j+1);o.setCorrect(j+1==correct);assessmentOptionRepository.save(o);}}
		createCodingQuestion(a,16,"EASY",5,"Write a Java program to find the largest element in an integer array.","public class Main {\n    public static void main(String[] args) {\n        // write your solution\n    }\n}");
		createCodingQuestion(a,17,"INTERMEDIATE",7,"Write a Java program to find the first non-repeating character in a string.","public class Main {\n    public static void main(String[] args) {\n        // write your solution\n    }\n}");
		createCodingQuestion(a,18,"HARD",8,"Implement an LRU cache using appropriate Java data structures.","import java.util.*;\npublic class Main {\n    // implement your LRU cache\n}");
	}

	private void createSpringBootAssessment() {
		createTechnicalAssessment("Spring Boot", "Spring Boot Technical Self Assessment",
				new String[][] {
					{"Which annotation is commonly used to mark the main Spring Boot application class?", "@SpringBootApplication", "@EnableBoot", "@SpringMain", "@BootApplicationOnly", "1"},
					{"Which dependency injection style is generally preferred for required dependencies?", "Field injection", "Constructor injection", "Static injection", "XML-only injection", "2"},
					{"Which annotation creates a REST controller?", "@Controller", "@RestController", "@Service", "@Repository", "2"},
					{"Which annotation maps an HTTP GET request to a method?", "@GetMapping", "@ReadMapping", "@HttpGet", "@FetchMapping", "1"},
					{"Which file is commonly used for Spring Boot application properties?", "pom.xml", "application.properties", "web.xml", "settings.java", "2"},
					{"Which annotation is used to define a Spring-managed service class?", "@Service", "@BeanService", "@ComponentService", "@ServiceBeanOnly", "1"},
					{"Which annotation binds a path variable?", "@RequestParam", "@PathVariable", "@RequestBody", "@PathBody", "2"},
					{"Which annotation binds JSON request data to a Java object?", "@RequestBody", "@JsonInput", "@BodyParam", "@RequestJson", "1"},
					{"Which project management file is used by Maven-based Spring Boot projects?", "build.gradle", "pom.xml", "spring.xml", "boot.xml", "2"},
					{"Which annotation can define a configuration class?", "@Configuration", "@ConfigureOnly", "@SpringConfigFile", "@AppConfigXml", "1"},
					{"What does Spring Boot auto-configuration primarily do?", "Deletes database tables", "Automatically configures application components based on the classpath", "Compiles Java manually", "Creates Git branches", "2"},
					{"Which annotation is commonly used for global exception handling?", "@ControllerAdvice", "@ExceptionGlobal", "@HandleAll", "@GlobalCatchOnly", "1"},
					{"Which annotation can validate a request object using Bean Validation?", "@Valid", "@CheckRequest", "@ValidateBodyOnly", "@Verify", "1"},
					{"Which annotation exposes a method as a Spring bean from a configuration class?", "@Bean", "@Object", "@ComponentMethod", "@SpringBeanOnly", "1"},
					{"Which embedded server is commonly used by Spring Boot web applications by default?", "Tomcat", "GlassFish", "IIS", "WebLogic", "1"}
				},
				new String[] {
					"Create a Spring Boot REST endpoint that returns a list of employees.",
					"Create a Spring Boot service and repository flow for finding an employee by ID with proper not-found handling.",
					"Implement a Spring Boot REST API with validation and centralized exception handling for an employee creation request."
				});
	}

	private void createSpringSecurityAssessment() {
		createTechnicalAssessment("Spring Security", "Spring Security Technical Self Assessment",
				new String[][] {
					{"What is the primary purpose of Spring Security?", "Database migration", "Authentication and authorization", "UI styling", "Build packaging", "2"},
					{"Which interface is commonly used to represent an authenticated user?", "UserDetails", "SecurityUser", "AuthUserBean", "LoginDetailsOnly", "1"},
					{"Which class is commonly used to configure HTTP security in modern Spring Security?", "SecurityFilterChain", "HttpSecurityConfigOnly", "SecurityManagerBean", "WebAuthChainOnly", "1"},
					{"Which object is used to configure authorization rules?", "HttpSecurity", "JdbcTemplate", "RestTemplate", "ObjectMapper", "1"},
					{"Authentication primarily answers which question?", "What data type is this?", "Who are you?", "Where is the database?", "Which CSS file loads?", "2"},
					{"Authorization primarily answers which question?", "Who are you?", "What are you allowed to do?", "What is your password?", "Which server is running?", "2"},
					{"Which annotation can enable method-level security?", "@EnableMethodSecurity", "@EnableMethodAuthOnly", "@SecurityMethods", "@MethodSecurityOn", "1"},
					{"Which annotation can restrict a method based on an expression?", "@PreAuthorize", "@BeforeAuthOnly", "@AllowRole", "@SecurityCheckOnly", "1"},
					{"Which authentication mechanism is commonly used for stateless REST APIs?", "HTTP Basic only", "JWT/token-based authentication", "Session-only authentication", "Form HTML only", "2"},
					{"What is the role of PasswordEncoder?", "Encrypt database tables", "Hash and verify passwords", "Create JWT claims", "Validate URLs", "2"},
					{"Which password storage approach is recommended?", "Plain text", "Reversible Base64", "One-way password hashing", "Store in source code", "3"},
					{"What does CSRF protection defend against?", "Cross-Site Request Forgery", "SQL compilation failure", "Docker image corruption", "Java class loading", "1"},
					{"In a stateless JWT API, where is authentication state commonly carried?", "JWT/token sent with the request", "Server session only", "HTML title", "Database table name", "1"},
					{"Which HTTP status commonly indicates an unauthenticated request?", "200", "201", "401", "500", "3"},
					{"Which HTTP status commonly indicates authenticated but forbidden access?", "201", "301", "403", "404", "3"}
				},
				new String[] {
					"Configure Spring Security so public endpoints are accessible while employee endpoints require authentication.",
					"Implement JWT authentication in a Spring Boot API and configure a security filter to authenticate requests.",
					"Implement role-based authorization for ADMIN, MANAGER and EMPLOYEE endpoints using Spring Security."
				});
	}

	private void createRestApiAssessment() {
		createTechnicalAssessment("REST API", "REST API Technical Self Assessment",
				new String[][] {
					{"What does REST stand for?", "Remote Execution State Transfer", "Representational State Transfer", "Resource Execution Service Transfer", "Reliable State Transport", "2"},
					{"Which HTTP method is commonly used to retrieve a resource?", "GET", "POST", "PATCH", "DELETE", "1"},
					{"Which HTTP method is commonly used to create a resource?", "GET", "POST", "HEAD", "OPTIONS", "2"},
					{"Which HTTP method is commonly used to completely replace a resource?", "PUT", "GET", "TRACE", "HEAD", "1"},
					{"Which HTTP method is commonly used to partially update a resource?", "PATCH", "OPTIONS", "HEAD", "TRACE", "1"},
					{"Which HTTP method is commonly used to delete a resource?", "DELETE", "REMOVE", "DROP", "CLEAR", "1"},
					{"Which status code normally represents successful retrieval?", "200", "201", "204", "404", "1"},
					{"Which status code normally represents successful resource creation?", "200", "201", "301", "409", "2"},
					{"Which status code normally means the requested resource was not found?", "201", "204", "404", "500", "3"},
					{"Which status code commonly represents a server-side error?", "400", "401", "404", "500", "4"},
					{"What is commonly used to represent structured API data?", "JSON", "CSS", "PNG", "JAR only", "1"},
					{"What does an API endpoint identify?", "A resource or operation exposed by the API", "A Java variable only", "A database password", "A Docker image layer", "1"},
					{"Which HTTP header commonly carries a bearer access token?", "Authorization", "Location", "Accept-Language", "Content-Length-Only", "1"},
					{"What is idempotency most closely related to?", "Repeating a request producing the same intended resource state", "Increasing CPU speed", "Encrypting passwords", "Creating random IDs", "1"},
					{"Which content type is commonly used when sending JSON?", "text/html", "application/json", "image/png", "application/xml-only", "2"}
				},
				new String[] {
					"Build a REST API endpoint to create and retrieve employee records using Spring Boot.",
					"Implement pagination and filtering for a REST endpoint that returns employees.",
					"Design and implement a complete REST API for employee management with validation, proper status codes and centralized error responses."
				});
	}

	private void createMicroservicesAssessment() {
		createTechnicalAssessment("Microservices", "Microservices Technical Self Assessment",
				new String[][] {
					{"What is a key characteristic of microservices architecture?", "One deployable unit only", "Small independently deployable services", "No APIs", "No databases", "2"},
					{"What is service discovery used for?", "Finding service instances dynamically", "Compiling Java", "Building Docker images", "Encrypting passwords", "1"},
					{"Which component can act as an API gateway?", "Spring Cloud Gateway", "JPA Entity", "JUnit", "Maven Compiler", "1"},
					{"Why is centralized configuration useful?", "To manage configuration consistently across services", "To replace all databases", "To compile code", "To create HTML", "1"},
					{"What is inter-service communication?", "Communication between independent services", "Communication between CPU cores only", "Git commit history", "Database indexing", "1"},
					{"What problem can a circuit breaker help address?", "Repeated calls to an unhealthy service", "SQL syntax highlighting", "Password hashing", "Frontend CSS", "1"},
					{"What does service resilience focus on?", "Continuing or recovering gracefully when dependencies fail", "Increasing file size", "Removing APIs", "Disabling logs", "1"},
					{"Which pattern can asynchronously distribute events?", "Message broker/event streaming", "CSS selector", "JPA getter", "Maven scope", "1"},
					{"What is a benefit of independent deployment?", "A service can be released without redeploying the entire system", "Every service must share one binary", "All code must be in one class", "Databases disappear", "1"},
					{"What is distributed tracing used for?", "Following a request across multiple services", "Compiling containers", "Creating passwords", "Formatting JSON only", "1"},
					{"Why should microservices avoid excessive synchronous dependencies?", "To reduce cascading failures and tight coupling", "To increase source code duplication", "To disable monitoring", "To remove service discovery", "1"},
					{"What is a common responsibility of an API gateway?", "Routing and cross-cutting concerns for client requests", "Replacing every service database", "Writing Java bytecode", "Managing Git commits", "1"},
					{"What is eventual consistency?", "Data across systems may become consistent after propagation", "Every write is instantly identical everywhere", "No data is stored", "All services use one thread", "1"},
					{"What is containerization useful for microservices?", "Packaging services with their runtime dependencies", "Replacing source control", "Removing APIs", "Generating SQL automatically", "1"},
					{"What is observability concerned with?", "Understanding system behavior through logs, metrics and traces", "Only writing unit tests", "Only database backups", "Only CSS styling", "1"}
				},
				new String[] {
					"Create two Spring Boot services that communicate through a REST API and handle a downstream failure.",
					"Design a microservice system using service discovery and an API gateway, and implement the request flow.",
					"Implement a resilient microservice workflow with gateway routing, service-to-service communication, timeout handling and circuit-breaker behavior."
				});
	}

	private void createDockerAssessment() {
		createTechnicalAssessment("Docker", "Docker Technical Self Assessment",
				new String[][] {
					{"What is Docker primarily used for?", "Containerization", "Database administration", "UI design", "Version control", "1"},
					{"Which file commonly defines Docker image build instructions?", "Dockerfile", "docker.xml", "container.json", "image.yaml", "1"},
					{"Which command builds a Docker image?", "docker build", "docker make", "docker image-create", "docker compile", "1"},
					{"Which command lists running containers?", "docker ps", "docker list-running-only", "docker containers", "docker show", "1"},
					{"Which command starts a stopped container?", "docker start", "docker run-stopped", "docker resume", "docker activate", "1"},
					{"What is a Docker image?", "A template used to create containers", "A running process only", "A database schema", "A Git branch", "1"},
					{"What is a Docker container?", "A running instance of an image", "A source-code repository", "A database index", "A Maven plugin", "1"},
					{"Which command downloads an image from a registry?", "docker pull", "docker fetch-image", "docker download", "docker get", "1"},
					{"Which command uploads an image to a registry?", "docker push", "docker upload-image", "docker send", "docker publish-container", "1"},
					{"Which instruction sets the base image in a Dockerfile?", "FROM", "BASE", "IMAGE", "START", "1"},
					{"Which Dockerfile instruction copies files into an image?", "COPY", "MOVE", "ADD-FILE", "TRANSFER", "1"},
					{"Which instruction defines the default command for a container?", "CMD", "RUNONLY", "STARTUP", "DEFAULT-COMMAND", "1"},
					{"What is Docker Compose commonly used for?", "Defining and running multi-container applications", "Compiling Java only", "Managing Git branches", "Creating SQL indexes", "1"},
					{"What does container isolation provide?", "Separation of application processes and dependencies", "Automatic database backups", "Source code encryption", "Git history rewriting", "1"},
					{"Why are Docker volumes used?", "To persist data outside a container's writable layer", "To compile images faster", "To create Git tags", "To replace Dockerfiles", "1"}
				},
				new String[] {
					"Write a Dockerfile to containerize a Spring Boot application and expose its HTTP port.",
					"Create a Docker Compose configuration for a Spring Boot application and PostgreSQL database.",
					"Design a production-oriented multi-container deployment with networking, persistent volumes, health checks and environment-based configuration."
				});
	}

	private void createKubernetesAssessment() {
		createTechnicalAssessment("Kubernetes", "Kubernetes Technical Self Assessment",
				new String[][] {
					{"What is Kubernetes primarily used for?", "Container orchestration", "Source control", "Database indexing", "Java compilation", "1"},
					{"What is a Pod in Kubernetes?", "The smallest deployable unit that can contain one or more containers", "A Docker image registry", "A Git repository", "A database table", "1"},
					{"Which resource commonly manages replicated application Pods?", "Deployment", "Repository", "ConfigMapOnly", "VolumeOnly", "1"},
					{"Which resource provides a stable network endpoint for Pods?", "Service", "PodTemplate", "Secret", "JobOnly", "1"},
					{"Which command commonly lists Pods?", "kubectl get pods", "kubectl list pods", "kube pods", "kubectl show pods-only", "1"},
					{"Which command applies a Kubernetes manifest?", "kubectl apply", "kubectl deploy-file", "kubectl create-manifest-only", "kubectl run-yaml", "1"},
					{"What is a Namespace used for?", "Logical isolation and organization of Kubernetes resources", "Container compilation", "Git branching", "Database normalization", "1"},
					{"Which resource stores non-sensitive configuration data?", "ConfigMap", "Secret", "ConfigStoreOnly", "ParameterPod", "1"},
					{"Which resource is intended for sensitive configuration values?", "Secret", "ConfigMap", "VolumeClaimOnly", "Service", "1"},
					{"What does a ReplicaSet help maintain?", "A desired number of Pod replicas", "A Git commit history", "A Docker registry", "A database connection pool", "1"},
					{"What is horizontal pod autoscaling used for?", "Adjusting Pod replicas based on resource or custom metrics", "Changing container images manually", "Creating namespaces", "Managing Git tags", "1"},
					{"What does a readiness probe indicate?", "Whether a container is ready to receive traffic", "Whether an image exists", "Whether a Git branch is clean", "Whether a node is powered off", "1"},
					{"What does a liveness probe help determine?", "Whether a container is still healthy and should continue running", "Whether a user is authenticated", "Whether a Dockerfile is valid", "Whether a Service has a DNS name", "1"},
					{"What is a Kubernetes Ingress commonly used for?", "Routing external HTTP/HTTPS traffic to Services", "Creating Docker images", "Managing Git commits", "Storing passwords in source code", "1"},
					{"What is a PersistentVolumeClaim used for?", "Requesting persistent storage for workloads", "Creating a Pod", "Defining a Service route", "Building a Docker image", "1"}
				},
				new String[] {
					"Create Kubernetes Deployment and Service manifests for a Spring Boot application.",
					"Deploy a Spring Boot application with ConfigMap, Secret, readiness probe and liveness probe.",
					"Design a Kubernetes deployment with multiple replicas, rolling updates, autoscaling, persistent storage and external traffic routing."
				});
	}

	private void createAwsAssessment() {
		createTechnicalAssessment("AWS", "AWS Technical Self Assessment",
				new String[][] {
					{"What is AWS?", "A cloud computing platform", "A Java framework", "A Git client", "A database language", "1"},
					{"Which AWS service provides virtual servers?", "Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon Route 53", "1"},
					{"Which AWS service provides object storage?", "Amazon S3", "Amazon EC2", "Amazon EKS", "Amazon VPC", "1"},
					{"Which AWS service is a managed relational database service?", "Amazon RDS", "Amazon S3", "Amazon EC2", "Amazon CloudFront", "1"},
					{"Which AWS service provides DNS management?", "Amazon Route 53", "Amazon S3", "Amazon EBS", "Amazon SQS", "1"},
					{"What is an AWS Region?", "A geographic area containing AWS infrastructure", "A single EC2 process", "A database table", "A Git branch", "1"},
					{"What is an Availability Zone?", "An isolated location within an AWS Region", "A global DNS record", "A Docker container", "A user role only", "1"},
					{"What is IAM used for?", "Managing identities and permissions", "Object storage", "Container builds", "Database backups only", "1"},
					{"What does least privilege mean in IAM?", "Granting only the permissions required", "Giving every user administrator access", "Disabling authentication", "Sharing root credentials", "1"},
					{"Which AWS service is commonly used for container orchestration with Kubernetes?", "Amazon EKS", "Amazon S3", "Amazon RDS", "Amazon SES", "1"},
					{"Which AWS service provides a content delivery network?", "Amazon CloudFront", "Amazon SQS", "Amazon RDS", "Amazon IAM", "1"},
					{"Which AWS service is commonly used for message queues?", "Amazon SQS", "Amazon S3", "Amazon EC2", "Amazon Route 53", "1"},
					{"Which AWS service provides serverless function execution?", "AWS Lambda", "Amazon EC2 only", "Amazon RDS", "Amazon VPC", "1"},
					{"What is an Amazon VPC?", "A logically isolated virtual network", "An object storage bucket", "A Git repository", "A Java package", "1"},
					{"Which AWS service can distribute incoming traffic across multiple targets?", "Elastic Load Balancing", "Amazon S3", "Amazon IAM", "Amazon SQS", "1"}
				},
				new String[] {
					"Deploy a Spring Boot application on an EC2 instance and configure access to its HTTP port.",
					"Design an AWS architecture using EC2, RDS, S3 and IAM with secure network and permission configuration.",
					"Design a highly available Spring Boot application on AWS using load balancing, multiple Availability Zones, managed database, object storage, IAM and monitoring."
				});
	}

	private void createTechnicalAssessment(String skillName, String assessmentName,
			String[][] mcqs, String[] codingQuestions) {

		Skill skill = skillRepository.findBySkillNameIgnoreCase(skillName)
				.orElseThrow(() -> new RuntimeException("Skill not found: " + skillName));

		Assessment a = assessmentRepository
				.findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
						skill.getSkillId(),
						Assessment.AssessmentType.SELF)
				.orElseGet(Assessment::new);

		a.setSkill(skill);
		a.setAssessmentType(Assessment.AssessmentType.SELF);
		a.setAssessmentName(assessmentName);
		a.setTotalMarks(50);
		a.setActive(true);
		a = assessmentRepository.save(a);

		if (!assessmentQuestionRepository.findByAssessmentAssessmentIdOrderByQuestionOrderAsc(a.getAssessmentId()).isEmpty()) {
			return;
		}

		for (int i = 0; i < mcqs.length; i++) {
			String[] m = mcqs[i];
			AssessmentQuestion q = new AssessmentQuestion();
			q.setAssessment(a);
			q.setQuestionType(AssessmentQuestion.QuestionType.MCQ);
			q.setDifficulty(i < 5 ? AssessmentQuestion.Difficulty.EASY
					: i < 10 ? AssessmentQuestion.Difficulty.INTERMEDIATE
					: AssessmentQuestion.Difficulty.HARD);
			q.setQuestionText(m[0]);
			q.setMarks(2);
			q.setQuestionOrder(i + 1);
			q = assessmentQuestionRepository.save(q);

			String[] options = {m[1], m[2], m[3], m[4]};
			int correct = Integer.parseInt(m[5]);

			for (int j = 0; j < 4; j++) {
				AssessmentOption o = new AssessmentOption();
				o.setQuestion(q);
				o.setOptionText(options[j]);
				o.setOptionOrder(j + 1);
				o.setCorrect(j + 1 == correct);
				assessmentOptionRepository.save(o);
			}
		}

		createCodingQuestion(a, 16, "EASY", 5, codingQuestions[0],
				"public class Main {\n    public static void main(String[] args) {\n        // write your solution\n    }\n}");
		createCodingQuestion(a, 17, "INTERMEDIATE", 7, codingQuestions[1],
				"public class Main {\n    public static void main(String[] args) {\n        // write your solution\n    }\n}");
		createCodingQuestion(a, 18, "HARD", 8, codingQuestions[2],
				"public class Main {\n    public static void main(String[] args) {\n        // write your solution\n    }\n}");
	}


	private void createMySqlAssessment() {
		createTechnicalAssessment("MySQL", "MySQL Technical Self Assessment",
				new String[][] {
					{"Which SQL statement is used to retrieve data?", "SELECT", "GET", "FETCH ALL ONLY", "READ", "1"},
					{"Which clause filters rows before grouping?", "WHERE", "HAVING", "GROUP BY", "ORDER BY", "1"},
					{"Which clause groups rows with the same values?", "GROUP BY", "ORDER BY", "GROUP", "COLLECT BY", "1"},
					{"Which clause filters grouped results?", "WHERE", "HAVING", "FILTER GROUP", "AFTER GROUP", "2"},
					{"Which keyword removes duplicate rows from a SELECT result?", "UNIQUE", "DISTINCT", "REMOVE DUPLICATES", "ONLY", "2"},
					{"Which constraint uniquely identifies each row?", "FOREIGN KEY", "CHECK", "PRIMARY KEY", "DEFAULT", "3"},
					{"Which constraint links a column to a key in another table?", "FOREIGN KEY", "PRIMARY KEY", "UNIQUE", "INDEX KEY", "1"},
					{"Which command adds new rows to a table?", "INSERT", "ADD", "APPEND ROW", "CREATE ROW", "1"},
					{"Which command modifies existing rows?", "UPDATE", "MODIFY TABLE", "CHANGE ROW", "ALTER ROW", "1"},
					{"Which command removes selected rows?", "DELETE", "DROP ROWS", "REMOVE TABLE", "CLEAR ROW", "1"},
					{"Which JOIN returns matching rows from both tables?", "INNER JOIN", "LEFT JOIN", "FULL JOIN", "CROSS JOIN", "1"},
					{"Which aggregate function counts rows?", "SUM()", "COUNT()", "TOTAL()", "ROWS()", "2"},
					{"Which command is used to create a table?", "MAKE TABLE", "NEW TABLE", "CREATE TABLE", "BUILD TABLE", "3"},
					{"Which index type is commonly created using CREATE INDEX?", "Secondary index", "Memory variable", "Stored procedure", "View only", "1"},
					{"What is normalization mainly intended to reduce?", "Network speed", "Data redundancy", "SQL keywords", "Table names", "2"}
				},
				new String[] {
					"Create a MySQL table for employees with a primary key and write INSERT and SELECT queries.",
					"Write a query using JOIN, GROUP BY and HAVING to produce department-wise employee counts.",
					"Design and query an employee database using multiple related tables, indexes and transaction handling."
				});
	}

	private void createPostgreSqlAssessment() {
		createTechnicalAssessment("PostgreSQL", "PostgreSQL Technical Self Assessment",
				new String[][] {
					{"What is PostgreSQL?", "A relational database management system", "A Java compiler", "A container runtime", "A web browser", "1"},
					{"Which command retrieves rows from a PostgreSQL table?", "SELECT", "GET", "READ", "FETCH TABLE ONLY", "1"},
					{"Which PostgreSQL data type is commonly used for variable-length text?", "VARCHAR", "TEXTONLY", "STRING128", "CHARSET", "1"},
					{"Which data type is commonly used for true/false values?", "BOOLEAN", "BITTEXT", "BOOLSTRING", "LOGICAL", "1"},
					{"Which clause filters rows?", "WHERE", "HAVING", "FILTER ROWS ONLY", "MATCH", "1"},
					{"Which clause sorts query results?", "SORT BY", "ORDER BY", "ARRANGE BY", "SEQUENCE BY", "2"},
					{"Which clause groups rows?", "GROUP BY", "COLLECT BY", "ORDER GROUP", "MERGE BY", "1"},
					{"Which PostgreSQL feature provides automatically generated identity values?", "IDENTITY columns", "AUTO_TEXT", "ROW_COUNTER", "SERIALIZER_ONLY", "1"},
					{"Which command creates a new database?", "CREATE DATABASE", "NEW DATABASE", "MAKE DATABASE", "INIT DB SQL ONLY", "1"},
					{"Which command creates a table?", "CREATE TABLE", "MAKE TABLE", "NEW TABLE", "TABLE CREATE ONLY", "1"},
					{"Which constraint prevents duplicate values in a column?", "UNIQUE", "DEFAULT", "CHECK", "FOREIGN KEY", "1"},
					{"Which constraint establishes a relationship to another table?", "FOREIGN KEY", "UNIQUE", "CHECK", "DEFAULT", "1"},
					{"Which PostgreSQL feature supports transactional atomicity?", "BEGIN/COMMIT/ROLLBACK", "SORT/ORDER", "VIEW/INDEX", "SELECT/READ", "1"},
					{"Which command permanently saves the current transaction?", "COMMIT", "SAVE", "PUBLISH", "APPLY", "1"},
					{"Which command cancels changes in the current transaction?", "ROLLBACK", "UNDO SQL", "CANCEL TABLE", "REVERT DATABASE", "1"}
				},
				new String[] {
					"Create a PostgreSQL employee table with an identity primary key and insert sample records.",
					"Write a PostgreSQL query using JOIN, GROUP BY and aggregate functions for department reporting.",
					"Implement a PostgreSQL transaction workflow with multiple related tables, constraints and rollback handling."
				});
	}

	private void createGitAssessment() {
		createTechnicalAssessment("Git", "Git Technical Self Assessment",
				new String[][] {
					{"What is Git primarily used for?", "Version control", "Database hosting only", "Container orchestration", "UI design", "1"},
					{"Which command initializes a Git repository?", "git init", "git start", "git create", "git repo", "1"},
					{"Which command shows the working tree status?", "git status", "git check", "git state", "git info", "1"},
					{"Which command stages changes?", "git add", "git stage-all-only", "git prepare", "git include", "1"},
					{"Which command creates a commit?", "git commit", "git save", "git snapshot", "git record", "1"},
					{"Which command creates a new branch?", "git branch", "git fork", "git newbranch", "git create-branch-only", "1"},
					{"Which command switches branches in modern Git?", "git switch", "git move", "git branch-change", "git select", "1"},
					{"Which command downloads commits and refs without merging them?", "git fetch", "git download", "git pull-only", "git sync-fetch", "1"},
					{"Which command fetches and integrates changes from a remote?", "git pull", "git merge-remote", "git sync", "git update", "1"},
					{"Which command sends local commits to a remote repository?", "git push", "git send", "git upload-commit", "git publish-only", "1"},
					{"What is a merge conflict?", "Git cannot automatically combine competing changes", "A deleted repository", "A failed login", "A missing branch name", "1"},
					{"Which command combines another branch into the current branch?", "git merge", "git join", "git combine", "git attach", "1"},
					{"Which command can create a copy of a remote repository?", "git clone", "git copy", "git duplicate", "git download-repo-only", "1"},
					{"What is .gitignore used for?", "Specifying files Git should ignore", "Deleting commits", "Encrypting branches", "Creating tags", "1"},
					{"What does git log show?", "Commit history", "Only untracked files", "Remote passwords", "Merge conflicts only", "1"}
				},
				new String[] {
					"Create a Git repository, make commits and create a feature branch for a small Java project.",
					"Resolve a merge conflict between two branches and produce a clean merged history.",
					"Design a Git workflow using feature branches, rebasing or merging, tags and a remote repository."
				});
	}

	private void createMavenAssessment() {
		createTechnicalAssessment("Maven", "Maven Technical Self Assessment",
				new String[][] {
					{"What is Apache Maven primarily used for?", "Build and dependency management", "Database hosting", "Container orchestration", "UI styling", "1"},
					{"What is the standard Maven project descriptor?", "pom.xml", "maven.xml", "build.xml", "project.json", "1"},
					{"What does POM stand for?", "Project Object Model", "Project Output Manager", "Package Object Map", "Project Operations Module", "1"},
					{"Which command compiles a Maven project?", "mvn compile", "mvn build-code", "mvn javac", "mvn make", "1"},
					{"Which command runs the test phase?", "mvn test", "mvn verify-test-only", "mvn junit", "mvn run-tests-only", "1"},
					{"Which command packages the project?", "mvn package", "mvn pack", "mvn bundle-only", "mvn create-jar-only", "1"},
					{"Which Maven phase installs an artifact into the local repository?", "install", "local", "deploy-local", "publish", "1"},
					{"Which Maven phase commonly publishes an artifact to a remote repository?", "deploy", "upload", "publish-remote-only", "release-now", "1"},
					{"What is a Maven dependency?", "A library required by the project", "A database table", "A Git branch", "A Docker image", "1"},
					{"Where are Maven dependencies commonly downloaded from?", "Repositories", "HTML pages only", "Git branches only", "Java source files", "1"},
					{"What is a Maven plugin?", "A component that provides build or project functionality", "A database index", "A Git commit", "A runtime thread", "1"},
					{"Which dependency scope is commonly used for libraries needed to compile and run the application?", "compile", "database", "runtime-only", "source", "1"},
					{"Which command removes files generated by a previous Maven build?", "mvn clean", "mvn delete", "mvn reset", "mvn remove-target-only", "1"},
					{"What is the default Maven lifecycle sequence generally based on?", "Defined build phases", "Git commits", "Database transactions", "HTTP methods", "1"},
					{"Which directory normally contains Maven build output?", "target", "build-output", "dist", "maven-bin", "1"}
				},
				new String[] {
					"Create a Maven Java project with dependencies and configure the compiler plugin.",
					"Configure a Maven project with separate unit-test and package phases and resolve a dependency conflict.",
					"Design a Maven build that packages an application, runs tests, manages plugins and deploys an artifact to a repository."
				});
	}


	private void createCodingQuestion(Assessment a,int order,String difficulty,int marks,String text,String starter){AssessmentQuestion q=new AssessmentQuestion();q.setAssessment(a);q.setQuestionType(AssessmentQuestion.QuestionType.CODING);q.setDifficulty(AssessmentQuestion.Difficulty.valueOf(difficulty));q.setQuestionText(text);q.setMarks(marks);q.setQuestionOrder(order);q.setStarterCode(starter);assessmentQuestionRepository.save(q);}

	private void createTraining(
	        String trainingName,
	        String provider,
	        String duration,
	        String level,
	        String description,
	        String courseUrl) {

	    Training training = trainingRepository
	            .findByTrainingNameIgnoreCase(trainingName)
	            .orElseGet(Training::new);

	    training.setTrainingName(trainingName);
	    training.setProvider(provider);
	    training.setDuration(duration);
	    training.setLevel(level);
	    training.setDescription(description);
	    training.setCourseUrl(courseUrl);

	    trainingRepository.save(training);
	}
	private void mapTrainingToSkill(
	        String trainingName,
	        String skillName) {

	    Training training = trainingRepository
	            .findByTrainingNameIgnoreCase(trainingName)
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "Training not found: "
	                                    + trainingName));

	    Skill skill = skillRepository
	            .findBySkillNameIgnoreCase(skillName)
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "Skill not found: "
	                                    + skillName));

	    if (trainingSkillRepository
	            .existsByTrainingAndSkill(training, skill)) {

	        return;
	    }

	    TrainingSkill trainingSkill =
	            new TrainingSkill();

	    trainingSkill.setTraining(training);
	    trainingSkill.setSkill(skill);

	    trainingSkillRepository.save(trainingSkill);
	}
}