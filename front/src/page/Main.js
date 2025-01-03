import React from "react";
import "../css/Main.css"
import LoadingScreen from "./loading/LoadingScreen";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCropper from "./image/ImageCropper";

const Main = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const navigate = useNavigate();

    const handleImageUpload = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                // imageRef.current = null; // 이전 이미지 참조 초기화
                setIsModalOpen(true); // 모달 열기
            };
            reader.readAsDataURL(file); // 이미지 파일 읽기
        }
        document.getElementById("file-input").value = ""; // 파일 입력값 초기화
    }

    // 크롭 완료 시 처리
    const handleCropComplete = (croppedImage) => {
        setIsLoading(true);
        console.log("Cropped Image:", croppedImage);

        setTimeout(() => {
            setIsLoading(false);
            setIsModalOpen(false);
            handlePageTransition();
        }, 3000);
    };

    // 취소 버튼 처리
    const handleCancel = () => {
        setImageSrc(null);
        setIsModalOpen(false);
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
                    <div className="modal-content">
                        {imageSrc && (
                            <ImageCropper
                                image={imageSrc}
                                onCropComplete={handleCropComplete}
                                onCancel={handleCancel}
                            />
                        )}
                    </div>
                </div>
            )}

            {isLoading && <LoadingScreen />}
        </div>
    );
};

export default Main;
