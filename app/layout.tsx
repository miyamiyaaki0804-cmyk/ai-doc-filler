import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI ドキュメント自動補完ツール",
  description: "ExcelやWordの下書きテンプレートにAIが自動でデータを入力・補完します",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geist.className} min-h-screen`}>{children}</body>
    </html>
  );
}
