# Dockerfile (admin-service)

# 1. 경량화된 Java 기반 이미지 사용
FROM openjdk:17-jdk-slim

# 2. 환경 변수 설정 (메모리 관리 최적화)
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. JAR 파일 복사 (캐시 활용을 위해 복사 순서 최적화)
COPY build/libs/admin-service-0.0.1-SNAPSHOT.jar admin-service.jar

# 5. 애플리케이션 포트 개방
EXPOSE 9595

# 6. 컨테이너 시작 시 실행할 명령어
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar admin-service.jar"]