'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  size: 'small' | 'medium' | 'large';
  position: 'top' | 'sidebar' | 'bottom';
  isPremium?: boolean;
  className?: string;
}

const mockAds = [
  {
    id: 1,
    title: '🎯 効率的な学習をサポート',
    description: 'オンライン学習プラットフォームで新しいスキルを身につけよう',
    cta: '詳細を見る',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    title: '📚 読書好きのためのアプリ',
    description: '電子書籍を快適に読める新しい読書体験を提供',
    cta: '無料体験',
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 3,
    title: '🎵 音楽ストリーミング',
    description: '高音質で楽しむ音楽配信サービス',
    cta: '今すぐ聴く',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 4,
    title: '🍕 美味しいデリバリー',
    description: '地元の人気レストランから直接お届け',
    cta: '注文する',
    color: 'from-orange-500 to-red-600'
  }
];

export function AdBanner({ size, position, isPremium = false, className = '' }: AdBannerProps) {
  const [currentAd, setCurrentAd] = useState(mockAds[0]);
  const [isVisible, setIsVisible] = useState(true);

  // プレミアムユーザーには広告を表示しない
  if (isPremium) {
    return null;
  }

  // 広告を非表示にした場合
  if (!isVisible) {
    return null;
  }

  useEffect(() => {
    // 30秒ごとに広告を切り替え
    const interval = setInterval(() => {
      setCurrentAd(mockAds[Math.floor(Math.random() * mockAds.length)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'h-20 text-xs',
    medium: 'h-32 text-sm',
    large: 'h-48 text-base'
  };

  const positionClasses = {
    top: 'mb-6',
    sidebar: 'my-4',
    bottom: 'mt-6'
  };

  return (
    <div className={`
      relative rounded-xl overflow-hidden shadow-lg border border-gray-200
      ${sizeClasses[size]} ${positionClasses[position]} ${className}
    `}>
      {/* 広告ラベル */}
      <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full opacity-70">
        広告
      </div>

      {/* 閉じるボタン */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 bg-gray-500 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="広告を閉じる"
      >
        <X size={12} />
      </button>

      {/* 広告コンテンツ */}
      <div className={`
        h-full w-full bg-gradient-to-r ${currentAd.color} 
        flex items-center justify-between p-4 text-white cursor-pointer
        hover:scale-105 transition-transform duration-200
      `}>
        <div className="flex-1">
          <h3 className="font-bold mb-1">{currentAd.title}</h3>
          <p className="opacity-90 leading-tight">{currentAd.description}</p>
        </div>
        
        <div className="ml-4">
          <button className="
            bg-white text-gray-800 px-4 py-2 rounded-lg font-medium
            hover:bg-gray-100 transition-colors duration-200
            text-sm
          ">
            {currentAd.cta}
          </button>
        </div>
      </div>

      {/* プレミアム案内（小さく表示） */}
      <div className="absolute bottom-1 left-2 text-xs text-white opacity-60">
        <span>広告を非表示にするには </span>
        <button className="underline hover:opacity-100">
          プレミアムプラン
        </button>
      </div>
    </div>
  );
} 