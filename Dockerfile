# 墨阅 MoRead · 单容器演示部署
# 前端构建 -> Spring Boot 打包 -> 运行时自带 H2 demo profile
FROM node:22-alpine AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY server/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY server/src ./src
COPY --from=web /web/dist ./src/main/resources/static
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/moread-server-1.0.0.jar app.jar
ENV SPRING_PROFILES_ACTIVE=demo
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
