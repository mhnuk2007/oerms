FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/notification-service-1.0.0.jar app.jar
EXPOSE 9005
ENTRYPOINT ["java", "-jar", "app.jar"]