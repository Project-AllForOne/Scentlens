import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import '../css/ScentLens.css';

function ScentLens() {
    const [recommendedPerfume, setRecommendedPerfume] = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            // 가상 향수 데이터
            const realPerfume = {
                theme: 'floral',
                name: 'Chanel No. 5',
                brand: 'Chanel',
                description: '장미, 자스민, 바닐라 향이 어우러진 시대를 초월한 상징적인 플로럴 향수.',
                image: 'https://www.chanel.com/images//t_one//w_0.51,h_0.51,c_crop/q_auto:good,f_autoplus,fl_lossy,dpr_1.1/w_1240/n-5-eau-de-parfum-spray-3-4fl-oz--packshot-default-125530-9539148742686.jpg', // 실제 경로로 수정 필요
            };

            // API 호출 대신 가상 데이터 설정
            setTimeout(() => {
                setRecommendedPerfume(realPerfume);
            });
        };

        fetchRecommendation();
    }, []);

    return (
        <div className={`lens-scent-lens ${recommendedPerfume?.theme || 'default'}`}>
            {recommendedPerfume ? (
                <motion.div
                    className="lens-perfume-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.img
                        src={recommendedPerfume.image}
                        alt={recommendedPerfume.name}
                        className="lens-perfume-image"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />
                    <motion.h2
                        className="lens-perfume-name"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        {recommendedPerfume.name}
                    </motion.h2>
                    <motion.p
                        className="lens-perfume-brand"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        {recommendedPerfume.brand}
                    </motion.p>
                    <motion.p
                        className="lens-perfume-description"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                    >
                        {recommendedPerfume.description}
                    </motion.p>
                </motion.div>
            ) : (
                <p className="lens-loading-message">일치하는 향수를 가져오는 중...</p>
            )}
        </div>
    );
}

export default ScentLens;
