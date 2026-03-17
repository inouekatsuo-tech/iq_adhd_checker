'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TestResult } from '@/lib/types';
import { generateResultImage } from '@/lib/generateResultImage';

const ADHD_CONFIG = {
  none:     { label: '非該当',     emoji: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-300', cardBg: '#ecfdf5', cardText: '#059669' },
  mild:     { label: '軽症傾向',   emoji: '🟡', color: 'text-yellow-600',  bg: 'bg-yellow-50',  border: 'border-yellow-300',  cardBg: '#fefce8', cardText: '#ca8a04' },
  moderate: { label: '中程度傾向', emoji: '🟠', color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-300',  cardBg: '#fff7ed', cardText: '#ea580c' },
  high:     { label: '高傾向',     emoji: '🔴', color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-300',     cardBg: '#fef2f2', cardText: '#dc2626' },
};

const AGE_LABELS: Record<string, string> = {
  '10s': '10代', '20s': '20代', '30s': '30代',
  '40s': '40代', '50s': '50代', '60plus': '60代以上',
};

function ResultContent() {
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iq-adhd-checker.vercel.app';

  useEffect(() => {
    const stored = localStorage.getItem('testResult');
    if (!stored) {
      router.push('/');
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  // ── 画像として保存（Canvas API） ──
  const handleSaveImage = async () => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const dataUrl = await generateResultImage(result, appUrl);
      const link = document.createElement('a');
      link.download = 'adhd_iq_result.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert('画像の保存に失敗しました。スクリーンショットをご利用ください。');
    } finally {
      setSaving(false);
    }
  };

  // ── Xでシェア ──
  const handleXShare = () => {
    if (!result) return;
    const text = `【ADHD×IQ診断】\nIQ: ${result.iqScore}（${result.iqPercentileText}）🧠\nADHD傾向: ${result.adhdType}\n\nあなたは何点？↓\n${appUrl}\n#ADHD診断 #IQテスト`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  // ── Threadsでシェア ──
  const handleThreadsShare = () => {
    if (!result) return;
    const text = `【ADHD×IQ診断】\nIQ: ${result.iqScore}（${result.iqPercentileText}）🧠\nADHD傾向: ${result.adhdType}\n\nあなたは何点？↓\n${appUrl}\n#ADHD診断 #IQテスト`;
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  if (!result) return null;

  const adhdCfg = ADHD_CONFIG[result.adhdLevel];
  const iqPct = Math.min(100, Math.max(0, ((result.iqScore - 70) / 60) * 100));
  const genderLabel = result.userInfo.gender === 'male' ? '男性' : result.userInfo.gender === 'female' ? '女性' : 'その他';

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* ページタイトル */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">診断結果</h1>
          <p className="text-gray-500 text-sm mt-1">
            {result.userInfo.name}さん（{AGE_LABELS[result.userInfo.ageGroup]}・{result.userInfo.age}歳・{genderLabel}）
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━
            シェア用カード（画像として保存する範囲）
            ━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div
          className="rounded-3xl overflow-hidden shadow-lg mb-6"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)' }}
        >
          {/* カードヘッダー */}
          <div className="px-7 pt-7 pb-5 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-xs font-medium tracking-widest uppercase">ADHD × IQ 診断</span>
              <span className="text-white/60 text-xs">{result.userInfo.name}さん</span>
            </div>
            <div className="flex items-end gap-4 mt-3">
              <div>
                <div className="text-white/70 text-xs mb-1">推定 IQ スコア</div>
                <div className="text-7xl font-black leading-none tracking-tight">{result.iqScore}</div>
              </div>
              <div className="pb-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-bold text-white">
                  {result.iqPercentileText}
                </div>
              </div>
            </div>
          </div>

          {/* IQゲージ */}
          <div className="px-7 pb-5">
            <div className="flex justify-between text-white/50 text-xs mb-1.5">
              <span>70</span><span>85</span><span>100</span><span>115</span><span>130+</span>
            </div>
            <div className="relative w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full"
                style={{ width: `${iqPct}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                style={{ left: `calc(${Math.min(93, iqPct)}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>低い</span><span>平均以下</span><span>平均</span><span>高い</span>
            </div>
          </div>

          {/* ADHD結果 */}
          <div className="mx-5 mb-5 rounded-2xl p-5" style={{ backgroundColor: adhdCfg.cardBg }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium mb-0.5">ADHD 傾向チェック</div>
                <div className="text-xl font-bold" style={{ color: adhdCfg.cardText }}>
                  {adhdCfg.emoji} {result.adhdType}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">該当数</div>
                <div className="text-2xl font-black" style={{ color: adhdCfg.cardText }}>
                  {result.adhdPositiveCount}<span className="text-sm font-normal">/12</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{result.adhdComment}</p>
          </div>

          {/* カードフッター（シェア用） */}
          <div className="px-7 pb-6 flex items-center justify-between">
            <span className="text-white/50 text-xs">#ADHD診断 #IQテスト</span>
            <span className="text-white/50 text-xs">
              {appUrl.replace('https://', '')}
            </span>
          </div>
        </div>
        {/* ━━━ シェアカードここまで ━━━ */}

        {/* 免責表示 */}
        <div className="bg-white/70 rounded-2xl px-5 py-4 mb-6 border border-gray-100">
          <div className="text-xs text-gray-400 space-y-1">
            <div>参照: ASRS-v1.1（WHO Adult ADHD Self-Report Scale）</div>
            <div>IQ推定: Raven's Progressive Matrices・WAIS-IV準拠問題を使用</div>
            <div className="text-red-400 font-medium pt-1">
              ※このテストは医療診断ではありません。正確な診断は専門医にご相談ください。
            </div>
          </div>
        </div>

        {/* アクションボタン群 */}
        <div className="space-y-3">

          {/* 画像保存ボタン */}
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                生成中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                結果画像を保存する
              </>
            )}
          </button>

          {/* Xシェアボタン */}
          <button
            onClick={handleXShare}
            className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="font-black text-lg">𝕏</span>
            結果をXでシェアする
          </button>

          {/* Threadsシェアボタン */}
          <button
            onClick={handleThreadsShare}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
              <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 150.635 120.491C153.842 129.978 154.006 145.501 142.595 156.602C132.63 166.283 120.939 170.637 100.783 170.853C78.2747 170.617 61.2421 163.636 50.0441 150.174C39.1737 137.124 33.5649 118.185 33.3409 94C33.5649 69.8151 39.1737 50.8762 50.0441 37.8263C61.2421 24.3645 78.2747 17.3835 100.783 17.1472C123.404 17.3835 140.586 24.4 151.846 37.9041C157.402 44.5629 161.576 53.0537 164.308 63.0994L180.43 58.8132C177.08 46.4321 171.894 35.8375 164.91 27.1473C150.582 9.44309 129.428 0.244841 100.87 0H100.783C72.2885 0.244841 51.2233 9.40127 36.9445 27.0234C24.2491 42.8162 17.6392 65.0776 17.4055 93.9447L17.4041 94L17.4055 94.0553C17.6392 122.922 24.2491 145.184 36.9445 160.977C51.2233 178.599 72.2885 187.755 100.783 188H100.87C126.354 187.768 144.008 181.213 157.074 168.374C173.23 152.443 172.725 132.665 168.526 120.498C165.032 110.254 158.01 101.99 148.075 96.3528L141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5096 102.976 98.4483 104.871 98.4483C111.106 98.4483 116.939 99.0876 122.242 100.303C120.313 124.293 108.936 128.946 98.4405 129.507Z"/>
            </svg>
            結果をThreadsでシェアする
          </button>

          {/* もう一度 */}
          <button
            onClick={() => {
              localStorage.removeItem('testResult');
              localStorage.removeItem('resultUnlocked');
              router.push('/');
            }}
            className="w-full py-3 border-2 border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            もう一度テストを受ける
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
