import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ADHD × IQ 診断テスト | 約10分・33問",
  description:
    "WHO公認ASRS-v1.1準拠のADHDチェックと年齢補正ありのIQ推定テスト。約10分・33問で、あなたのADHD傾向とIQスコアを診断します。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  );
}
