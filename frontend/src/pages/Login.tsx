// src/pages/Login.tsx
import React, { useState } from 'react';
import { TextField, Button, Container, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

interface Props {
    onLogin: (username: string, role: string, userId: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post('/users/login', { username, password });

            // 저장
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('userId', res.data.userId);

            // 상태 전달
            onLogin(res.data.username, res.data.role, res.data.userId);

            // auth-change 이벤트 발생 - 즉시 UI 업데이트용
            window.dispatchEvent(new Event('auth-change'));

            // 페이지 이동
            navigate('/');
        } catch (err) {
            alert('로그인 실패');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Container>
            <div className="auth-container">
                <h2 className="auth-title">로그인</h2>
                
                <div className="login-form">
                    <TextField
                        label="아이디"
                        fullWidth
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    
                    <TextField
                        label="비밀번호"
                        type="password"
                        fullWidth
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    
                    <Button 
                        variant="contained" 
                        fullWidth 
                        className="login-button"
                        onClick={handleLogin}
                    >
                        로그인
                    </Button>
                    
                    <div className="auth-links">
                        계정이 없으신가요?
                        <MuiLink component={Link} to="/register">
                            회원가입
                        </MuiLink>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Login;
