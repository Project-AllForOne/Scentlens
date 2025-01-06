import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PerfumeCarousel from './perfume/PerfumeCarousel';
import PerfumeCard from './perfume/PerfumeCard';
import '../css/ScentLens.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from './ThemeEffect';

function ScentLens() {
    const navigate = useNavigate(); // 페이지 이동 함수
    const location = useLocation(); // location.state로 전달된 데이터 확인
    const [searchedPerfumes, setSearchedPerfumes] = useState([]);   // 검색된 향수 데이터
    const [morePerfumes, setMorePerfumes] = useState([]); // 추가 5개 향수 데이터
    const [currentIndex, setCurrentIndex] = useState(0);    // 현재 향수 인덱스
    const [showMore, setShowMore] = useState(false);    // 추가 향수 섹션 보이기 여부

    useEffect(() => {
        const fetchPerfumeDetails = async () => {
            try {
                const similarityResults = location.state?.results || [];
                const response = await axios.post('http://localhost:8000/get_perfume_details/', {
                    results: similarityResults,
                });
                setSearchedPerfumes(response.data.perfumes || []);
            } catch (error) {
                console.error('향수 데이터를 불러오는 데 실패했습니다.', error);
            }
        };

        fetchPerfumeDetails();
    }, [location.state?.results]);


    // 메인 캐러셀 자동 슬라이드 효과
    // 3초마다 다음 향수로 자동 전환
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % searchedPerfumes.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [searchedPerfumes.length]);

    const additionalSectionRef = useRef(null);

    // 더보기/접기 버튼 클릭 시 실행되는 함수
    const handleMoreClick = () => {
        setShowMore(!showMore);
        // 버튼 클릭 시 추가 향수 섹션으로 이동
        if (!showMore) {
            setTimeout(() => {
                additionalSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const currentTheme = useTheme();

    return (
        <div className={`lens-scent-lens ${currentTheme}`}>
            {/* 뒤로가기 버튼 추가 */}
            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                뒤로가기
            </button>

            {/* 메인 섹션 */}
            <div className="main-section">
                <div className="title-container">
                    <h2>이미지와 가장 유사한 향수</h2>
                </div>

                {/* 캐러셀 컴포넌트 */}
                <div className="carousel-container">
                    <PerfumeCarousel
                        perfumes={searchedPerfumes}
                        currentIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                    />
                </div>
            </div>

            {/* 더보기/접기 버튼 */}
            <div className="button-container">
                <motion.button
                    className="more-button"
                    onClick={handleMoreClick}
                    whileHover={{ scale: 1.05 }}
                >
                    {showMore ? '접기' : '더 많은 유사 향수 보기'}
                </motion.button>
            </div>

            {/* 추가 향수 섹션 - showMore가 true일 때 표시 */}
            {showMore && (
                <div className={`additional-section ${currentTheme}`}>
                    <h2>추가 유사 향수</h2>
                    <div className="additional-perfumes">
                        {morePerfumes.map((perfume, index) => (
                            <PerfumeCard key={index} perfume={perfume} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScentLens;
