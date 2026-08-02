# Organizational-knowledge-platform
# Organizational Knowledge Gap Intelligence Platform

## Project Overview
The Organizational Knowledge Gap Intelligence Platform is a Spring Boot application that helps organizations identify employee skill gaps, recommend training, and manage competencies.

## Tech Stack
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- MySQL
- Maven

## Features
- Employee Management
- Skill Management
- Department Management
- Role Management
- Competency Management
- Knowledge Gap Analysis
- Employee Skill Tracking

## Prerequisites
- Java 21
- Maven
- MySQL

## Database
Create a MySQL database named:

```sql
CREATE DATABASE knowledge_gap_platform;
```

Update your `application.properties` with your MySQL username and password.

## Running the Project

1. Clone the repository.
2. Open the project in VS Code or IntelliJ.
3. Configure the database in `application.properties`.
4. Run the application.

The application will start on:

```
http://localhost:8080
```

## API Documentation

Swagger UI:

```
http://localhost:8080/swagger-ui/index.html
```

## Project Structure

```
src
 ├── controller
 ├── service
 ├── repository
 ├── entity
 ├── config
 └── KnowledgeGapPlatformApplication.java
```

