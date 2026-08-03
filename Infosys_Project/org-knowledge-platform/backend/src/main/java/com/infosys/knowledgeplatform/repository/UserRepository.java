package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
