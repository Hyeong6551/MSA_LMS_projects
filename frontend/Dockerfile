# Stage 1: Build the Vite application
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

## 메모리 할당량을 늘려서 빌드 실행
#ENV NODE_OPTIONS="--max-old-space-size=4096"

# Vite 빌드 실행
RUN npm run dev

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 빌드된 Vite 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 개방
EXPOSE 80

# Nginx 실행
ENTRYPOINT ["nginx", "-g", "daemon off;"]
