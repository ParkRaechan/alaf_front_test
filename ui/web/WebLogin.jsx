// src/ui/web/WebLogin.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WebLogin = () => {
  // -----------------------------------------------------------
  // 1. Context 및 Hook 설정
  // UserContext에서 'login' 함수를 빌려옵니다. (로그인 로직은 Context에 위임)
  // -----------------------------------------------------------
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  
  // 사용자가 입력한 아이디/비번을 저장하는 상태
  const [inputs, setInputs] = useState({ id: '', pw: '' });

  // -----------------------------------------------------------
  // 2. 입력값 변경 핸들러
  // input 태그에 글자를 칠 때마다 state를 업데이트합니다.
  // -----------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  // -----------------------------------------------------------
  // 3. 로그인 제출 핸들러
  // [로그인하기] 버튼을 눌렀을 때 실행됩니다.
  // -----------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault(); // 중요: 폼 제출 시 페이지가 새로고침 되는 것을 막습니다.
    
    // 빈칸 체크
    if (!inputs.id || !inputs.pw) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    axios.post('http://localhost:8080/api/auth/login', { 
      email: inputs.id, 
      password: inputs.pw 
    })
    .then((res) => {
      // 통신 성공 시 실행되는 부분 (기존의 try 역할)
      const { token, user } = res.data;
      localStorage.setItem('token', token); // 브라우저에 토큰 저장

      if (typeof login === 'function') {
        login(user); 
      }
      navigate('/'); // 메인으로 이동
    })
    .catch((error) => {
      // 통신 실패 시 실행되는 부분 (기존의 catch 역할)
      console.error("로그인 에러:", error);
      const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
      alert(errorMsg);
    });
  };


  return (
    // 전체 화면 중앙 정렬 컨테이너
    <div className="pc-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 흰색 로그인 카드 박스 */}
      <div style={{ background: 'white', padding: 50, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: 400, textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: 30 }}>ALAF 로그인</h1>
        
        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input 
            name="id" 
            placeholder="아이디" 
            value={inputs.id} 
            onChange={handleChange}
            style={{ padding: 15, borderRadius: 10, border: '1px solid #ddd', fontSize: 16 }}
          />
          <input 
            name="pw" 
            type="password" 
            placeholder="비밀번호" 
            value={inputs.pw} 
            onChange={handleChange}
            style={{ padding: 15, borderRadius: 10, border: '1px solid #ddd', fontSize: 16 }}
          />
          <button 
            type="submit"
            style={{ padding: 15, marginTop: 10, background: '#2c3e50', color: 'white', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', border:'none' }}
          >
            로그인하기
          </button>
        </form>

        {/* 하단 링크 (회원가입 / 메인으로) */}
        <p style={{ marginTop: 20, color: '#888', fontSize: 14 }}>
            계정이 없으신가요? <span onClick={() => navigate('/signup')}
            style={{ textDecoration:'underline', cursor:'pointer', color:'#2c3e50', fontWeight:'bold' }}>회원가입</span>
        </p>
        <button 
            onClick={() => navigate('/')} 
            style={{ marginTop: 10, background:'none', border:'none', color: '#aaa', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
        >
            메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default WebLogin;
