import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]); // 게시글 목록 상태
  const BASE_URL = 'http://localhost:8080'; // 서버 주소

  // -----------------------------------------------------------
  // 1. [목록 조회] GET /api/items
  // 메인 화면에 뿌려줄 간단한 리스트 정보를 가져옵니다.
  // -----------------------------------------------------------
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items`);
      
      // DB 칼럼명(snake_case) -> 리액트 변수명(camelCase) 변환
      const mappedList = response.data.map(dbItem => ({
        id: dbItem.item_id,
        title: dbItem.name,
        date: dbItem.created_at ? dbItem.created_at.split('T')[0] : '', // 날짜 포맷팅
        image: dbItem.image_url ? `${BASE_URL}${dbItem.image_url}` : null, // 이미지 전체 경로 완성
        status: '보관중'
      }));
      
      setItems(mappedList);
    } catch (error) {
      console.error("목록 로드 실패:", error);
    }
  };

  // 앱 실행 시 목록 한 번 불러오기
  useEffect(() => {
    fetchItems();
  }, []);

  // -----------------------------------------------------------
  // 2. [상세 조회] GET /api/items/:id
  // 클릭한 물건의 상세 정보(설명, 위치 등)를 가져옵니다.
  // -----------------------------------------------------------
  const getItemDetail = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items/${id}`);
      const data = response.data;
      
      return {
        id: data.item_id,
        title: data.name,
        date: data.found_date ? data.found_date.split('T')[0] : '',
        location: `${data.address || ''}`, // 주소 합치기
        category: data.category_name || '기타',
        image: data.image_url ? `${BASE_URL}${data.image_url}` : null,
        status: data.status
      };
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      return null;
    }
  };

  // -----------------------------------------------------------
  // 3. [물건 등록] POST /api/items
  // 입력한 정보와 이미지를 FormData로 묶어서 서버로 보냅니다.
  // -----------------------------------------------------------
  const addItem = async (inputs, imageFile) => {
    try {
      const formData = new FormData();
      
      // 텍스트 데이터 추가 (백엔드 SQL 테이블 필드명과 일치시킴)
      formData.append('name', inputs.title); // 물건 명칭
      formData.append('description', inputs.desc); // 상세 설명
      formData.append('found_date', inputs.date); // 습득 날짜
      
      // ★ 추가된 장소 정보 (WebRegister.jsx에서 넘겨받은 값 그대로 사용)
      formData.append('place_id', inputs.nodeId); // 습득 건물 ID
      formData.append('detail_address', inputs.detailLocation); // 상세 위치

      // 카테고리명(한글) -> 카테고리ID(숫자) 변환 (전체 67종 매핑)
      const categoryMap = { 
          // 1. 가방 (1~3)
          '여성용가방': 1, '남성용가방': 2, '기타가방': 3, 
          // 2. 귀금속 (4~8)
          '반지': 4, '목걸이': 5, '귀걸이': 6, '시계': 7, '기타(귀금속)': 8, 
          // 3. 도서용품 (9~13)
          '학습서적': 9, '소설': 10, '컴퓨터서적': 11, '만화책': 12, '기타서적': 13,
          // 4. 서류 (14~15)
          '서류': 14, '기타(서류)': 15,
          // 5. 쇼핑백 (16)
          '쇼핑백': 16,
          // 6. 스포츠용품 (17)
          '스포츠용품': 17,
          // 7. 악기 (18~22)
          '건반악기': 18, '타악기': 19, '관악기': 20, '현악기': 21, '기타악기': 22,
          // 8. 유가증권 (23~26)
          '어음': 23, '상품권': 24, '채권': 25, '기타(유가증권)': 26,
          // 9. 의류 (27~32)
          '여성의류': 27, '남성의류': 28, '아기의류': 29, '모자': 30, '신발': 31, '기타의류': 32,
          // 10. 자동차 (33~37)
          '자동차열쇠': 33, '네비게이션': 34, '자동차번호판': 35, '임시번호판': 36, '기타(자동차용품)': 37,
          // 11. 전자기기 (38~42)
          '태블릿': 38, '스마트워치': 39, '무선이어폰': 40, '카메라': 41, '기타(전자기기)': 42,
          // 12. 지갑 (43~45)
          '여성용지갑': 43, '남성용지갑': 44, '기타지갑': 45,
          // 13. 증명서 (46~49)
          '신분증': 46, '면허증': 47, '여권': 48, '기타(증명서)': 49,
          // 14. 컴퓨터 (50~53)
          '삼성노트북': 50, 'LG노트북': 51, '애플노트북': 52, '기타(컴퓨터)': 53,
          // 15. 카드 (54~57)
          '신용(체크)카드': 54, '일반카드': 55, '교통카드': 56, '기타카드': 57,
          // 16. 현금 (58)
          '현금': 58,
          // 17. 휴대폰 (59~63)
          '삼성휴대폰': 59, 'LG휴대폰': 60, '아이폰': 61, '기타휴대폰': 62, '기타통신기기': 63,
          // 18. 기타/유류품/무주물 (64~67)
          '기타물품': 64, 
          '무안공항유류품': 65, '유류품': 66,
          '무주물': 67
      };

      // 매핑된 ID가 없으면 '기타물품(64)'으로 기본 처리
      formData.append('category_id', categoryMap[inputs.category] || 64);
            

      // 이미지 파일 추가
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // [서버 전송] (인증 토큰 포함)
      // 회원만 등록할 수 있다면 로컬스토리지에서 토큰을 꺼내 헤더에 담아야 합니다.
      // -----------------------------------------------------------
      const token = localStorage.getItem('token');
      // 서버 전송 (Multipart)
      await axios.post(`${BASE_URL}/api/items`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // 토큰 추가
        }
      });

      fetchItems(); // 목록 갱신
      return true;

    } catch (error) {
      console.error("등록 실패:", error);
      alert(`등록 실패: ${error.response?.data?.error || error.message}`);
      return false;
    }
  };

  return (
    <ItemContext.Provider value={{ items, fetchItems, getItemDetail, addItem, BASE_URL }}>
      {children}
    </ItemContext.Provider>
  );
};
