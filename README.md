# MSA 기반 LMS 프로젝트

---
## 프로젝트 개요
이 프로젝트는 마이크로서비스 아키텍처(MSA) 기반의 학습 관리 시스템(LMS)입니다. 각 도메인별로 독립적인 서비스를 구현하여 확장성과 유지보수성을 높였습니다.

---
## 개발 기간
- 2024.04.15 ~ 2024.05.29

---
## 개발 인원
- 4명

---
## 기술 스택

### Backend
- Java(jdk-17), Spring Boot(3.1.5), Spring Cloud
- Gradle, JPA, MySQL, H2-Database, Redis
- Eureka, Spring Cloud Gateway

### Frontend
- React, TypeScript
- Material-UI (MUI)
- Redux Toolkit, Axios

### Infra
- Eureka, Spring Cloud Gateway

### CI/CD 
- Docker, AWS

---
## 서비스 구성도

```
.
├── eureka-server/
├── gateway/
├── admin-service/
├── lecture-service/
├── exam-service/
├── review-service/
├── notice-service/
├── chat-service/
├── frontend/
└── helm/
```

---
## 로컬 개발 및 실행 방법

### 공통
```bash
./gradlew build
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

### 각 서비스 실행
```bash
cd <service>
./gradlew bootRun
```

---
## 서비스별 역할

### 1. 인프라 서비스
#### eureka-server
- 서비스 디스커버리 서버
- 마이크로서비스 등록 및 관리

#### gateway
- API 게이트웨이 역할
- 사용자 인증/인가 처리
- 사용자 관리 (회원가입/로그인/정보수정)
- 학습 진도 관리 (CompletionHistory)

---
### 2. 핵심 서비스
#### lecture-service
- 강의 CRUD
- 강의 콘텐츠 관리
- 강의별 Q&A 게시판 운영
  - 질문 등록/조회
  - 답변 등록/수정
  - 질문 삭제

#### exam-service
- 시험 문제 관리
- 시험 결과 처리 및 채점
- 시험 성적 조회

#### chat-service
- REST API 기반 채팅
- 사용자별 메시지 이력 관리
- AI 응답 처리

#### notice-service
- 공지사항 CRUD
- 시간순 정렬 조회

#### review-service
- 강의 리뷰 조회

#### admin-service
- 강의 관리
- 콘텐츠 관리
- 시험 관리

---
## 시연동영상
https://youtu.be/HRSy0bXYzL4
