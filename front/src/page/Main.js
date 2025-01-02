import React from "react";
import ReactCrop from "react-image-crop";
import "../css/image-crop/ReactCrop.css";
import "../css/Main.css"
import LoadingScreen from "./loading/LoadingScreen";
import { useState, useRef,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Main = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({
        unit: '%',
        width: 50,
        aspect: 16 / 9, // 기본 비율 유지
    });
    const [croppedImage, setCroppedImage] = useState(null); // 크롭된 이미지 저장
    const imageRef = useRef(null);

    const navigate = useNavigate();

    const handleImageUpload = (file) => {
        if (file) {
            console.log("File Object:", file);
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                console.log("Image Source:", reader.result);
                imageRef.current = null; // 이전 이미지 참조 초기화
                setIsModalOpen(true); // 모달 열기
            };
            reader.readAsDataURL(file); // 이미지 파일 읽기
        }
        document.getElementById("file-input").value = ""; // 파일 입력값 초기화
    }

    const handleImageLoaded = (image) => {
        console.log("Image Loaded into ReactCrop:", image);
        imageRef.current = image;
    
        const initialCrop = {
            unit: "px", // 픽셀 단위로 설정
            x: 0,
            y: 0,
            width: image.naturalWidth / 2, // 이미지 너비의 절반
            height: image.naturalHeight / 2, // 이미지 높이의 절반
        };
    
        console.log("Image loaded successfully:", image);
        setCrop(initialCrop); // 정확한 초기 crop 값 설정
    };

    // 크롭 완료 시 처리
    const handleCropComplete = (crop) => {
        if (crop.width && crop.height) {
            generateCroppedImage(crop);
        }
    };

    // 크롭된 이미지 생성
    const generateCroppedImage = (crop) => {
        if (!imageRef.current || !crop.width || !crop.height) return;

        const canvas = document.createElement("canvas");
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            imageRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        canvas.toBlob((blob) => {
            const croppedImageUrl = URL.createObjectURL(blob);
            setCroppedImage(croppedImageUrl); // 크롭된 이미지 URL 저장
        }, "image/jpeg");
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
        console.log("Current Image Source:", imageSrc);
        console.log("Modal Open:", isModalOpen);
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
                        onChange={(e) => {
                            console.log("Input Changed:", e.target.files[0]); // 디버깅
                            handleImageUpload(e.target.files[0]);
                        }}
                    />
                </div>
            </div>

            {/* 모달창 */}
            {isModalOpen && (
                <div className="modal">
                    {imageSrc && (
                        <div className="crop-container">
                            <ReactCrop
                                key={imageSrc}  // key를 imageSrc로 설정하여 강제 재렌더링
                                src={imageSrc}
                                crop={crop}
                                className="react-crop"
                                onImageLoaded={(image) => {
                                    console.log("ReactCrop Image Loaded:", image);
                                    handleImageLoaded(image);
                                }}
                                onChange={(newCrop) => {
                                    console.log("Crop Changed:", newCrop);
                                    setCrop(newCrop);
                                }}
                                onComplete={(crop) => {
                                    console.log("Crop Complete:", crop);
                                    handleCropComplete(crop);
                                }}
                            />
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
