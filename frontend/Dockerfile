# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 빌드 결과물 확인
RUN echo "=== Build output contents ===" && \
    ls -la /app/dist && \
    echo "=== index.html contents ===" && \
    cat /app/dist/index.html

# 서비스 단계
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 로컬 빌드 결과물 복사
COPY ./dist/ .
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 권한 설정
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# 최종 디렉토리 내용 확인
RUN echo "=== Final nginx directory contents ===" && \
    ls -la /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
