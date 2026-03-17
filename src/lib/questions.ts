import { Question } from './types';

export const ADHD_OPTIONS = [
  'まったくない',
  'めったにない',
  'ときどきある',
  'よくある',
  '非常によくある',
];

export const questions: Question[] = [
  // ===== ADHD Part A - 不注意 (6問) ASRS-v1.1 準拠 =====
  {
    id: 1,
    category: 'adhd_a',
    text: '仕事の中で難しい部分が終わり、あとは仕上げるだけという段階になったとき、その作業を完了させることが難しくなることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 2,
    category: 'adhd_a',
    text: '手順を必要とする作業を計画し、順序立てて行うことが難しいことがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 3,
    category: 'adhd_a',
    text: '約束や、しなければならない用事を忘れることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 4,
    category: 'adhd_a',
    text: 'じっくりと考える必要のある課題に取り掛かることを、後回しにしたり避けたりすることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 5,
    category: 'adhd_a',
    text: '長時間じっとしていなければならないとき、手足をそわそわ動かしたり、もぞもぞしたりすることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 6,
    category: 'adhd_a',
    text: 'まるで何かに駆り立てられるように、過度に活動的になったり、何かをしないではいられなくなることがありますか？',
    options: ADHD_OPTIONS,
  },

  // ===== ADHD Part B - 多動・衝動 (6問) ASRS-v1.1 準拠 =====
  {
    id: 7,
    category: 'adhd_b',
    text: 'つまらない、あるいは難しい作業をしているとき、うっかりミスをすることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 8,
    category: 'adhd_b',
    text: '単調な作業や退屈な作業をするとき、集中力を保ち続けることが難しいことがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 9,
    category: 'adhd_b',
    text: '直接話しかけられているのに、話を聞いていないように見られることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 10,
    category: 'adhd_b',
    text: '家や職場に物を置き忘れたり、物をどこに置いたか分からなくなることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 11,
    category: 'adhd_b',
    text: '外からの物音や出来事に気を取られて、作業に集中できなくなることがありますか？',
    options: ADHD_OPTIONS,
  },
  {
    id: 12,
    category: 'adhd_b',
    text: '会議や授業など、着席していなければならない状況で、席を立ってしまうことがありますか？',
    options: ADHD_OPTIONS,
  },

  // ===== 認知推論 - 言語アナロジー (8問) Raven's 準拠タイプ =====
  {
    id: 13,
    category: 'figure',
    text: '「読む」は「本」に対して、「見る」は何に対するものですか？',
    options: ['映画', '音楽', '食事', '運動'],
    correctIndex: 0,
  },
  {
    id: 14,
    category: 'figure',
    text: '「医者」は「病院」にいるように、「教師」はどこにいますか？',
    options: ['図書館', '学校', '公園', '役所'],
    correctIndex: 1,
  },
  {
    id: 15,
    category: 'figure',
    text: '「魚」は「水の中」にいるように、「鳥」はどこにいますか？',
    options: ['地面', '木の上', '空', '水の中'],
    correctIndex: 2,
  },
  {
    id: 16,
    category: 'figure',
    text: '1から100までの整数をすべて足した合計は何ですか？',
    options: ['4,950', '5,000', '5,050', '5,100'],
    correctIndex: 2,
  },
  {
    id: 17,
    category: 'figure',
    text: '次の4つの数のうち、素数でないものはどれですか？',
    options: ['37', '51', '73', '97'],
    correctIndex: 1,
  },
  {
    id: 18,
    category: 'figure',
    text: '「包丁」は「料理人」の道具です。「ペン」は誰の道具ですか？',
    options: ['音楽家', '画家', '作家', '医者'],
    correctIndex: 2,
  },
  {
    id: 19,
    category: 'figure',
    text: '次のうち、仲間はずれはどれですか？\nリンゴ・バナナ・ニンジン・ブドウ',
    options: ['リンゴ', 'バナナ', 'ニンジン', 'ブドウ'],
    correctIndex: 2,
  },
  {
    id: 20,
    category: 'figure',
    text: '次のアルファベット列の規則を見つけて「?」に入るものを選んでください。\n\nA, C, F, J, O, ?',
    options: ['T', 'U', 'V', 'W'],
    correctIndex: 1,
  },

  // ===== 数列推論 (7問) WAIS-IV 準拠タイプ =====
  {
    id: 21,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n2, 4, 8, 16, ?',
    options: ['20', '24', '32', '64'],
    correctIndex: 2,
  },
  {
    id: 22,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n1, 4, 9, 16, ?',
    options: ['20', '25', '36', '30'],
    correctIndex: 1,
  },
  {
    id: 23,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n1, 2, 3, 5, 8, 13, ?',
    options: ['18', '20', '21', '24'],
    correctIndex: 2,
  },
  {
    id: 24,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n81, 27, 9, ?',
    options: ['1', '2', '3', '6'],
    correctIndex: 2,
  },
  {
    id: 25,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n3, 6, 4, 8, 6, ?',
    options: ['10', '8', '12', '9'],
    correctIndex: 2,
  },
  {
    id: 26,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n2, 5, 10, 17, 26, ?',
    options: ['35', '36', '37', '38'],
    correctIndex: 2,
  },
  {
    id: 27,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n1, 3, 7, 15, 31, ?',
    options: ['47', '55', '63', '61'],
    correctIndex: 2,
  },

  // ===== 図形推論（視覚パターン）(6問) Raven's Progressive Matrices タイプ =====
  {
    id: 28,
    category: 'figure',
    text: '矢印のパターンを見て、「?」に入るものを選んでください。',
    options: ['↓', '←', '↑', '→'],
    correctIndex: 0,
    figureId: 28,
  },
  {
    id: 29,
    category: 'figure',
    text: '縦・横・斜めの合計がすべて等しい3×3の魔方陣です。「?」に入る数字はどれですか？\n\n[ 2 | 9 | 4 ]\n[ 7 | 5 | 3 ]\n[ 6 | ? | 8 ]',
    options: ['1', '2', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 30,
    category: 'figure',
    text: '数字のパターンを見つけて「?」に入る数字を選んでください。\n\n16　9　4\n 9　4　1\n 4　1　?',
    options: ['0', '1', '2', '4'],
    correctIndex: 0,
  },
  {
    id: 31,
    category: 'figure',
    text: '3×3のマスを見てください。各行・各列に△・○・□が1つずつ入ります。「?」に入る図形はどれですか？',
    options: ['△', '○', '□', '●'],
    correctIndex: 1,
    figureId: 31,
  },
  {
    id: 32,
    category: 'figure',
    text: '次の等式の規則を見つけて「?」を求めてください。\n\n1² + 2² = 5\n2² + 3² = 13\n3² + 4² = 25\n4² + 5² = ?',
    options: ['38', '39', '40', '41'],
    correctIndex: 3,
  },
  {
    id: 33,
    category: 'figure',
    text: '時計が3時15分を指しています。このとき、長針と短針がなす角度（小さい方）は何度ですか？',
    options: ['7.5°', '15°', '22.5°', '30°'],
    correctIndex: 0,
  },

  // ===== 難問セクション（Q34-39）難易度：高 =====
  {
    id: 34,
    category: 'figure',
    text: '「楽観的」の反対は「悲観的」。では「勇気」の反対は何ですか？',
    options: ['正直', '臆病', '親切', '冷静'],
    correctIndex: 1,
  },
  {
    id: 35,
    category: 'figure',
    text: '「文字」は「単語」を構成します。では「単語」は何を構成しますか？',
    options: ['文章', '本', '段落', '章'],
    correctIndex: 0,
  },
  {
    id: 36,
    category: 'sequence',
    text: '「?」に入る数字はどれですか？\n\n2, 6, 24, 120, ?',
    options: ['600', '720', '840', '960'],
    correctIndex: 1,
  },
  {
    id: 37,
    category: 'sequence',
    text: '次の規則を見つけて「?」に入るアルファベットを選んでください。\n\nA(1番目) → B(2番目) → D(4番目) → G(7番目) → K(11番目) → ?(□番目)',
    options: ['N', 'O', 'P', 'Q'],
    correctIndex: 2,
  },
  {
    id: 38,
    category: 'figure',
    text: '12人が参加するトーナメント（負けたら失格の1対1形式）があります。優勝者が決まるまでに合計何試合行われますか？',
    options: ['10試合', '11試合', '12試合', '13試合'],
    correctIndex: 1,
  },
  {
    id: 39,
    category: 'figure',
    text: '3×3の数字マトリクスを見てください。\n行と列の両方の規則を見つけて「?」に入る数字を選んでください。',
    options: ['10', '11', '12', '13'],
    correctIndex: 2,
    figureId: 39,
  },
];
