@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "M2_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3"
set "PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%"
cmd /c ""C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3\bin\mvn.cmd" compile"
