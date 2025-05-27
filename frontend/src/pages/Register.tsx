import React, { useState, useRef, useCallback } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Modal,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton,
    FormHelperText,
    Chip,
    CircularProgress,
    Container,
    Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
import './Auth.css';

// 유틸리티 함수와 타입 가져오기
import {
    RegisterForm,
    RegisterErrors,
    RegisterTouched,
    checkUsernameAvailability,
    handleAddressComplete,
    handlePhoneInputChange as phoneInputChange,
    validateForm as validateRegisterForm,
    handleInputChange as inputChange,
    handleRegister as registerUser,
    getOptionsData
} from '../utils/registerUtils';

const Register: React.FC = () => {
    const [form, setForm] = useState<RegisterForm>({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone1: '',
        phone2: '',
        phone3: '',
        address: '',
        addressDetail: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
    });

    // 아이디 중복 확인 관련 상태
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    
    // 전화번호 입력 필드 참조 생성
    const phone1Ref = useRef<HTMLInputElement>(null);
    const phone2Ref = useRef<HTMLInputElement>(null);
    const phone3Ref = useRef<HTMLInputElement>(null);

    // smscool 인증
    const [authCode, setAuthCode] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [isFormValid, setIsFormValid] = useState(false);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<RegisterErrors>({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        birthDate: '',
        address: '',
    });
    const [touched, setTouched] = useState<RegisterTouched>({
        username: false,
        password: false,
        confirmPassword: false,
        email: false,
        birthDate: false,
        address: false,
    });

    // 옵션 데이터 가져오기
    const { yearOptions, monthOptions, dayOptions } = getOptionsData();

    // 콜백 함수들 정의
    const validateFormCallback = useCallback(() => {
        return validateRegisterForm(form, touched, usernameAvailable, setErrors, setIsFormValid);
    }, [form, touched, usernameAvailable]);

    const handleBlur = (field: string) => {
        setTouched({
            ...touched,
            [field]: true
        });
        validateFormCallback();
    };

    const handleUsernameCheck = useCallback(() => {
        checkUsernameAvailability(form.username, setUsernameChecking, setUsernameAvailable, setErrors, errors);
        validateFormCallback();
    }, [form.username, errors, validateFormCallback]);

    const handleAddressCompleteCallback = useCallback((data: any) => {
        handleAddressComplete(data, setForm, form, setOpen, setErrors, errors, setTouched, touched, validateFormCallback);
    }, [form, errors, touched, validateFormCallback]);

    const handlePhoneInputChange = useCallback((field: string, value: string, maxLength: number, nextRef?: React.RefObject<HTMLInputElement>) => {
        phoneInputChange(field, value, maxLength, setForm, form, touched, validateFormCallback, nextRef);
    }, [form, touched, validateFormCallback]);

    const handleInputChange = useCallback((field: string, value: string) => {
        inputChange(field, value, setForm, form, touched, setUsernameAvailable, validateFormCallback);
    }, [form, touched, validateFormCallback]);

    const handleRegister = useCallback(() => {
        registerUser(form, navigate, setTouched, validateFormCallback, usernameAvailable);
    }, [form, navigate, validateFormCallback, usernameAvailable]);

    // 아이디 중복 확인 결과에 따른 아이콘 렌더링
    const renderUsernameStatus = () => {
        if (usernameChecking) {
            return <CircularProgress size={20} />;
        } else if (usernameAvailable === true) {
            return <CheckCircle color="success" />;
        } else if (usernameAvailable === false) {
            return <Cancel color="error" />;
        }
        return null;
    };

    // 필수 항목 라벨 렌더링 함수
    const requiredLabel = (label: string) => (
        <Box display="flex" alignItems="center" gap={1}>
            {label}
            <Chip 
                label="필수 항목" 
                size="small" 
                className="register-chip"
            />
        </Box>
    );

    // 인증번호 요청
    const sendAuthCode = async () => {
        try {
            setSending(true);
            const fullPhone = `${form.phone1}${form.phone2}${form.phone3}`;
            await fetch('/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone })
            });
            alert('인증번호가 발송되었습니다.');
            setSent(true);
            setTimer(180);
            setCanResend(false);
        } catch (error) {
            console.error('SMS 발송 실패', error);
            alert('SMS 발송에 실패했습니다.');
        } finally {
            setSending(false);
        }
    };

    // 타이머 감소 로직
    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(countdown);
        } else {
            setCanResend(true); // 타이머 끝나면 재전송 허용
        }
    }, [timer]);

