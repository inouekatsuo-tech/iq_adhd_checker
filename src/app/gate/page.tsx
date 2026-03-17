'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestResult } from '@/lib/types';

// 日本の平均健康寿命（厚生労働省）
const HEALTHY_LIFESPAN = { male: 72.57, female: 75.45, other: 74.01 };

// Kanael ストアリンク（本番URLに差し替え）
const APPSTORE_URL = 'https://apps.apple.com/jp/app/%E3%82%AB%E3%83%8A%E3%82%A8%E3%83%AB-%E5%A4%A2-%E3%82%84%E3%82%8A%E3%81%9F%E3%81%84%E3%81%93%E3%81%A8%E7%AE%A1%E7%90%86%E3%82%A2%E3%83%97%E3%83%AA/id6742744159';
const GOOGLEPLAY_URL = 'https://play.google.com/store/apps/details?id=com.kanaeru.kanaeru&pcampaignid=web_share';

export default function GatePage() {
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isNegative, setIsNegative] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('testResult');
    if (!stored) {
      router.push('/');
      return;
    }
    const parsed: TestResult = JSON.parse(stored);
    setResult(parsed);

    // 残り健康寿命を計算
    const gender = parsed.userInfo.gender;
    const lifespan = gender === 'male'
      ? HEALTHY_LIFESPAN.male
      : gender === 'female'
        ? HEALTHY_LIFESPAN.female
        : HEALTHY_LIFESPAN.other;

    const rawDays = (lifespan - parsed.userInfo.age) * 365.25;
    if (rawDays <= 0) {
      setIsNegative(true);
      setRemainingDays(0);
    } else {
      setRemainingDays(Math.round(rawDays));
    }
  }, [router]);

  const handleStoreOpen = (url: string) => {
    window.open(url, '_blank');
  };

  const handleSkip = () => {
    router.push('/result');
  };

  if (!result) return null;

  const { userInfo } = result;
  const genderLabel = userInfo.gender === 'male' ? '男性' : userInfo.gender === 'female' ? '女性' : 'その他';
  const lifeExpectancy = userInfo.gender === 'male' ? '72.57' : userInfo.gender === 'female' ? '75.45' : '74.01';
  const formattedDays = remainingDays.toLocaleString('ja-JP');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full">

        {/* ✕ ボタン（右上） */}
        <div className="flex justify-end mb-3">
          <button
            onClick={handleSkip}
            aria-label="スキップして結果を見る"
            className="w-9 h-9 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors text-lg font-bold backdrop-blur-sm"
          >
            ✕
          </button>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

          {/* ヘッダー帯 */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white text-center">
            <div className="text-3xl mb-1">⏳</div>
            <p className="text-indigo-100 text-sm font-medium">
              {userInfo.name}さん（{userInfo.age}歳・{genderLabel}）の
            </p>
            <h2 className="text-lg font-bold mt-1">
              元気で健康に過ごせる残りの人生
            </h2>
          </div>

          {/* 残り日数 */}
          <div className="px-6 py-6 text-center border-b border-gray-100">
            {isNegative ? (
              <div>
                <p className="text-gray-500 text-sm mb-2">健康寿命（{lifeExpectancy}歳）を超えています</p>
                <p className="text-2xl font-bold text-gray-700">毎日を大切に！</p>
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">残り約</div>
                <div className="text-6xl font-black text-indigo-700 leading-none mb-1 tracking-tight">
                  {formattedDays}
                </div>
                <div className="text-xl font-bold text-indigo-900 mb-3">日 ！</div>
                <p className="text-xs text-gray-400">
                  健康寿命 {lifeExpectancy}歳 基準
                  （厚生労働省 2019年度調査）
                </p>
              </>
            )}
          </div>

          {/* CTA テキスト */}
          <div className="px-6 pt-5 pb-4 text-center">
            <p className="text-gray-800 font-bold text-base leading-snug mb-1">
              死ぬまでにやりたいことリストを<br />作りましょう！
            </p>
            <p className="text-gray-500 text-sm mt-2">
              叶えたいことリストの管理は
              <span className="text-purple-600 font-bold">「カナエル」</span>
            </p>
            <p className="text-gray-400 text-xs mt-1">こちらからダウンロード！</p>
          </div>

          {/* ダウンロードボタン */}
          <div className="px-6 pb-4 space-y-3">
            <button
              onClick={() => handleStoreOpen(APPSTORE_URL)}
              className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 814 1000">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.1 134.7-316.8 267.3-316.8 70.8 0 129.7 46.5 175 46.5 43.1 0 110.9-49 192.5-49 31 0 108.2 2.6 168.1 80.5zm-80.1-63.8c-31.6-37.9-76.6-71-142.5-71-48.1 0-92.3 19.8-130.3 51.7-34.2 29.2-66 74-66 131.5 0 7.1.6 14.2 1.9 20.5 3.2.6 8.4 1.3 13.6 1.3 43.1 0 89.5-21.1 121.7-51.7 37.9-35.5 64.8-84.5 64.8-131.5 0-4.9-.6-9.7-1.9-14.5-20.5-37.9-63.5-81.5-61.3-36.3z"/>
              </svg>
              App Store でダウンロード
            </button>

            <button
              onClick={() => handleStoreOpen(GOOGLEPLAY_URL)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 512 512">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.6-232.6L47 0zm425.6 225.6l-58.9-34-67.9 67.8 67.9 67.8 60.1-34.5c17.1-9.8 17.1-33.4.8-41.1zm-166.2 0L88.5 4l281.2 224.7z"/>
              </svg>
              Google Play でダウンロード
            </button>
          </div>

          {/* スキップリンク */}
          <div className="px-6 pb-6 text-center">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm underline underline-offset-2 transition-colors"
            >
              スキップして診断結果を見る →
            </button>
          </div>
        </div>

        {/* サブコピー */}
        <p className="text-center text-indigo-200/60 text-xs mt-4">
          残り {formattedDays} 日、やりたいことを全部叶えよう
        </p>
      </div>
    </main>
  );
}
