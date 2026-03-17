import { AdhdLevel, AgeGroup, Gender, TestResult, UserInfo } from './types';
import { questions } from './questions';

export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getAgeGroup(age: number): AgeGroup {
  if (age < 20) return '10s';
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  if (age < 60) return '50s';
  return '60plus';
}

function scoreAdhd(
  answers: number[],
  gender: Gender
): {
  score: number;
  positiveCount: number;
  level: AdhdLevel;
  type: string;
  comment: string;
} {
  const partA = answers.slice(0, 6); // Q1-6
  const partB = answers.slice(6, 12); // Q7-12

  // ASRS-v1.1 カットオフ基準
  // Part A Q1-3: score >= 2 (ときどきある以上) = ポジティブ
  // Part A Q4-6: score >= 3 (よくある以上) = ポジティブ
  // Part B Q7-12: score >= 2 = ポジティブ
  let positiveCount = 0;
  for (let i = 0; i < 3; i++) if (partA[i] >= 2) positiveCount++;
  for (let i = 3; i < 6; i++) if (partA[i] >= 3) positiveCount++;
  for (let i = 0; i < 6; i++) if (partB[i] >= 2) positiveCount++;

  const totalScore = [...partA, ...partB].reduce((s, v) => s + v, 0);
  const inattentiveScore = partA.reduce((s, v) => s + v, 0);
  const hyperactiveScore = partB.reduce((s, v) => s + v, 0);

  let level: AdhdLevel;
  if (positiveCount <= 3) level = 'none';
  else if (positiveCount <= 5) level = 'mild';
  else if (positiveCount <= 8) level = 'moderate';
  else level = 'high';

  const levelLabel = { none: '非該当', mild: '軽症傾向', moderate: '中程度傾向', high: '高傾向' }[level];
  const dominantType = inattentiveScore >= hyperactiveScore ? '不注意優勢型' : '多動・衝動優勢型';

  let comment: string;
  if (level === 'none') {
    comment = '現時点では顕著なADHD傾向は検出されませんでした。このチェックはあくまで参考値です。';
  } else if (gender === 'female') {
    comment = `${levelLabel}（${dominantType}）が検出されました。女性のADHDは不注意型として現れることが多く、多動は目立ちにくい傾向があります。このチェックは参考値です。正確な診断は専門医にご相談ください。`;
  } else if (gender === 'male') {
    comment = `${levelLabel}（${dominantType}）が検出されました。男性のADHDは多動・衝動性として現れることが多い傾向があります。このチェックは参考値です。正確な診断は専門医にご相談ください。`;
  } else {
    comment = `${levelLabel}（${dominantType}）が検出されました。このチェックは参考値です。正確な診断は専門医にご相談ください。`;
  }

  return { score: totalScore, positiveCount, level, type: levelLabel, comment };
}

function iqToPercentile(iq: number): number {
  const z = (iq - 100) / 15;
  // 上位%を計算（高いIQ = 上位少数%）
  const pct = Math.round((1 - normalCDF(z)) * 100);
  return Math.max(1, Math.min(99, pct));
}

function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function scoreIQ(
  answers: number[],
  ageGroup: AgeGroup
): {
  raw: number;
  iq: number;
  percentile: number;
  percentileText: string;
} {
  const iqAnswers = answers.slice(12); // Q13-39 (27問)
  let correct = 0;
  for (let i = 0; i < iqAnswers.length; i++) {
    const q = questions[12 + i];
    if (q && q.correctIndex !== undefined && iqAnswers[i] === q.correctIndex) correct++;
  }

  // 正答数 → ベースIQ テーブル（27問版）
  // 13-14正解 ≈ IQ100（平均）、7正解 ≈ IQ83（4択ランダム正解率相当）
  const iqTable: Record<number, number> = {
    0: 63,  1: 66,  2: 69,  3: 72,  4: 75,  5: 78,
    6: 81,  7: 83,  8: 85,  9: 87,  10: 89, 11: 92,
    12: 95, 13: 98, 14: 101, 15: 103, 16: 105, 17: 107,
    18: 109, 19: 111, 20: 114, 21: 117, 22: 120, 23: 123,
    24: 126, 25: 130, 26: 134, 27: 138,
  };

  // 年齢補正（流動性知能は20代がピーク → 年上ほど加点）
  const ageAdj: Record<AgeGroup, number> = {
    '10s': -2,
    '20s': 0,
    '30s': 3,
    '40s': 6,
    '50s': 10,
    '60plus': 14,
  };

  const baseIQ = iqTable[correct] ?? 68;
  const finalIQ = Math.min(145, Math.max(60, baseIQ + ageAdj[ageGroup]));
  const percentile = iqToPercentile(finalIQ);

  const ageLabel: Record<AgeGroup, string> = {
    '10s': '10代', '20s': '20代', '30s': '30代',
    '40s': '40代', '50s': '50代', '60plus': '60代以上',
  };

  return {
    raw: correct,
    iq: Math.round(finalIQ),
    percentile,
    percentileText: `${ageLabel[ageGroup]}の同年代で上位 ${percentile}%`,
  };
}

export function calculateResults(userInfo: UserInfo, answers: number[]): TestResult {
  const adhd = scoreAdhd(answers, userInfo.gender);
  const iq = scoreIQ(answers, userInfo.ageGroup);

  return {
    userInfo,
    adhdScore: adhd.score,
    adhdPositiveCount: adhd.positiveCount,
    adhdLevel: adhd.level,
    adhdType: adhd.type,
    adhdComment: adhd.comment,
    iqRaw: iq.raw,
    iqScore: iq.iq,
    iqPercentile: iq.percentile,
    iqPercentileText: iq.percentileText,
  };
}
