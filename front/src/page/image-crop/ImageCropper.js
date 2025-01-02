import { transform } from 'framer-motion';
import React, { useState, useRef } from 'react';
import { ReactCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 30,
        height: 30,
        x: 35,
        y: 35
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop({
            unit: '%',
            width: 100,
            height: 100,
            x: 0,
            y: 0
        });
        imgRef.current = e.currentTarget;
    };

    const generateCroppedImage = async (crop) => {
        if (!crop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = Math.floor(crop.width * scaleX);
        canvas.height = Math.floor(crop.height * scaleY);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            ctx.drawImage(
                image,
                Math.floor(crop.x * scaleX),
                Math.floor(crop.y * scaleY),
                Math.floor(crop.width * scaleX),
                Math.floor(crop.height * scaleY),
                0,
                0,
                Math.floor(crop.width * scaleX),
                Math.floor(crop.height * scaleY)
            );

            return new Promise((resolve) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            console.error('Canvas is empty');
                            return;
                        }
                        const croppedImageUrl = URL.createObjectURL(blob);
                        resolve(croppedImageUrl);
                    },
                    'image/jpeg',
                    1
                );
            });
        } catch (error) {
            console.error('Error during image cropping:', error);
            return null;
        }
    };

    const handleCropComplete = async () => {
        if (!completedCrop) {
            // 크롭 영역이 없으면 전체 이미지 사용
            onCropComplete(image);
            return;
        }

        try {
            const croppedImage = await generateCroppedImage(completedCrop);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (error) {
            console.error('Error handling crop complete:', error);
        }
    };

    // 스타일 객체 정의
    const buttonWrapperStyle = {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translate(-80px, -40px)',
        display: 'flex',
        gap: '15px',
        zIndex: 1000
    };

    const buttonStyle = {
        padding: '8px 24px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(5px)',
        color: 'white',
        fontFamily: 'Gowun Batang, serif',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    return (
        <div className="crop-container">
            <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
            >
                <img
                    ref={imgRef}
                    src={image}
                    alt="Crop me"
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                    onLoad={onImageLoad}
                    crossOrigin="anonymous"
                />
            </ReactCrop>
            <div style={buttonWrapperStyle}>
                <button
                    style={buttonStyle}
                    onClick={handleCropComplete}
                    onMouseOver={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    확인
                </button>
                <button
                    style={buttonStyle}
                    onClick={onCancel}
                    onMouseOver={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;