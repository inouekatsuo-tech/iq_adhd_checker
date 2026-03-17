import { TestResult } from './types';

// 角丸矩形ヘルパー
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const ADHD_COLORS: Record<string, string> = {
  none:     '#10b981',
  mild:     '#d97706',
  moderate: '#f97316',
  high:     '#ef4444',
};

const AGE_LABELS: Record<string, string> = {
  teens: '10代', twenties: '20代', thirties: '30代',
  forties: '40代', fifties: '50代', sixties_plus: '60代以上',
};

export async function generateResultImage(result: TestResult, appUrl: string): Promise<string> {
  await document.fonts.load('bold 80px "Hiragino Sans", "Noto Sans JP", sans-serif');

  // ── 縦長カード（スマホ向け） ──
  const W = 630, H = 960;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── 背景グラデーション ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,    '#3730a3');
  bg.addColorStop(0.5,  '#6d28d9');
  bg.addColorStop(1,    '#4c1d95');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── 装飾サークル ──
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(W - 60, 60, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(80, H - 80, 160, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const PAD = 48;

  // ── アプリブランド（左上） ──
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '26px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ADHD × IQ 診断', PAD, 58);

  // ── ユーザー名（右上） ──
  const ageLabel = AGE_LABELS[result.userInfo.ageGroup] || '';
  const genderLabel = result.userInfo.gender === 'male' ? '男性' : result.userInfo.gender === 'female' ? '女性' : 'その他';
  const nameLabel = `${result.userInfo.name}さん（${ageLabel}・${genderLabel}）`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '24px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(nameLabel, W - PAD, 58);
  ctx.textAlign = 'left';

  // ── 区切り線 ──
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(PAD, 76, W - PAD * 2, 1);

  // ── IQラベル ──
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '30px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('推定 IQ スコア', PAD, 130);

  // ── IQスコア（大） ──
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 200px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText(result.iqScore.toString(), PAD - 8, 340);

  // ── パーセンタイルバッジ ──
  const badgeW = 280, badgeH = 52, badgeX = PAD, badgeY = 360;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 26);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(result.iqPercentileText, badgeX + badgeW / 2, badgeY + 35);
  ctx.textAlign = 'left';

  // ── IQ ゲージバー ──
  const gaugeY = 440, gaugeH = 18;
  const gaugeW = W - PAD * 2;
  const iqPct = Math.min(1, Math.max(0, (result.iqScore - 70) / 60));

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, PAD, gaugeY, gaugeW, gaugeH, gaugeH / 2);
  ctx.fill();

  if (iqPct > 0) {
    const grad = ctx.createLinearGradient(PAD, 0, PAD + gaugeW, 0);
    grad.addColorStop(0, '#a5b4fc');
    grad.addColorStop(1, '#f0abfc');
    ctx.fillStyle = grad;
    roundRect(ctx, PAD, gaugeY, Math.max(gaugeH, gaugeW * iqPct), gaugeH, gaugeH / 2);
    ctx.fill();
  }

  // ゲージラベル
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '20px "Hiragino Sans", "Noto Sans JP", sans-serif';
  const gaugeLabelY = gaugeY + gaugeH + 26;
  [['70', '低い', 0], ['85', '平均以下', 0.25], ['100', '平均', 0.5], ['115', '', 0.75], ['130+', '高い', 1]].forEach(([num, lbl, pos]) => {
    const lx = PAD + gaugeW * Number(pos);
    ctx.textAlign = pos === 0 ? 'left' : pos === 1 ? 'right' : 'center';
    ctx.fillText(lbl ? `${num}\n${lbl}` : num, lx, gaugeLabelY);
  });
  ctx.textAlign = 'left';

  // ── ADHDカード ──
  const cardX = PAD, cardY = 530, cardW = W - PAD * 2, cardH = 180, cardR = 20;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();

  // ADHDラベル
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '24px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('ADHD 傾向チェック', cardX + 24, cardY + 44);

  // 該当数（右上）
  ctx.fillStyle = ADHD_COLORS[result.adhdLevel] || '#10b981';
  ctx.font = 'bold 28px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${result.adhdPositiveCount}/12`, cardX + cardW - 24, cardY + 44);
  ctx.textAlign = 'left';

  // ADHD 結果テキスト
  ctx.fillStyle = ADHD_COLORS[result.adhdLevel] || '#10b981';
  ctx.font = 'bold 52px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText(result.adhdType, cardX + 24, cardY + 116);

  // ADHD 説明（小さく）
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '20px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('※このチェックは参考値です', cardX + 24, cardY + 158);

  // ── ハッシュタグ・URL（下部） ──
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '22px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('#ADHD診断  #IQテスト', PAD, H - 32);
  ctx.textAlign = 'right';
  ctx.fillText(appUrl.replace('https://', ''), W - PAD, H - 32);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
