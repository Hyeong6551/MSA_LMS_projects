# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json* ./

# 의존성 설치
RUN npm install

# 소스 코드 복사 (.dockerignore에 의해 dist 폴더는 제외됨)
COPY . .

# 빌드
RUN npm run build

# 서비스 단계
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드 결과물 복사
COPY --from=builder /app/dist/ .
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 권한 설정
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
