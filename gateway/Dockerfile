
# Dockerfile (gateway)
FROM openjdk:17-jdk-slim

# 환경 변수 설정 (메모리 관리 최적화)
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# 작업 디렉토리 설정
WORKDIR /app

# JAR 파일 복사
COPY build/libs/gateway-0.0.1-SNAPSHOT.jar gateway.jar

# 애플리케이션 포트 개방
EXPOSE 9898

# 컨테이너 시작 시 실행할 명령어
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar gateway.jar"]
