import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "三模设备响应速度测试工具 | 鼠标键盘延迟测试",
  description: "专业的三模鼠标和键盘响应速度测试工具，实时监测输入延迟，支持有线、2.4G无线、蓝牙三种连接模式的性能对比分析",
  keywords: "三模鼠标,三模键盘,响应速度测试,输入延迟,鼠标测试,键盘测试,游戏外设,延迟测试工具",
  authors: [{ name: "Input Response Tester" }],
  robots: "index, follow",
  openGraph: {
    title: "三模设备响应速度测试工具",
    description: "专业测试三模鼠标和键盘的响应速度，优化游戏体验",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
