import React, { useState, useEffect } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [role, setRole] = useState<string | null>(null);
  
  // 로컬 스토리지에서 사용자 역할을 가져오는 함수
  const getRoleFromStorage = () => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  };
  
  useEffect(() => {
    // 컴포넌트 마운트 시 역할 정보 가져오기
    getRoleFromStorage();
    
    // 로컬 스토리지 변화 감지를 위한 이벤트 리스너 등록
    window.addEventListener('storage', getRoleFromStorage);
    
    // 커스텀 이벤트 리스너 등록 (로그인/로그아웃 이벤트)
    window.addEventListener('auth-change', getRoleFromStorage);
    
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      window.removeEventListener('storage', getRoleFromStorage);
      window.removeEventListener('auth-change', getRoleFromStorage);
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 로고 및 설명 */}
        <div>
          <h3>📝 LMS 사이트</h3>
          <p>
            LMS 플랫폼 사이트 입니다.<br />
          </p>
        </div>

        {/* 바로가기 */}
        <div>
          <h4>바로가기</h4>
          <ul>
            <p>이용 약관</p>
            <p>개인정보처리방침</p>
            {role === 'ADMIN' && (
              <li>
                <Link to="/admin/users" className="admin-link">관리자 페이지</Link>
              </li>
            )}
          </ul>
        </div>

        {/* 고객센터 */}
        <div>
          <h4>고객센터</h4>
          <p>☎ 1234-5678</p>
          <p>이메일: help@lms.com</p>
          <p>운영시간: 평일 09:00 ~ 18:00</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 LMS Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 