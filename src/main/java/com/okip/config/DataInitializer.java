package com.okip.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.okip.entity.master.Employee;
import com.okip.enums.AccountStatus;
import com.okip.entity.master.Department;
import com.okip.entity.master.Role;
import com.okip.enums.RoleType;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;
	private final DepartmentRepository departmentRepository;
	private final EmployeeRepository employeeRepository;
	private final PasswordEncoder passwordEncoder;

	public DataInitializer(RoleRepository roleRepository, DepartmentRepository departmentRepository,
			EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {

		this.roleRepository = roleRepository;
		this.departmentRepository = departmentRepository;
		this.employeeRepository = employeeRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) throws Exception {

		initializeRoles();
		initializeDepartments();
		initializeDefaultUsers();

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

	private void initializeDefaultUsers() {

		createUser("ADMIN001", "System", "Admin", "admin@okip.com", "Password@123", RoleType.ROLE_ADMIN, "IT");
		createUser("HR001", "Default", "HR", "hr@okip.com", "Password@123", RoleType.ROLE_HR, "HR");
		createUser("MGR001", "Default", "Manager", "manager@okip.com", "Password@123", RoleType.ROLE_MANAGER, "IT");
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

}