// 시간 포맷 (mm:ss)
    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    // 인증번호 검증
    const verifyAuthCode = async () => {
        try {
            const fullPhone = `${form.phone1}${form.phone2}${form.phone3}`;
            const res = await fetch('/api/sms/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, code: authCode })
            });
            const data = await res.json();
            if (data.success) {
                alert('인증에 성공했습니다.');
                setIsPhoneVerified(true);
            } else {
                alert('인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('인증 실패', error);
            alert('인증 요청에 실패했습니다.');
        }
    };

    return (
        <Container>
            <div className="auth-container">
                <h2 className="auth-title">회원가입</h2>
                
                <div className="register-form">
                    {/* 기본 정보 섹션 */}
                    <div className="register-section">
                        <h3 className="register-section-title">기본 정보</h3>
                        
                        <TextField
                            label={requiredLabel("이름")}
                            fullWidth
                            className="register-input"
                            value={form.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
            
                        <div className="username-container">
                            <TextField
                                label={requiredLabel("아이디")}
                                fullWidth
                                value={form.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                onBlur={() => handleBlur('username')}
                                error={touched.username && !!errors.username}
                                helperText={!touched.username ? '아이디는 7자 이상이어야 합니다' : (errors.username || '아이디는 7자 이상이어야 합니다')}
                                InputProps={{
                                    endAdornment: form.username.length >= 7 && (
                                        <InputAdornment position="end">
                                            {renderUsernameStatus()}
                                        </InputAdornment>
                                    ),
                                }}
                                className="username-input"
                            />
                            <Button 
                                variant="contained"
                                onClick={handleUsernameCheck}
                                disabled={form.username.length < 7 || usernameChecking}
                                className="register-check-button"
                                sx={{ height: '56px' }}
                            >
                                {usernameChecking ? '확인 중' : '중복 확인'}
                            </Button>
                        </div>
            
                        <TextField
                            label={requiredLabel("비밀번호")}
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={form.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onBlur={() => handleBlur('password')}
                            error={touched.password && !!errors.password}
                            helperText={!touched.password ? '비밀번호는 8자 이상이어야 합니다' : (errors.password || '비밀번호는 8자 이상이어야 합니다')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            className="register-input"
                        />
                        <TextField
                            label={requiredLabel("비밀번호 확인")}
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={form.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            error={touched.confirmPassword && !!errors.confirmPassword}
                            helperText={!touched.confirmPassword ? '비밀번호를 재입력해주세요.' : (errors.confirmPassword || '비밀번호를 재입력해주세요.')}
                            className="register-input"
                        />
                    </div>
                    
                    {/* 개인 정보 섹션 */}
                    <div className="register-section">
                        <h3 className="register-section-title">개인 정보</h3>
                        
                        {/* 생년월일 */}
                        <Typography variant="subtitle1" gutterBottom mt={2}>
                            생년월일
                        </Typography>
                        <div className="birth-date-container">
                            <FormControl className="birth-date-select">
                                <InputLabel id="birth-year-label">년도</InputLabel>
                                <Select
                                    labelId="birth-year-label"
                                    value={form.birthYear}
                                    label="년도"
                                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                                >
                                    <MenuItem value=""><em>선택</em></MenuItem>
                                    {yearOptions.map(year => (
                                        <MenuItem key={year} value={year.toString()}>{year}년</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl className="birth-date-select">
                                <InputLabel id="birth-month-label">월</InputLabel>
                                <Select
                                    labelId="birth-month-label"
                                    value={form.birthMonth}
                                    label="월"
                                    onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                                >
                                    <MenuItem value=""><em>선택</em></MenuItem>
                                    {monthOptions.map(month => (
                                        <MenuItem key={month} value={month.toString()}>{month}월</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl className="birth-date-select">
                                <InputLabel id="birth-day-label">일</InputLabel>
                                <Select
                                    labelId="birth-day-label"
                                    value={form.birthDay}
                                    label="일"
                                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                                >
                                    <MenuItem value=""><em>선택</em></MenuItem>
                                    {dayOptions.map(day => (
                                        <MenuItem key={day} value={day.toString()}>{day}일</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        {errors.birthDate && (
                            <FormHelperText error>{errors.birthDate}</FormHelperText>
                        )}
                        
                        {/* 연락처 정보 */}
                        <Typography variant="subtitle1" gutterBottom mt={2}>
                            {requiredLabel("연락처")}
                        </Typography>
                        <div className="phone-input-container">
                            <TextField
                                label="전화번호 앞자리"
                                placeholder="010"
                                inputRef={phone1Ref}
                                value={form.phone1}
                                onChange={(e) => handlePhoneInputChange('phone1', e.target.value, 3, phone2Ref)}
                                inputProps={{ maxLength: 3 }}
                                className="phone-input"
                            />
                            <TextField
                                label="중간자리"
                                placeholder="1234"
                                inputRef={phone2Ref}
                                value={form.phone2}
                                onChange={(e) => handlePhoneInputChange('phone2', e.target.value, 4, phone3Ref)}
                                inputProps={{ maxLength: 4 }}
                                className="phone-input"
                            />
                            <TextField
                                label="끝자리"
                                placeholder="5678"
                                inputRef={phone3Ref}
                                value={form.phone3}
                                onChange={(e) => handlePhoneInputChange('phone3', e.target.value, 4)}
                                inputProps={{ maxLength: 4 }}
                                className="phone-input"
                            />
                        </div>
                        <Button

                            variant="outlined"
                            onClick={sendAuthCode}
                            disabled={!canResend ||sending || !form.phone1 || !form.phone2 || !form.phone3}
                            sx={{
                                mt: 1,
                                mb: 1,
                                color: '#028267',
                                borderColor: '#028267',
                                '&:hover': {
                                    borderColor: '#026b55',
                                    backgroundColor: 'rgba(2, 130, 103, 0.04)', // 약간 연하게
                                },
                            }}
                        >
                            {sending ? '발송 중...' : '인증번호 발송'}
                        </Button>

                        {sent && (
                            <Box mt={2} mb={3} display="flex" gap={2} alignItems="center">
                                <TextField

                                    label="인증번호 입력"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                    sx={{ flex: 2 }}  // 입력창은 조금 넓게
                                />
                                <Button

                                    variant="contained"
                                    onClick={verifyAuthCode}
                                    sx={{
                                        height: '56px',
                                        flex: 1,
                                        backgroundColor: '#028267',
                                        '&:hover': {
                                            backgroundColor: '#026b55',
                                        },
                                    }}
                                >
                                    인증 확인
                                </Button>
                            </Box>
                        )}

                        {/* 타이머 메시지 */}
                        {!canResend && timer > 0 && (
                            <Typography variant="body2" color="textSecondary">
                                인증번호 유효시간: {formatTime(timer)} 남음
                            </Typography>
                        )}

                        {/* 이메일 정보 */}
                        <TextField
                            label={requiredLabel("이메일")}
                            type="email"
                            fullWidth
                            value={form.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            error={touched.email && !!errors.email}
                            helperText={touched.email && errors.email ? errors.email : ''}
                            className="register-input"
                        />
                        
                        {/* 주소 정보 */}
                        <Typography variant="subtitle1" gutterBottom mt={2}>
                            {requiredLabel("주소")}
                        </Typography>
                        <div className="address-container">
                            <TextField
                                label="주소"
                                fullWidth
                                value={form.address}
                                InputProps={{
                                    readOnly: true,
                                }}
                                onClick={() => {
                                    setTouched({
                                        ...touched,
                                        address: true
                                    });
                                    setOpen(true);
                                }}
                                error={touched.address && !!errors.address}
                                helperText={touched.address && errors.address ? errors.address : '주소 검색 버튼을 클릭하여 주소를 입력하세요.'}
                                className="address-input"
                            />
                            <Button 
                                variant="contained"
                                onClick={() => {
                                    setTouched({
                                        ...touched,
                                        address: true
                                    });
                                    setOpen(true);
                                }}
                                className="address-search-button"
                                sx={{ height: '56px' }}
                            >
                                주소 검색
                            </Button>
                        </div>
                        <TextField
                            label="상세 주소"
                            fullWidth
                            value={form.addressDetail}
                            onChange={(e) => {
                                handleInputChange('addressDetail', e.target.value);
                                // 주소가 입력되어 있다면 변경 시 바로 유효성 검사
                                if (form.address) {
                                    setTimeout(validateFormCallback, 0);
                                }
                            }}
                            className="register-input"
                        />
                    </div>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={!isFormValid || !isPhoneVerified}
                        onClick={handleRegister}
                        className="register-submit-button"
                    >
                        가입하기
                    </Button>
                    
                    <div className="auth-links">
                        이미 계정이 있으신가요?
                        <MuiLink component={Link} to="/login">
                            로그인
                        </MuiLink>
                    </div>
                </div>
                
                <Modal open={open} onClose={() => setOpen(false)}>
                    <Box sx={{ margin: 'auto', width: 400, mt: 10, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                        <DaumPostcode 
                            onComplete={handleAddressCompleteCallback}
                            onClose={() => {
                                setOpen(false);
                                validateFormCallback();
                            }}
                        />
                    </Box>
                </Modal>
            </div>
        </Container>
    );
};

export default Register;
