# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 설치
COPY package.json yarn.lock ./
RUN yarn install

# 소스 코드 복사
COPY . .

# Vite 환경 변수 설정 (동적 API URL)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Vite 빌드 실행
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:latest

# Nginx 설정 파일 복사
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Vite 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 개방
EXPOSE 3000

# Nginx 실행
ENTRYPOINT ["nginx", "-g", "daemon off;"]
