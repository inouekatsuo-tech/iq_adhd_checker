export type Gender = 'male' | 'female' | 'other';
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60plus';
export type AdhdLevel = 'none' | 'mild' | 'moderate' | 'high';
export type QuestionCategory = 'adhd_a' | 'adhd_b' | 'figure' | 'sequence' | 'memory';

export interface UserInfo {
  name: string;
  birthdate: string;
  gender: Gender;
  age: number;
  ageGroup: AgeGroup;
}

export interface Question {
  id: number;
  category: QuestionCategory;
  text: string;
  options: string[];
  correctIndex?: number;
  figureId?: number; // SVG図形パターンのID（Q28-32）
}

export interface TestResult {
  userInfo: UserInfo;
  adhdScore: number;
  adhdPositiveCount: number;
  adhdLevel: AdhdLevel;
  adhdType: string;
  adhdComment: string;
  iqRaw: number;
  iqScore: number;
  iqPercentile: number;
  iqPercentileText: string;
}
