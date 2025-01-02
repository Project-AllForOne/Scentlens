import React from "react";
import ReactCrop from "react-image-crop";
import "../css/image-crop/ReactCrop.css";
import "../css/Main.css"
import LoadingScreen from "./loading/LoadingScreen";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Main = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [crop, setCrop] = useState({
        unit: '%',
        x: 0,
        y: 0,
        width: 50,
        height: 50,
    });
    const [croppedImage, setCroppedImage] = useState(null); // 크롭된 이미지 저장
    const imageRef = useRef(null);
    const previewCanvasRef = useRef(null);

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

    const handleImageLoaded = (image) => {
        const img = image.target;
        imageRef.current = img;

        // 이미지 크기를 기반으로 초기 크롭 영역 설정
        const width = img.naturalWidth * 0.8; // 이미지 너비의 80%
        const height = img.naturalHeight * 0.8; // 이미지 높이의 80%
        const x = (img.naturalWidth - width) / 2; // 중앙 정렬
        const y = (img.naturalHeight - height) / 2; // 중앙 정렬

        // 크롭 영역을 이미지 전체에 맞추기
        setCrop({
            unit: 'px',
            x: width * 0.1,
            y: height * 0.1,
            width: width * 0.8,
            height: height * 0.8
        });
    };

    // 크롭 완료 시 처리
    const handleCropComplete = (crop) => {
        if (crop.width && crop.height) {
            generateCroppedImage(crop);
        }
    };

    // 크롭된 이미지 생성
    const generateCroppedImage = (crop) => {
        const image = imageRef.current;
        if (!imageRef.current || !crop.width || !crop.height) return;

        const canvas = document.createElement("canvas");
        const scaleX = image.current.naturalWidth / image.current.width;
        const scaleY = image.current.naturalHeight / image.current.height;

        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");


        ctx.drawImage(
            imageRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        // Blob으로 변환 후 URL 생성
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const croppedImageUrl = URL.createObjectURL(blob);
                    resolve(croppedImageUrl);
                }
            }, "image/jpeg");
        });
    };

    const handleCropConfirm = async () => {
        setIsLoading(true);

        // 크롭된 이미지가 있으면 사용, 없으면 원본 이미지 사용
        const finalImage = croppedImage || imageSrc;

        console.log("Final Image:", finalImage);

        setTimeout(() => {
            setIsLoading(false);
            setIsModalOpen(false);
            handlePageTransition(); // 페이지 전환 효과
        }, 3000);
    };

    useEffect(() => {
    }, [imageSrc, isModalOpen]);

    // 취소 버튼 처리
    const handleCancel = () => {
        setImageSrc(null); // 이미지 초기화
        setCroppedImage(null); // 크롭된 이미지 초기화
        setCrop({ aspect: 16 / 9 }); // 기본 크롭 상태로 초기화
        setIsModalOpen(false); // 모달 닫기
        imageRef.current = null; // 이미지 참조 초기화
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
                    {imageSrc && (
                        <div className="crop-container">
                            <ReactCrop
                                src={imageSrc}
                                crop={crop}
                                onChange={(newCrop) => setCrop(newCrop)}
                                onComplete={(crop) => handleCropComplete(crop)}
                                onImageLoaded={(img) => handleImageLoaded(img)}
                                keepSelection
                                restrictPosition // 크롭 영역이 이미지 밖으로 나가지 않도록 제한
                                style={{
                                    maxWidth: '100%', // 모달창 안에 맞추기
                                    maxHeight: '100%',
                                    objectFit: 'contain', // 이미지를 크롭 컨테이너에 맞춤
                                }}
                            >
                                <img
                                    ref={imageRef}
                                    alt="Crop"
                                    src={imageSrc}
                                    onLoad={handleImageLoaded}
                                    style={{
                                        display: "block",
                                        margin: "0 auto", // 중앙 정렬
                                        maxWidth: "100%", // 모달 내에서 이미지 크기 제한
                                        maxHeight: "100%",
                                        objectFit: "contain", // 이미지 전체를 보여줌
                                    }}
                                />
                            </ReactCrop>
                            <div className="crop-actions">
                                <button onClick={handleCropConfirm}>확인</button>
                                <button onClick={handleCancel}>취소</button>
                            </div>
                        </div>
                    )}
                    {isLoading && <LoadingScreen />}
                </div>
            )}
        </div>
    );
};

export default Main;
