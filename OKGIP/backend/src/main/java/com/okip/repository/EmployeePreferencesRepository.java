package com.okip.repository;
import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository; import com.okip.entity.master.Employee; import com.okip.entity.master.EmployeePreferences;
public interface EmployeePreferencesRepository extends JpaRepository<EmployeePreferences,Long>{Optional<EmployeePreferences> findByEmployee(Employee employee);}
