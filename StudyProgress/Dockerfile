FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /app
ADD --chown=app:app https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/certs/global-bundle.pem
COPY --from=build --chown=app:app /build/target/StudyProgress-0.0.1-SNAPSHOT.jar app.jar
USER app
ENV TZ=America/Lima
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","app.jar"]
