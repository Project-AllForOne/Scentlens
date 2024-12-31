import React from "react";
import "../css/Main.css"; // CSS 파일 추가
import LoadingScreen from "./loading/LoadingScreen";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Main = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleImageUpload = (file) => {
        if (file) {
            setIsModalOpen(true); // 모달창 열기
            setIsLoading(true); // 로딩 시작

            // 이미지 처리 로직 (예: API 호출)
            setTimeout(() => {
                setIsLoading(false); // 로딩 종료
                setIsModalOpen(false); // 모달창 닫기
                handlePageTransition(); // 페이지 전환 효과
            }, 5000); // 로딩 시간 (5초)
        }
    };

    const handlePageTransition = () => {
        const mainPage = document.querySelector(".main-page");
        mainPage.classList.add("page-transition");
        setTimeout(() => {
            navigate("/scentlens")
        }, 1000); // 애니메이션 시간 후 페이지 이동
    };

    return (
        <div className="main-page">
            {/* 배경 비디오 */}
            <video
                autoPlay
                loop
                muted
                className="background-video"
                src="/videos/scentLens.mp4"
            >
            </video>

            {/* 콘텐츠 영역 */}
            <div className="content">
                <h1 className="title">
                    어떤 향수가 궁금하신가요?
                </h1>
                <div className="button-container">
                    <button
                        className="find-perfume-button"
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        찾아보기
                    </button>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }} // 파일 선택기 숨기기
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                </div>
            </div>

            {/* 모달창 */}
            {isModalOpen && (
                <div className="modal">
                    {isLoading && <LoadingScreen />}
                </div>
            )}
        </div>
    );
};

export default Main;
