# The API, built and packaged in one place so a deployment needs no JDK and no Maven.
#
# Two stages: the first resolves dependencies and builds the jar, the second carries only a JRE
# and the jar itself. The build stage is where Maven, the source tree and the whole ~/.m2 cache
# live, and none of that belongs on a running server.

# ── Build ───────────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependencies resolve in their own layer, keyed on the POM alone. Docker reuses that layer for
# every build that does not change the POM, which is nearly all of them - otherwise a one-line
# change to a Java file would re-download the entire dependency tree.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
COPY lombok.config .

# Tests run in CI, not here. A deployment build that runs the suite needs a database for the
# integration tests, which is not something an image build should be reaching for.
RUN mvn -B -q clean package -DskipTests

# ── Runtime ─────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# wget backs the container healthcheck in docker-compose.prod.yml; curl is not in this image.
# Alpine's busybox already provides wget, so nothing is installed here.

# A non-root user, because a process that never needs to write outside its own workspace should
# not be running as one that can.
RUN addgroup -S orgskills && adduser -S -G orgskills orgskills
WORKDIR /app

COPY --from=build /build/target/*.jar app.jar
RUN chown -R orgskills:orgskills /app
USER orgskills

# Matches server.port in application.yml. Overriding PORT at runtime moves the listener, so the
# compose file maps the two together rather than hardcoding a number in both places.
ENV PORT=8081
EXPOSE 8081

# MaxRAMPercentage rather than a fixed -Xmx: the JVM then sizes its heap from whatever memory
# limit the container is actually given, instead of from the host's total.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport"

# Exec form via sh -c so JAVA_OPTS expands; sh stays PID 1 only long enough to hand over.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
