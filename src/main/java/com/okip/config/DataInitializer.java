package com.okip.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Role;
import com.okip.entity.master.Skill;
import com.okip.enums.AccountStatus;
import com.okip.enums.RoleType;
import com.okip.enums.SkillCategory;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.RoleRepository;
import com.okip.repository.SkillRepository;
import com.okip.entity.master.JobRole;
import com.okip.repository.JobRoleRepository;
import com.okip.entity.master.Training;
import com.okip.repository.TrainingRepository;
import com.okip.entity.transaction.TrainingSkill;
import com.okip.repository.TrainingSkillRepository;

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

	public DataInitializer(
	        RoleRepository roleRepository,
	        DepartmentRepository departmentRepository,
	        EmployeeRepository employeeRepository,
	        SkillRepository skillRepository,
	        JobRoleRepository jobRoleRepository,
	        TrainingRepository trainingRepository,
	        TrainingSkillRepository trainingSkillRepository,
	        PasswordEncoder passwordEncoder) {

	    this.roleRepository = roleRepository;
	    this.departmentRepository = departmentRepository;
	    this.employeeRepository = employeeRepository;
	    this.skillRepository = skillRepository;
	    this.jobRoleRepository = jobRoleRepository;
	    this.trainingRepository = trainingRepository;
	    this.trainingSkillRepository = trainingSkillRepository;
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