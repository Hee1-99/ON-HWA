import type { Metadata } from "next";
import { Inter, Outfit, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-myeongjo",
});

export const metadata: Metadata = {
  title: "ON:HWA — 꽃의 서사를 켜다",
  description: "AI 기반 감성 네이밍 및 디지털 포토카드 아카이빙 플랫폼",
};

import KakaoScript from "@/components/KakaoScript";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${outfit.variable} ${nanumMyeongjo.variable} antialiased font-sans`}>
        {children}
        <KakaoScript />
      </body>
    </html>
  );
}
