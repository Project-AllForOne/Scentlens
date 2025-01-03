import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PerfumeCarousel from './perfume/PerfumeCarousel';
import PerfumeCard from './perfume/PerfumeCard';
import '../css/ScentLens.css';
import { useNavigate } from 'react-router-dom';

function ScentLens() {
    const navigate = useNavigate();
    const [searchedPerfumes, setSearchedPerfumes] = useState([
        {
            name: 'Le Jardin de Monsieur Li',
            brand: 'Hermès',
            description: '금귤, 쿰쿼트의 상큼함과 민트, 자스민의 조화로운 향이 어우러진 에르메스의 정원 시리즈',
            image: 'https://s.cdnsbn.com/images/products/l/18680040106-2.jpg',
            similarity: '98%',
            theme: 'citrus'
        },
        {
            name: 'Light Blue',
            brand: 'Dolce & Gabbana',
            description: '시칠리아 레몬의 상큼함과 사과의 달콤함이 어우러진 여름향수',
            image: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0019/A00000019178901ko.jpg?qt=80',
            similarity: '95%',
            theme: 'citrus'
        },
        {
            name: 'Un Jardin Sur Le Nil',
            brand: 'Hermès',
            description: '그린 망고의 신선함과 로터스의 투명함이 어우러진 나일강의 정원',
            image: 'https://fimgs.net/mdimg/perfume/375x500.18.jpg',
            similarity: '92%',
            theme: 'green'
        },
        {
            name: 'Acqua di Gioia',
            brand: 'Giorgio Armani',
            description: '민트와 레몬의 상쾌함, 자스민의 관능미가 어우러진 여성향수',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Oh_c7WahY4z3w_6bFhvF6MAFwuzkvRgLeA&s',
            similarity: '90%',
            theme: 'aquatic'
        },
        {
            name: 'Wood Sage & Sea Salt',
            brand: 'Jo Malone London',
            description: '바다 소금과 세이지의 미네랄한 향이 어우러진 자연주의 향수',
            image: 'https://static.lottedfs.com/prod/prd-img/39/22/07/02/00/01/10002072239_5.jpg',
            similarity: '88%',
            theme: 'woody'
        }
    ]);

    // 추가 5개 향수 데이터
    const [morePerfumes, setMorePerfumes] = useState([
        {
            name: 'Un Jardin En Méditerranée',
            brand: 'Hermès',
            description: '무화과 나무의 상쾌함과 지중해의 따뜻한 바람을 담은 향수',
            image: 'https://fimgs.net/mdimg/perfume/375x500.19.jpg',
            similarity: '85%',
            theme: 'green'
        },
        {
            name: 'Bergamote 22',
            brand: 'Le Labo',
            description: '베르가못의 시트러스한 향과 페티그레인의 깔끔함이 조화로운 향수',
            image: 'https://cf.bysuco.net/47fc1a1cfa9186c973bd6a2272249094.jpg?w=600',
            similarity: '83%',
            theme: 'citrus'
        },
        {
            name: 'Eau des Merveilles',
            brand: 'Hermès',
            description: '오렌지와 엠버가 어우러진 신비로운 향수',
            image: 'https://mcgrocer.com/cdn/shop/files/a1dcfb953f882326e01fc75ecc13e8eb.jpg?v=1711046607',
            similarity: '80%',
            theme: 'amber'
        },
        {
            name: 'Pomelo Paradis',
            brand: 'Atelier Cologne',
            description: '자몽과 오렌지 꽃이 어우러진 상큼한 시트러스 향수',
            image: 'https://amarisbeauty.com/cdn/shop/products/AC-PomeloParadis.jpg?v=1650865006',
            similarity: '78%',
            theme: 'citrus'
        },
        {
            name: 'Neroli Portofino',
            brand: 'Tom Ford',
            description: '네롤리와 베르가못의 산뜻한 조화가 이탈리아의 여름을 연상시키는 향수',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvRbRkg0ZDJniscHS7jpgH9GjAd1EKogWgfA&s',
            similarity: '75%',
            theme: 'citrus'
        }
    ]);

    const [showMore, setShowMore] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    return (
        <div className={`lens-scent-lens ${searchedPerfumes[currentIndex]?.theme || 'default'}`}>
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
                <div className={`additional-section ${morePerfumes[0]?.theme || 'default'}`}>
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
