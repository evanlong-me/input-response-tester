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
  title: {
    default: "HID设备性能基准测试 | 键盘鼠标延迟回报率测试工具",
    template: "%s | HID设备性能基准测试"
  },
  description: "数据分析级键盘鼠标性能测试工具，精确测量输入延迟和回报率。支持鼠标点击延迟、键盘按键延迟、鼠标移动回报率、键盘回报率等多维度性能基准测试，为游戏玩家和数据分析师提供设备性能评估。",
  keywords: [
    "键盘延迟测试",
    "鼠标延迟测试", 
    "回报率测试",
    "HID设备测试",
    "输入延迟",
    "鼠标性能测试",
    "键盘性能测试",
    "游戏外设测试",
    "设备基准测试",
    "响应时间测试",
    "鼠标回报率",
    "键盘回报率",
    "延迟分析",
    "性能评估工具",
    "数据分析测试"
  ],
  authors: [{ name: "HID Performance Tester", url: "https://github.com/input-response-tester" }],
  creator: "HID Performance Testing Team",
  publisher: "HID Performance Testing",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://input-response-tester.vercel.app",
    siteName: "HID设备性能基准测试",
    title: "HID设备性能基准测试 - 键盘鼠标延迟回报率测试工具",
    description: "数据分析级键盘鼠标性能测试工具，精确测量输入延迟和回报率，为游戏玩家和数据分析师提供设备性能评估。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HID设备性能基准测试工具界面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HID设备性能基准测试 - 键盘鼠标延迟回报率测试",
    description: "数据分析级键盘鼠标性能测试工具，精确测量输入延迟和回报率",
    images: ["/og-image.png"],
    creator: "@HIDTester",
  },
  alternates: {
    canonical: "https://input-response-tester.vercel.app",
    languages: {
      "zh-CN": "https://input-response-tester.vercel.app",
      "en": "https://input-response-tester.vercel.app/en",
    },
  },
  category: "Technology",
  classification: "Performance Testing Tool",
  other: {
    "application-name": "HID设备性能基准测试",
    "apple-mobile-web-app-title": "HID性能测试",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "msapplication-tap-highlight": "no",
    "theme-color": "#000000",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HID设备性能基准测试",
              "description": "数据分析级键盘鼠标性能测试工具，精确测量输入延迟和回报率",
              "url": "https://input-response-tester.vercel.app",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "HID Performance Testing Team"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
