package com.okip.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Notification;
public interface NotificationRepository extends JpaRepository<Notification,Long>{
 List<Notification> findTop50ByEmployeeOrderByCreatedAtDesc(Employee employee);
 long countByEmployeeAndReadFalse(Employee employee);
}
