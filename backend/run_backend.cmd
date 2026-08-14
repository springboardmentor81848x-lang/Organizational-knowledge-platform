@echo off
rem ------------------------------------------------------------------
rem Launch Spring Boot with proper JAVA_HOME
rem ------------------------------------------------------------------
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
if exist "%JAVA_HOME%\bin\java.exe" (
  set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVA_EXE=java"
)

set ARGS=%*
if "%ARGS%"=="" set ARGS=spring-boot:run

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory=. -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %ARGS%
