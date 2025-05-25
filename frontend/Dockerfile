# 서비스 단계
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드된 결과물 복사 (로컬에서 빌드된 dist 폴더)
COPY dist/ .
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 권한 설정
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
