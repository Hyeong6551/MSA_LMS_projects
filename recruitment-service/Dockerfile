
# Dockerfile (recruitment-service)
FROM openjdk:17-jdk-slim

# 환경 변수 설정 (메모리 관리 최적화)
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# 작업 디렉토리 설정
WORKDIR /app

# JAR 파일 복사
COPY build/libs/recruitment-service-0.0.1-SNAPSHOT.jar recruitment-service.jar

# 애플리케이션 포트 개방
EXPOSE 7979

# 컨테이너 시작 시 실행할 명령어
ENTRYPOINT exec java $JAVA_OPTS -jar recruitment-service.jar
