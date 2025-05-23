import axios from 'axios';

export interface Notice {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    views?: number;
}

export interface NewNotice {
    title: string;
    content: string;
}

export interface Content {
    id: number;
    title: string;
    type: string;  // "video" | "quiz"
    url: string;
}

export interface Lecture {
    id: number;
    title: string;
    author: string;
    description: string;
    contents: Content[];
}

// Q&A 인터페이스
export interface LectureQna {
    id: number;
    lectureId: number;
    author: string;
    question: string;
    answer: string | null;
    createdAt: string;
    answeredAt: string | null;
}

export interface NewQuestion {
    author: string;
    question: string;
}

export interface Answer {
    answer: string;
}

export interface LectureReview {
    id: number;
    lectureId: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

export interface NewReview {
    title: string;
    content: string;
}

export interface Resource {
    id: number;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    lectureId: number;
}
/**
 * 현재 로그인한 사용자가 관리자인지 확인하는 함수
 * @returns 관리자 여부
 */
export const isAdmin = (): boolean => {
    const role = localStorage.getItem('role');
    return role === 'ADMIN';
};

/**
 * 현재 로그인한 사용자 정보 반환
 * @returns 사용자 이름
 */
export const getCurrentUser = (): string => {
    const username = localStorage.getItem('username') || '익명';
    return username;
};

/**
 * 현재 로그인 상태를 확인하는 함수
 * @returns 로그인 여부
 */
export const isLoggedIn = (): boolean => {
    const username = localStorage.getItem('username');
    return !!username;
};

/**
 * 강의 정보를 가져오는 함수
 * @param lectureId 강의 ID
 * @returns 강의 정보
 */
export const fetchLecture = async (lectureId: number | string): Promise<Lecture> => {
    try {
        const res = await axios.get(`/api/lectures/${lectureId}`);
        return res.data;
    } catch (error) {
        console.error('강의 정보를 불러오지 못했습니다.', error);
        throw new Error('강의 정보를 불러오지 못했습니다.');
    }
};

/**
 * 강의의 모든 공지사항을 가져오는 함수
 * @param lectureId 강의 ID
 * @returns 공지사항 배열
 */
export const fetchNotices = async (lectureId: number | string): Promise<Notice[]> => {
    try {
        const res = await axios.get(`/api/lectures/${lectureId}/notices`);
        // 임시로 조회수 추가
        return res.data.map((notice: Notice, index: number) => ({
            ...notice, 
            views: Math.floor(Math.random() * 100) + 10
        }));
    } catch (error) {
        console.warn('공지사항을 불러오지 못했습니다.', error);
        return [];
    }
};

/**
 * 새 공지사항을 생성하는 함수
 * @param lectureId 강의 ID
 * @param notice 새 공지사항 내용
 * @returns 생성된 공지사항
 */
export const createNotice = async (
    lectureId: number | string, 
    notice: NewNotice
): Promise<Notice | null> => {
    try {
        // 현재 사용자가 관리자가 아니면 에러
        if (!isAdmin()) {
            throw new Error('관리자만 공지사항을 작성할 수 있습니다.');
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }
        
        const payload = {
            ...notice,
            author: getCurrentUser(), // 현재 로그인한 사용자 이름 사용
        };
        
        const res = await axios.post(`/api/lectures/${lectureId}/notices`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error) {
        console.error('공지사항 등록 실패', error);
        throw error;
    }
};

/**
 * 공지사항을 수정하는 함수
 * @param lectureId 강의 ID
 * @param noticeId 공지사항 ID
 * @param notice 수정할 공지사항 내용
 * @returns 수정된 공지사항
 */
export const updateNotice = async (
    lectureId: number | string,
    noticeId: number | string,
    notice: NewNotice
): Promise<Notice> => {
    try {
        // 현재 사용자가 관리자가 아니면 에러
        if (!isAdmin()) {
            throw new Error('관리자만 공지사항을 수정할 수 있습니다.');
        }
        
        const res = await axios.put(`/api/lectures/${lectureId}/notices/${noticeId}`, notice);
        return res.data;
    } catch (error) {
        console.error('공지사항 수정 실패', error);
        throw new Error('공지사항을 수정하지 못했습니다.');
    }
};

/**
 * 공지사항을 삭제하는 함수
 * @param lectureId 강의 ID
 * @param noticeId 공지사항 ID
 */
export const deleteNotice = async (
    lectureId: number | string,
    noticeId: number | string
): Promise<void> => {
    try {
        // 현재 사용자가 관리자가 아니면 에러
        if (!isAdmin()) {
            throw new Error('관리자만 공지사항을 삭제할 수 있습니다.');
        }
        
        await axios.delete(`/api/lectures/${lectureId}/notices/${noticeId}`);
    } catch (error) {
        console.error('공지사항 삭제 실패', error);
        throw new Error('공지사항을 삭제하지 못했습니다.');
    }
};

/**
 * 공지사항 상세 정보를 가져오는 함수
 * @param lectureId 강의 ID
 * @param noticeId 공지사항 ID
 * @returns 공지사항 정보
 */
export const fetchNoticeDetail = async (
    lectureId: number | string,
    noticeId: number | string
): Promise<Notice> => {
    try {
        const res = await axios.get(`/api/lectures/${lectureId}/notices/${noticeId}`);
        return { ...res.data, views: Math.floor(Math.random() * 100) + 10 };
    } catch (error) {
        console.error('공지사항 상세 정보를 불러오지 못했습니다.', error);
        throw new Error('공지사항 상세 정보를 불러오지 못했습니다.');
    }
};

/**
 * 강의의 모든 Q&A를 가져오는 함수
 * @param lectureId 강의 ID
 * @returns Q&A 배열
 */
export const fetchQnas = async (lectureId: number | string): Promise<LectureQna[]> => {
    try {
        const response = await axios.get(`/api/lectures/${lectureId}/qna`);
        return response.data;
    } catch (error) {
        console.error('Q&A 목록을 불러오는 중 오류가 발생했습니다.', error);
        return [];
    }
};

/**
 * 새로운 질문을 생성하는 함수
 * @param lectureId 강의 ID
 * @param newQuestion 새로운 질문 객체
 * @returns 생성된 질문 객체
 */
export const createQuestion = async (lectureId: number | string, newQuestion: NewQuestion): Promise<LectureQna> => {
    try {
        const response = await axios.post(`/api/lectures/${lectureId}/qna`, newQuestion);
        return response.data;
    } catch (error) {
        console.error('질문 생성 중 오류가 발생했습니다.', error);
        throw new Error('질문 생성에 실패했습니다.');
    }
};

/**
 * 질문에 답변하는 함수
 * @param lectureId 강의 ID
 * @param qnaId Q&A ID
 * @param answer 답변 내용
 * @returns 업데이트된 Q&A 객체
 */
export const answerQuestion = async (lectureId: number | string, qnaId: number | string, answer: string): Promise<LectureQna> => {
    try {
        // 백엔드가 String을 직접 받는 형태이므로, content-type을 text/plain으로 설정
        const response = await axios.put(
            `/api/lectures/${lectureId}/qna/${qnaId}/answer`, 
            answer,
            {
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('답변 제출 중 오류가 발생했습니다.', error);
        throw new Error('답변 제출에 실패했습니다.');
    }
};

/**
 * Q&A를 삭제하는 함수
 * @param lectureId 강의 ID
 * @param qnaId Q&A ID
 */
export const deleteQna = async (lectureId: number | string, qnaId: number | string): Promise<void> => {
    try {
        await axios.delete(`/api/lectures/${lectureId}/qna/${qnaId}`);
    } catch (error) {
        console.error('Q&A 삭제 중 오류가 발생했습니다.', error);
        throw new Error('Q&A 삭제에 실패했습니다.');
    }
};

/**
 * 강의의 모든 리뷰를 가져오는 함수
 * @param lectureId 강의 ID
 * @returns 리뷰 배열
 */
export const fetchReviews = async (lectureId: number | string): Promise<LectureReview[]> => {
    try {
        const response = await axios.get(`/api/lectures/${lectureId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('리뷰 목록을 불러오는 중 오류가 발생했습니다.', error);
        return [];
    }
};

/**
 * 새 리뷰를 생성하는 함수
 * @param lectureId 강의 ID
 * @param review 새 리뷰 내용
 * @returns 생성된 리뷰
 */
export const createReview = async (
    lectureId: number | string, 
    review: NewReview
): Promise<LectureReview | null> => {
    try {
        // 로그인 상태 확인
        if (!isLoggedIn()) {
            throw new Error('로그인 후 리뷰를 작성할 수 있습니다.');
        }
        
        const payload = {
            ...review,
            author: getCurrentUser(), // 현재 로그인한 사용자 이름 사용
        };
        
        const res = await axios.post(`/api/lectures/${lectureId}/reviews`, payload);
        return res.data;
    } catch (error) {
        console.error('리뷰 등록 실패', error);
        throw error;
    }
};

/**
 * 리뷰를 수정하는 함수
 * @param lectureId 강의 ID
 * @param reviewId 리뷰 ID
 * @param review 수정할 리뷰 내용
 * @returns 수정된 리뷰
 */
export const updateReview = async (
    lectureId: number | string,
    reviewId: number | string,
    review: NewReview
): Promise<LectureReview> => {
    try {
        // 로그인 상태 확인
        if (!isLoggedIn()) {
            throw new Error('로그인 후 리뷰를 수정할 수 있습니다.');
        }
        
        const res = await axios.put(`/api/lectures/${lectureId}/reviews/${reviewId}`, review);
        return res.data;
    } catch (error) {
        console.error('리뷰 수정 실패', error);
        throw new Error('리뷰를 수정하지 못했습니다.');
    }
};

/**
 * 리뷰를 삭제하는 함수
 * @param lectureId 강의 ID
 * @param reviewId 리뷰 ID
 */
export const deleteReview = async (
    lectureId: number | string,
    reviewId: number | string
): Promise<void> => {
    try {
        // 로그인 상태 확인
        if (!isLoggedIn()) {
            throw new Error('로그인 후 리뷰를 삭제할 수 있습니다.');
        }
        
        await axios.delete(`/api/lectures/${lectureId}/reviews/${reviewId}`);
    } catch (error) {
        console.error('리뷰 삭제 실패', error);
        throw new Error('리뷰를 삭제하지 못했습니다.');
    }
};



export const fetchResources = async (lectureId: string | number): Promise<Resource[]> => {
    try {
        const res = await axios.get(`/api/lectures/${lectureId}/resources`);
        return res.data;
    } catch (error) {
        console.error('자료 목록을 불러오지 못했습니다:', error);
        return [];
    }
};

/**
 * 📁 자료 업로드
 */
export const uploadResource = async (
    lectureId: string | number,
    file: File
): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        await axios.post(`/api/lectures/${lectureId}/resources`, formData);
    } catch (error) {
        console.error('자료 업로드 실패:', error);
        throw error;
    }
};

/**
 * 📁 자료 삭제
 */
export const deleteResource = async (resourceId: number): Promise<void> => {
    try {
        await axios.delete(`/api/lectures/resources/${resourceId}`);
    } catch (error) {
        console.error('자료 삭제 실패:', error);
        throw error;
    }
};

