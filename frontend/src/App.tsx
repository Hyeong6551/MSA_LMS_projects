import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, AppBar} from '@mui/material'
import { theme } from './theme'
import HomeView from './pages/HomeView'
import Users from './pages/Users'
import Logins from './pages/Login'
import Register from './pages/Register';
import Mypage from './pages/Mypage.tsx';
import NoticeList from './pages/NoticeList';
import NoticeDetail from './pages/NoticeDetail';
import NoticeWrite from './pages/NoticeWrite';
import NoticeEdit from './pages/NoticeEdit';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LectureList from "./pages/LectureList";
import ExamPage from "./pages/ExamPage";
import LectureDetail from './pages/LectureDetail';
import VideoPage from "@/pages/VideoPage.tsx";
import ResultReportPage from "./pages/ResultReportPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx"
import LectureAdminPage from "./pages/LectureManagement.tsx"
import ContentManagement from './pages/ContentManagement';
import LectureManagement from './pages/LectureManagement';
import ReviewList from './pages/ReviewList.tsx';
import ChatWidget from "./components/chat/ChatWidget.tsx"
import EnrollmentManagement from './pages/EnrollmentManagement';
import RequireGuest from  './components/RequireGuest.tsx'
import RequireAdmin from './components/RequireAdmin.tsx'
import RecruitmentList from "@/components/recruitment/RecruitmentList.tsx";
import {handleRegister} from "@/utils/registerUtils.ts";

const App: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storeUserId = localStorage.getItem('userId')
        setRole(storedRole);
        setUsername(storedUsername);
        setUserId(storeUserId)
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('userId')
        setUsername(null);
        setRole(null);
        setUserId(null)

        window.dispatchEvent(new Event('auth-change'));

        window.location.href = '/';
    };

    // 로그인 처리 함수
    const handleLogin = (u: string, r: string, i: string) => {
        localStorage.setItem('username', u);
        localStorage.setItem('role', r);
        localStorage.setItem('userId',i);
        setUsername(u);
        setRole(r);
        setUserId(i)

        window.dispatchEvent(new Event('auth-change'));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <div>
                    <Header username={username} role={role} onLogout={handleLogout} />
                    <NavBar />
                </div>
            </AppBar>


            <Routes>
                <Route path="/" element={<HomeView />}/>

                <Route path="/login" element={<RequireGuest><Logins onLogin={handleLogin} /></RequireGuest>}/>
                <Route path="/register" element={<RequireGuest><Register onRegister={handleRegister} /></RequireGuest>}/>
                <Route path="/mypage" element={<Mypage />} />
                <Route path="/reviews" element={<ReviewList />} />
                <Route path="/notices" element={<NoticeList />} />
                <Route path="/notices/:id" element={<NoticeDetail />} />
                <Route path="/notices/write" element={<NoticeWrite />} />
                <Route path="/notices/edit/:id" element={<NoticeEdit />} />
                <Route path="/lectures" element={<LectureList />} />
                <Route path="/quiz/:lectureId" element={<ExamPage />} />
                <Route path="/lectures/:id" element={<LectureDetail />} />
                <Route path="/lectures/:lectureId/video/:videoId" element={<VideoPage />} />
                <Route path="/result" element={<ResultReportPage />} />
                <Route path="/recruitment" element={<RecruitmentList/>}/>

                {/* 관리자 라우트 보호 */}
                <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>}>
                    <Route path="users" element={<Users />} />
                    <Route path="lectures" element={<LectureAdminPage />} />
                    <Route path="enrollments" element={<EnrollmentManagement />} />
                </Route>
                <Route path="/admin/lectures" element={<RequireAdmin><LectureManagement /></RequireAdmin>} />
                <Route path="/admin/lectures/:lectureId/contents" element={<RequireAdmin><ContentManagement /></RequireAdmin>} />
                <Route path="/admin/users" element={<Users />} />
            </Routes>

            <ChatWidget />
            <Footer />
        </ThemeProvider>
    )
}

export default App;