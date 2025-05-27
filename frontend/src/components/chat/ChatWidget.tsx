import React, { useState, useEffect, useRef } from 'react';
import axios  from 'axios';
import './ChatWidget.css';

interface Message {
    id: string;
    message: string;
    sender: string;
    timestamp: string;
}

const ChatWidget: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [userId, setUserId] = useState(localStorage.getItem('userId') ?? 'anonymous123');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`api/chat/${userId}`);

            // API 응답이 올바른지 확인
            if (res.status === 200 && Array.isArray(res.data)) {
                setMessages(res.data);
            } else {
                console.error("API 응답이 배열이 아닙니다:", res.data);

                // 응답이 객체일 경우 배열로 변환
                if (res.status === 200 && typeof res.data === 'object') {
                    setMessages([res.data]);
                } else {
                    setMessages([]);
                }
            }
        } catch (err: unknown) {
            console.error('메시지 불러오기 실패:', err);
            // 에러 응답에 대한 처리
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("서버 응답 오류:", err.response.data);
                } else if (err.request) {
                    console.error("서버 응답이 없습니다.");
                } else {
                    console.error("요청 설정 오류:", err.message);
                }
            }
            setMessages([]);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        try {
            await axios.post(`/api/chat/${userId}`, {
                id: crypto.randomUUID(),
                message: input.trim(),
                timestamp: new Date().toISOString().slice(0, 19),
            });

            setInput('');
            await fetchMessages();

            // 입력 직후 스크롤 맨 아래로 이동
            setTimeout(() => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.scrollTop = 0;
                }
            }, 0);
        } catch (err) {
            console.error('메시지 전송 실패:', err);
        }
    };

    // 사용자 변경 감지
    useEffect(() => {
        const handleAuthChange = () => {
            const newId = localStorage.getItem('userId') ?? 'anonymous123';
            setUserId(newId);
            setMessages([]);
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    // 메시지 주기적 fetch (userId 변경 시 갱신)
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [userId]);

    // 채팅창 열릴 때 즉시 메시지 불러오기
    useEffect(() => {
        if (open) {
            fetchMessages();
        }
    }, [open]);

    const formatKoreanDateTime = (isoString: string) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours < 12 ? '오전' : '오후';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${year}년 ${month}월 ${day}일 ${ampm} ${pad(formattedHours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    return (
        <div className="chat-widget-container">
            {open ? (
                <div className="chat-box">
                    <div className="chat-header">
                        강의 추천 bot
                        <button onClick={() => setOpen(false)} style={{ background: 'none', color: '#fff', border: 'none', fontSize: '16px' }}>✕</button>
                    </div>
                    <div className="chat-messages" ref={chatBoxRef}>
                        {Array.isArray(messages) && messages.length > 0 && (
                            messages.map((msg, index) => (
                                <div
                                    key={`${msg.id}-${index}`}
                                    className={`chat-message ${msg.sender === 'AI' ? 'from-discord' : 'from-user'}`}
                                >
                                    <span>{msg.message}</span>
                                    <div className="chat-timestamp">{formatKoreanDateTime(msg.timestamp)}</div>
                                </div>
                            ))
                        )}
                    </div>


                    <div className="chat-input-container">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="메시지를 입력하세요"
                            className="chat-input"
                        />
                    </div>
                </div>
            ) : (
                <button className="chat-toggle-button" onClick={() => setOpen(true)}>
                    💬
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
