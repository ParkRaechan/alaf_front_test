import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/admin/requests', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("목록 로드 실패", error);
        }
    };

    const handleProcess = async (requestId, action) => {
        if (!window.confirm(`정말 ${action === 'APPROVE' ? '승인' : '거절'} 처리하시겠습니까?`)) return;

        try {
            await axios.post(`http://localhost:8080/api/admin/requests/${requestId}/process`, { action }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('처리 완료!');
            loadRequests(); // 목록 새로고침
        } catch (error) {
            alert('처리 실패');
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
            <h2>🛡️ 관리자: 회수 신청 심사 목록</h2>
            {requests.length === 0 && <p>현재 대기 중인 신청이 없습니다.</p>}

            {requests.map((req) => (
                <div key={req.request_id} style={{ display: 'flex', gap: 20, background: 'white', padding: 20, marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    
                    {/* 왼쪽: 시스템에 등록된 원본 데이터 */}
                    <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: 20 }}>
                        <h3 style={{ color: '#868e96' }}>[기존 물품 정보]</h3>
                        <p><strong>물품명:</strong> {req.item_name}</p>
                        <p><strong>발견장소:</strong> {req.original_address} ({req.original_detail_address})</p>
                        <p><strong>상세설명:</strong> {req.original_desc}</p>
                        {req.original_image && <img src={`http://localhost:8080${req.original_image}`} alt="원본" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 10, border: '1px solid #ddd' }} />}
                    </div>

                    {/* 오른쪽: 사용자가 제출한 증거 데이터 */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#2b8a3e' }}>[사용자 제출 증거]</h3>
                        <p><strong>신청자:</strong> {req.requester_name} ({req.requester_email})</p>
                        <p><strong>주장하는 상세장소:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{req.proof_detail_address}</span></p>
                        <p><strong>주장하는 특징:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{req.proof_description}</span></p>
                        {req.proof_image_url && <img src={`http://localhost:8080${req.proof_image_url}`} alt="증거" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 10, border: '1px solid #ddd' }} />}
                    </div>

                    {/* 버튼 영역 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                        <button onClick={() => handleProcess(req.request_id, 'APPROVE')} style={{ padding: '15px 30px', background: '#228be6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>승인하기</button>
                        <button onClick={() => handleProcess(req.request_id, 'REJECT')} style={{ padding: '15px 30px', background: '#fa5252', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>거절하기</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminRequests;
