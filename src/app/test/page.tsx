'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, ADHD_OPTIONS } from '@/lib/questions';
import { calculateResults } from '@/lib/scoring';
import { UserInfo } from '@/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  adhd_a: 'ADHDチェック（不注意）',
  adhd_b: 'ADHDチェック（多動・衝動）',
  figure: '図形・認知推論',
  sequence: '数列推論',
  memory: 'ワーキングメモリ',
};

// ===== SVG図形パターンコンポーネント =====
function FigurePattern({ id }: { id: number }) {
  const cell = (isQ: boolean) => ({
    fill: isQ ? '#F9FAFB' : '#EEF2FF',
    stroke: isQ ? '#9CA3AF' : '#6366F1',
    strokeWidth: 2,
    strokeDasharray: isQ ? '4 2' : undefined,
  });

  // Q28: 矢印の回転シーケンス → ↓ ← ↑ → ?
  if (id === 28) {
    const symbols = ['→', '↓', '←', '↑', '→', '?'];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 396 80" className="w-full max-w-sm mx-auto block">
          {symbols.map((sym, i) => {
            const cx = 33 + i * 66;
            const isQ = i === 5;
            return (
              <g key={i}>
                <circle cx={cx} cy={40} r={28} {...cell(isQ)} />
                <text x={cx} y={49} textAnchor="middle" fontSize={22}
                  fill={isQ ? '#9CA3AF' : '#4F46E5'} fontFamily="sans-serif">
                  {sym}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Q29: 2×2マトリクス ●○ / ○ ?
  if (id === 29) {
    const cells = [
      { col: 0, row: 0, type: 'filled' },
      { col: 1, row: 0, type: 'empty' },
      { col: 0, row: 1, type: 'empty' },
      { col: 1, row: 1, type: 'question' },
    ];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 190 190" className="w-44 mx-auto block">
          {cells.map((c, i) => {
            const cx = 45 + c.col * 100;
            const cy = 45 + c.row * 100;
            const isQ = c.type === 'question';
            return (
              <g key={i}>
                <rect x={cx - 38} y={cy - 38} width={76} height={76} rx={8} {...cell(isQ)} />
                {isQ ? (
                  <text x={cx} y={cy + 11} textAnchor="middle" fontSize={28} fill="#9CA3AF">?</text>
                ) : c.type === 'filled' ? (
                  <circle cx={cx} cy={cy} r={24} fill="#4F46E5" />
                ) : (
                  <circle cx={cx} cy={cy} r={24} fill="none" stroke="#4F46E5" strokeWidth={3} />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Q30: 正方形の数パターン 1→4→9→?(16)
  if (id === 30) {
    const DOT_GRID: [number, number][][] = [
      [[0, 0]],
      [[-12, -12], [12, -12], [-12, 12], [12, 12]],
      [[-16, -16], [0, -16], [16, -16], [-16, 0], [0, 0], [16, 0], [-16, 16], [0, 16], [16, 16]],
    ];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 360 90" className="w-full max-w-xs mx-auto block">
          {[0, 1, 2, 3].map((i) => {
            const cx = 45 + i * 90;
            const cy = 45;
            const isQ = i === 3;
            return (
              <g key={i}>
                <rect x={cx - 36} y={cy - 36} width={72} height={72} rx={8} {...cell(isQ)} />
                {isQ ? (
                  <text x={cx} y={cy + 10} textAnchor="middle" fontSize={26} fill="#9CA3AF">?</text>
                ) : (
                  DOT_GRID[i].map(([dx, dy], j) => (
                    <rect key={j} x={cx + dx - 5} y={cy + dy - 5}
                      width={10} height={10} fill="#4F46E5" rx={1} />
                  ))
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Q31: 3×3ラテン方陣 △○□/○□△/□△?
  if (id === 31) {
    const grid = [
      ['△', '○', '□'],
      ['○', '□', '△'],
      ['□', '△', '?'],
    ];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 204 204" className="w-48 mx-auto block">
          {grid.map((row, ri) =>
            row.map((sym, ci) => {
              const cx = 34 + ci * 68;
              const cy = 34 + ri * 68;
              const isQ = sym === '?';
              return (
                <g key={`${ri}-${ci}`}>
                  <rect x={cx - 28} y={cy - 28} width={56} height={56} rx={6} {...cell(isQ)} />
                  <text x={cx} y={cy + 9} textAnchor="middle" fontSize={20}
                    fill={isQ ? '#9CA3AF' : '#4F46E5'} fontFamily="sans-serif">
                    {sym}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>
    );
  }

  // Q32: 大きさ×形の交互パターン 大○小○大□小□大△?→小△
  if (id === 32) {
    type Shape = { shape: 'circle' | 'square' | 'triangle'; big: boolean } | null;
    const shapes: Shape[] = [
      { shape: 'circle', big: true },
      { shape: 'circle', big: false },
      { shape: 'square', big: true },
      { shape: 'square', big: false },
      { shape: 'triangle', big: true },
      null,
    ];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 396 80" className="w-full max-w-sm mx-auto block">
          {shapes.map((s, i) => {
            const cx = 33 + i * 66;
            const cy = 40;
            const isQ = s === null;
            const r = s?.big ? 20 : 11;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={28} {...cell(isQ)} />
                {isQ ? (
                  <text x={cx} y={cy + 9} textAnchor="middle" fontSize={22} fill="#9CA3AF">?</text>
                ) : s?.shape === 'circle' ? (
                  <circle cx={cx} cy={cy} r={r} fill="#4F46E5" />
                ) : s?.shape === 'square' ? (
                  <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="#4F46E5" rx={2} />
                ) : (
                  <polygon
                    points={`${cx},${cy - r} ${cx - r * 0.9},${cy + r * 0.6} ${cx + r * 0.9},${cy + r * 0.6}`}
                    fill="#4F46E5"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Q33: 形×個数の2ルール同時推論（Raven's 最難問タイプ）
  // 行=形の種類(○□△)、列=個数(1,2,3)、位置(2,2)=△×3
  if (id === 33) {
    const SHAPES = ['circle', 'square', 'triangle'] as const;
    const OFFSETS: [number, number][][] = [
      [[0, 2]],
      [[-11, 2], [11, 2]],
      [[-13, -5], [13, -5], [0, 10]],
    ];
    const R = 8;
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 184 184" className="w-52 mx-auto block">
          {SHAPES.map((shapeType, ri) =>
            [1, 2, 3].map((count, ci) => {
              const cx = 32 + ci * 60;
              const cy = 32 + ri * 60;
              const isQ = ri === 2 && ci === 2;
              return (
                <g key={`${ri}-${ci}`}>
                  <rect x={cx - 27} y={cy - 27} width={54} height={54} rx={6} {...cell(isQ)} />
                  {isQ ? (
                    <text x={cx} y={cy + 9} textAnchor="middle" fontSize={22} fill="#9CA3AF">?</text>
                  ) : (
                    OFFSETS[count - 1].map(([dx, dy], j) => {
                      const sx = cx + dx, sy = cy + dy;
                      if (shapeType === 'circle')
                        return <circle key={j} cx={sx} cy={sy} r={R} fill="#4F46E5" />;
                      if (shapeType === 'square')
                        return <rect key={j} x={sx - R} y={sy - R} width={R * 2} height={R * 2} fill="#4F46E5" rx={1} />;
                      return <polygon key={j} points={`${sx},${sy - R} ${sx - R * 0.9},${sy + R * 0.6} ${sx + R * 0.9},${sy + R * 0.6}`} fill="#4F46E5" />;
                    })
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    );
  }

  // Q38: 数字マトリクス（各行が×2のパターン）
  // Row0: 2,4,8 | Row1: 3,6,12 | Row2: 4,8,? → 16
  if (id === 38) {
    const grid = [[2, 4, 8], [3, 6, 12], [4, 8, -1]];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 184 184" className="w-52 mx-auto block">
          {grid.map((row, ri) =>
            row.map((val, ci) => {
              const cx = 32 + ci * 60;
              const cy = 32 + ri * 60;
              const isQ = val === -1;
              return (
                <g key={`${ri}-${ci}`}>
                  <rect x={cx - 27} y={cy - 27} width={54} height={54} rx={6} {...cell(isQ)} />
                  <text x={cx} y={cy + 8} textAnchor="middle"
                    fontSize={isQ ? 22 : 19} fontWeight="bold"
                    fill={isQ ? '#9CA3AF' : '#4F46E5'} fontFamily="sans-serif">
                    {isQ ? '?' : val}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>
    );
  }

  // Q39: 数字マトリクス（行・列の両方にルール）
  // Row0: 1,3,6 | Row1: 2,5,9 | Row2: 3,7,? → 12
  // 列ごとに +1, +2, +3 ずつ増加
  if (id === 39) {
    const grid = [[1, 3, 6], [2, 5, 9], [3, 7, -1]];
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <svg viewBox="0 0 184 184" className="w-52 mx-auto block">
          {grid.map((row, ri) =>
            row.map((val, ci) => {
              const cx = 32 + ci * 60;
              const cy = 32 + ri * 60;
              const isQ = val === -1;
              return (
                <g key={`${ri}-${ci}`}>
                  <rect x={cx - 27} y={cy - 27} width={54} height={54} rx={6} {...cell(isQ)} />
                  <text x={cx} y={cy + 8} textAnchor="middle"
                    fontSize={isQ ? 22 : 19} fontWeight="bold"
                    fill={isQ ? '#9CA3AF' : '#4F46E5'} fontFamily="sans-serif">
                    {isQ ? '?' : val}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>
    );
  }

  return null;
}

// ===== テストページ本体 =====
export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(39).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      router.push('/');
      return;
    }
    setUserInfo(JSON.parse(stored));
  }, [router]);

  const q = questions[currentIndex];
  const isAdhd = q.category === 'adhd_a' || q.category === 'adhd_b';
  const options = isAdhd ? ADHD_OPTIONS : q.options;
  const progress = (currentIndex / questions.length) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selected;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(newAnswers[currentIndex + 1] ?? null);
    } else {
      const storedUserInfo: UserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const result = calculateResults(storedUserInfo, newAnswers as number[]);
      localStorage.setItem('testResult', JSON.stringify(result));

      // Google Sheets にデータ送信（バックグラウンド・エラーは無視）
      const webhookUrl = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
      if (webhookUrl) {
        const payload = {
          timestamp: new Date().toISOString(),
          name: result.userInfo.name,
          age: result.userInfo.age,
          gender: result.userInfo.gender === 'male' ? '男性' : result.userInfo.gender === 'female' ? '女性' : 'その他',
          iqScore: result.iqScore,
          iqRaw: result.iqRaw,
          iqPercentile: result.iqPercentile,
          adhdLevel: result.adhdLevel,
          adhdType: result.adhdType,
          adhdPositiveCount: result.adhdPositiveCount,
          ageGroup: result.userInfo.ageGroup,
        };
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        }).catch(() => {}); // エラーは無視
      }

      router.push('/gate');
    }
  };

  const handleBack = () => {
    if (currentIndex <= 0) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selected;
    setAnswers(newAnswers);
    setCurrentIndex(currentIndex - 1);
    setSelected(newAnswers[currentIndex - 1] ?? null);
  };

  if (!userInfo) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="font-medium">{currentIndex + 1} / {questions.length}</span>
            <span>{CATEGORY_LABELS[q.category]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 質問カード */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full mb-4">
            Q{currentIndex + 1}
          </div>

          <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed whitespace-pre-line">
            {q.text}
          </p>

          {/* SVG図形パターン（figureIdがある問題のみ） */}
          {q.figureId && <FigurePattern id={q.figureId} />}

          {/* ADHD: 頻度スケール */}
          {isAdhd ? (
            <div className="flex gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`flex-1 py-3 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center ${
                    selected === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            /* IQ・図形: 4択 */
            <div className="space-y-3">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    selected === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected === i ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                    }`}>
                      {selected === i && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← 戻る
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selected === null}
            className={`flex-1 py-4 font-bold text-lg rounded-xl transition-all ${
              selected !== null
                ? currentIndex === questions.length - 1
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentIndex === questions.length - 1 ? '結果を見る →' : '次へ →'}
          </button>
        </div>
      </div>
    </main>
  );
}
