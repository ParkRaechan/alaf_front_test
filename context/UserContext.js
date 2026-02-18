// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 로그인 상태 관리
  const [user, setUser] = useState(null); 

  // -----------------------------------------------------------
  // [초기화] 앱 실행(새로고침) 시 로컬 스토리지 확인
  // -----------------------------------------------------------
  useEffect(() => {
    // 로컬 스토리지에 토큰이 있는지 확인
    const token = localStorage.getItem('token');
    // 로컬 스토리지에 유저 정보(JSON 문자열)가 저장되어 있는지 확인
    const storedUser = localStorage.getItem('user'); 

    if (token && storedUser) {
      // 정보가 있으면 파싱해서 상태에 복구 (로그인 유지)
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // -----------------------------------------------------------
  // [로그인 함수]
  // WebLogin.jsx에서 백엔드 통신 성공 후 넘겨준 user 객체를 받아서 저장
  // -----------------------------------------------------------
  const login = (userData) => {
    setUser(userData);
    // 새로고침해도 정보가 날아가지 않도록 로컬 스토리지에 유저 정보 저장
    localStorage.setItem('user', JSON.stringify(userData)); 
    return true; 
  };

  // -----------------------------------------------------------
  // [로그아웃 함수]
  // -----------------------------------------------------------
  const logout = () => {
    setUser(null); // 상태 초기화
    localStorage.removeItem('token'); // 토큰 삭제
    localStorage.removeItem('user');  // 유저 정보 삭제
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
