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
