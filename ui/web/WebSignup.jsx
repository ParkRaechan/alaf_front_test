import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react';
import { UserContext } from '../../context/UserContext.js'; 

const WebSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [step, setStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 스키마에 맞춘 깔끔한 입력값
  const [inputs, setInputs] = useState({
    email: '', 
    password: '', 
    name: '', 
    phone_number: '' 
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({});
  const [verifyCode, setVerifyCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);

  const [agreements, setAgreements] = useState({
    all: false, term1: false, term2: false, term3: false, term4: false, term5: false,
  });

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // 4가지 정보만 완벽하게 입력됐는지 체크
  useEffect(() => {
    if (step === 1) {
      const isValid = 
        inputs.email.includes('@') && 
        inputs.password.length >= 4 &&
        inputs.name.length > 0 &&
        inputs.phone_number.length >= 10;
      setIsFormValid(isValid);
    }
  }, [inputs, step]);

  const handleAllCheck = () => {
    const newValue = !agreements.all;
    setAgreements({ all: newValue, term1: newValue, term2: newValue, term3: newValue, term4: newValue, term5: newValue });
  };

  const handleSingleCheck = (key) => {
    const newState = { ...agreements, [key]: !agreements[key] };
    const allChecked = newState.term1 && newState.term2 && newState.term3 && newState.term4 && newState.term5;
    setAgreements({ ...newState, all: allChecked });
  };

  // 이메일 인증코드 발송 API 연동
  const handleConfirmTerms = async () => {
    if (!agreements.term1 || !agreements.term2 || !agreements.term3 || !agreements.term4) {
      return alert('필수 약관에 모두 동의해주세요.');
    }
    
    setShowTerms(false);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email }), // 이메일 전달
      });
      const data = await res.json();

      if (res.ok) {
        alert('이메일로 인증번호가 발송되었습니다.');
        setTimeLeft(180);
        setStep(2);
      } else {
        alert(data.message || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Email send error:', error);
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if(isLoading) return;
    setVerifyCode('');
    handleConfirmTerms(); 
  };

  // 최종 회원가입 진행
  const handleFinalVerification = async () => {
    if (timeLeft === 0) return alert('입력 시간이 초과되었습니다. 다시 받아주세요.');
    if (verifyCode.length !== 6) return alert('인증번호 6자리를 입력해주세요.');

    setIsLoading(true);
    try {
      // 1. 코드 검증
      const verifyRes = await fetch('http://localhost:8080/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email, code: verifyCode }),
      });
      
      if (!verifyRes.ok) {
        setIsLoading(false);
        const verifyData = await verifyRes.json();
        return alert(verifyData.message || '인증번호가 틀렸습니다.');
      }

      // 2. 가입 처리
      const registerRes = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs), 
      });
      const registerData = await registerRes.json();

      if (registerRes.ok) {
        localStorage.setItem('token', registerData.token);
        login(registerData.user);
        
        alert(`${inputs.name}님 환영합니다! 가입이 완료되었습니다.`);
        navigate('/'); 
      } else {
        alert(registerData.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('서버 에러가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const Header = ({ title, onBack }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30, position: 'relative', justifyContent: 'center' }}>
      <button onClick={onBack} style={{ position: 'absolute', left: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={24} color="#333" />
      </button>
      <h2 style={{ fontSize: 18, fontWeight: '700', color: '#333', margin: 0 }}>{title}</h2>
    </div>
  );

  return (
    <div className="pc-container" style={{ alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '40px 30px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 420, minHeight: 600, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {step === 1 && (
          <>
            <Header title="회원가입" onBack={() => navigate(-1)} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto', paddingRight: 5 }}>
              <div>
                <h4 style={{ margin: '0 0 15px 0', fontSize: 16, color: '#333' }}>계정 정보</h4>
                
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>아이디 (이메일)</label>
                  <input 
                    name="email" type="email" placeholder="example@tukorea.ac.kr" value={inputs.email} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.email ? activeInputStyle : inputStyle}
                  />
                  {(touched.email && !inputs.email.includes('@')) && <span style={errorTextStyle}>올바른 이메일 형식을 입력해주세요</span>}
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>비밀번호</label>
                  <input 
                    name="password" type="password" placeholder="비밀번호 입력" value={inputs.password} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.password ? activeInputStyle : inputStyle}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: '#eee', margin: '5px 0' }}></div>

              <div>
                <h4 style={{ margin: '0 0 15px 0', fontSize: 16, color: '#333' }}>기본 정보</h4>
                
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>이름</label>
                  <input 
                    name="name" placeholder="이름 입력" value={inputs.name} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.name ? activeInputStyle : inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>휴대폰번호</label>
                  <input 
                    name="phone_number" placeholder="-없이 숫자만 입력" maxLength="11"
                    value={inputs.phone_number} onChange={handleChange} onBlur={handleBlur}
                    style={inputs.phone_number.length > 9 ? activeInputStyle : inputStyle}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowTerms(true)} disabled={!isFormValid}
              style={{ ...activeButtonStyle, marginTop: 20, background: isFormValid ? '#2c3e50' : '#dcdcdc', color: isFormValid ? 'white' : '#999', cursor: isFormValid ? 'pointer' : 'default' }}
            >
              인증하고 가입하기
            </button>
          </>
        )}

        {showTerms && (
          <>
            <div onClick={() => setShowTerms(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9 }}></div>
            <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', maxHeight: '85%', background: 'white', zIndex: 10, display: 'flex', flexDirection: 'column', borderTopLeftRadius: 24, borderTopRightRadius: 24, animation: 'slideUp 0.3s ease-out' }}>
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid #eee' }}>
                 <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>약관 동의</h3>
                 <button onClick={() => setShowTerms(false)} style={{ position: 'absolute', right: 24, background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#333" /></button>
              </div>
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <div onClick={handleAllCheck} style={{ background: '#f8f9fa', padding: '20px', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 24 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: agreements.all ? '#0ca678' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Check size={16} color="white" /></div>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>전체 동의</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <TermItem text="서비스 이용약관 (필수)" checked={agreements.term1} onClick={() => handleSingleCheck('term1')} />
                  <TermItem text="개인정보 수집 및 이용 (필수)" checked={agreements.term2} onClick={() => handleSingleCheck('term2')} />
                  <TermItem text="위치기반 서비스 이용약관 (필수)" checked={agreements.term3} onClick={() => handleSingleCheck('term3')} />
                  <TermItem text="이메일 인증 진행 동의 (필수)" checked={agreements.term4} onClick={() => handleSingleCheck('term4')} />
                  <TermItem text="이벤트 마케팅 수신 (선택)" checked={agreements.term5} onClick={() => handleSingleCheck('term5')} />
                </div>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid #eee' }}>
                 <button 
                    onClick={handleConfirmTerms} disabled={isLoading}
                    style={{ ...activeButtonStyle, background: (agreements.term1 && agreements.term2 && agreements.term3 && agreements.term4) ? '#2c3e50' : '#dcdcdc' }}
                 >
                    {isLoading ? '발송 중...' : '동의하고 인증번호 받기'}
                 </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Header title="이메일 인증" onBack={() => setStep(1)} />
            
            <div style={{ flex: 1, paddingTop: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>인증번호를 입력해주세요.</h3>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 30 }}>{inputs.email}로 발송되었습니다.</p>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>인증번호</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    placeholder="인증번호 6자리" maxLength="6"
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 60 }} 
                  />
                  <span style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: '#ff6b6b', fontSize: 14, fontWeight: '500' }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 15, textAlign: 'center', fontSize: 13, color: '#888' }}>
                인증번호를 받지 못하셨나요? 
                <span onClick={handleResend} style={{ marginLeft: 5, color: '#333', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>다시 받기</span>
              </div>
            </div>

            <button 
              onClick={handleFinalVerification} 
              disabled={verifyCode.length < 6 || isLoading}
              style={{ ...activeButtonStyle, marginTop: 20, background: verifyCode.length >= 6 ? '#2c3e50' : '#dcdcdc' }}
            >
              {isLoading ? '가입 처리 중...' : '인증하고 가입 완료'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* --- 하위 컴포넌트 & 스타일 --- */
const TermItem = ({ text, checked, onClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={onClick}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: checked ? 'none' : '1px solid #ddd', background: checked ? '#0ca678' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        {checked && <Check size={14} color="white" />}
      </div>
      <span style={{ fontSize: 14, color: '#333' }}>{text}</span>
    </div>
    <ChevronRight size={18} color="#ccc" />
  </div>
);

const labelStyle = { display: 'block', fontSize: 13, color: '#666', marginBottom: 8 };
const fieldGroupStyle = { marginBottom: 20 };
const errorTextStyle = { display: 'block', fontSize: 12, color: '#ff6b6b', marginTop: 6 };
const inputStyle = { width: '100%', height: 48, padding: '0 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
const activeInputStyle = { ...inputStyle, border: '1px solid #333' };
const activeButtonStyle = { width: '100%', height: 52, borderRadius: 8, border: 'none', background: '#2c3e50', color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' };

const slideUpStyle = document.createElement('style');
slideUpStyle.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
document.head.appendChild(slideUpStyle);

export default WebSignup;
