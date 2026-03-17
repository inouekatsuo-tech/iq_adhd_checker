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

export async function generateResultImage(result: TestResult, appUrl: string): Promise<string> {
  // 日本語フォントをロード
  await document.fonts.load('bold 80px "Hiragino Sans", "Noto Sans JP", sans-serif');

  const W = 1200, H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── 背景グラデーション ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#3730a3');   // indigo-800
  bg.addColorStop(0.45, '#6d28d9'); // violet-800
  bg.addColorStop(1, '#4c1d95');   // violet-900
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── 右側 装飾サークル ──
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(W - 80, 80, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 30, 200, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── アプリブランド（左上） ──
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '30px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('ADHD × IQ 診断', 72, 72);

  // ── ユーザー名（右上） ──
  const genderLabel = result.userInfo.gender === 'male' ? '男性' : result.userInfo.gender === 'female' ? '女性' : 'その他';
  const nameLabel = `${result.userInfo.name}さん（${result.userInfo.age}歳・${genderLabel}）`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '28px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(nameLabel, W - 72, 72);
  ctx.textAlign = 'left';

  // ── IQラベル ──
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '36px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('推定 IQ スコア', 72, 155);

  // ── IQスコア（超大） ──
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 210px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText(result.iqScore.toString(), 65, 390);

  // ── パーセンタイルバッジ ──
  const iqTextW = ctx.measureText(result.iqScore.toString()).width;
  const badgeX = 72 + iqTextW + 28;
  const badgeY = 270;
  const badgeW = 320;
  const badgeH = 60;
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 30);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(result.iqPercentileText, badgeX + badgeW / 2, badgeY + 40);
  ctx.textAlign = 'left';

  // ── ADHDカード ──
  const cardX = 72, cardY = 430, cardW = 520, cardH = 138, cardR = 22;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();

  // ADHDラベル
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '26px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('ADHD 傾向チェック', cardX + 24, cardY + 42);

  // ADHD 結果テキスト
  ctx.fillStyle = ADHD_COLORS[result.adhdLevel] || '#10b981';
  ctx.font = 'bold 46px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText(result.adhdType, cardX + 24, cardY + 108);

  // 該当数
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '26px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${result.adhdPositiveCount}/12`, cardX + cardW - 24, cardY + 108);
  ctx.textAlign = 'left';

  // ── IQ ゲージバー ──
  const gaugeX = cardX + cardW + 48;
  const gaugeY = 430;
  const gaugeW = W - gaugeX - 72;
  const gaugeH = 22;
  const iqPct = Math.min(1, Math.max(0, (result.iqScore - 70) / 60));

  // バー背景
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, gaugeX, gaugeY, gaugeW, gaugeH, gaugeH / 2);
  ctx.fill();

  // バー値
  if (iqPct > 0) {
    const grad2 = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeW, 0);
    grad2.addColorStop(0, '#a5b4fc');
    grad2.addColorStop(1, '#f0abfc');
    ctx.fillStyle = grad2;
    roundRect(ctx, gaugeX, gaugeY, Math.max(gaugeH, gaugeW * iqPct), gaugeH, gaugeH / 2);
    ctx.fill();
  }

  // ゲージラベル
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '22px "Hiragino Sans", "Noto Sans JP", sans-serif';
  const gaugeLabelY = gaugeY + gaugeH + 28;
  const labels = [['70','低い'], ['100','平均'], ['130+','高い']];
  const positions = [0, 0.5, 1];
  labels.forEach(([num, lbl], i) => {
    const lx = gaugeX + gaugeW * positions[i];
    ctx.textAlign = i === 0 ? 'left' : i === 2 ? 'right' : 'center';
    ctx.fillText(`${num} ${lbl}`, lx, gaugeLabelY);
  });
  ctx.textAlign = 'left';

  // ── ハッシュタグ・URL（下部） ──
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '25px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.fillText('#ADHD診断  #IQテスト', 72, H - 36);
  ctx.textAlign = 'right';
  ctx.fillText(appUrl.replace('https://', ''), W - 72, H - 36);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
