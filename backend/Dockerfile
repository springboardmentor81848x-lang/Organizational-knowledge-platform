# ==========================================
# Multi-stage Dockerfile for Spring Boot (Java 21)
# ==========================================

# Step 1: Build stage with Maven and Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven POM and pre-fetch dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package application into JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Runtime stage with lightweight Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic port via the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
