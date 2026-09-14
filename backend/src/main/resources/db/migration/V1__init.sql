-- Flyway initial schema for SILMS (MySQL compatible)
CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL UNIQUE,
  description VARCHAR(1000)
);

CREATE TABLE permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL UNIQUE,
  description VARCHAR(1000)
);

CREATE TABLE role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(512) NOT NULL UNIQUE,
  email VARCHAR(320),
  expires_at DATETIME
);

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(320),
  action VARCHAR(255),
  entity_type VARCHAR(255),
  entity_id VARCHAR(255),
  created_at DATETIME,
  metadata TEXT
);
