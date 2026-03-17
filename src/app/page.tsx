'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateAge, getAgeGroup } from '@/lib/scoring';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'お名前を入力してください';
    if (!birthdate) e.birthdate = '生年月日を選択してください';
    else {
      const age = calculateAge(birthdate);
      if (age < 10 || age > 100) e.birthdate = '有効な生年月日を入力してください';
    }
    if (!gender) e.gender = '性別を選択してください';
    return e;
  };

  const handleStart = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const age = calculateAge(birthdate);
    const ageGroup = getAgeGroup(age);
    const userInfo = { name: name.trim(), birthdate, gender, age, ageGroup };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('testResult');
    localStorage.removeItem('resultUnlocked');
    router.push('/test');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* ヒーロー */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ADHD × IQ 診断テスト
          </h1>
          <p className="text-gray-500 text-lg">WHO公認スケール（ASRS-v1.1）準拠</p>
        </div>

        {/* 特徴カード */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: '📋', title: '39問', sub: 'ADHD12 + IQ27' },
            { icon: '⏱️', title: '約12分', sub: '完走率重視設計' },
            { icon: '📊', title: '年齢補正', sub: '同年代と比較' },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-1">{f.icon}</div>
              <div className="font-bold text-gray-900 text-sm">{f.title}</div>
              <div className="text-xs text-gray-500">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">プロフィールを入力</h2>

          {/* 名前 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お名前（ニックネーム可）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：田中太郎"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 生年月日 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生年月日
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
          </div>

          {/* 性別 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'male', label: '男性', icon: '👨' },
                { value: 'female', label: '女性', icon: '👩' },
                { value: 'other', label: 'その他', icon: '🧑' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value as 'male' | 'female' | 'other')}
                  className={`py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                    gender === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{opt.icon}</div>
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl transition-colors shadow-md"
          >
            テストを開始する →
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            このテストは医療診断ではありません。参考値としてご利用ください。
          </p>
        </div>
      </div>
    </main>
  );
}
