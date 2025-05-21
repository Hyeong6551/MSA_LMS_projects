# Stage 1: Vite 애플리케이션 빌드
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json ./
COPY package-lock.json ./

# 패키지 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Vite 빌드 실행
RUN npm run build

# Stage 2: Nginx로 서비스
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 빌드된 Vite 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 개방
EXPOSE 80

# Nginx 실행
ENTRYPOINT ["nginx", "-g", "daemon off;"]
