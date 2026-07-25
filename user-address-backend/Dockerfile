# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache dependencies first
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Build the app
COPY src/ src/
RUN ./mvnw -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Spring Boot repackage makes an executable WAR
COPY --from=build /app/target/*.war app.war

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
