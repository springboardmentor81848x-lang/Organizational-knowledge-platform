package com.okip.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.NotificationDevice;
public interface NotificationDeviceRepository extends JpaRepository<NotificationDevice,Long>{
 Optional<NotificationDevice> findByFid(String fid);
 java.util.List<NotificationDevice> findByEmployee(Employee employee);
}
