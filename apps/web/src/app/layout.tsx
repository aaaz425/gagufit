import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "gagufit",
  description: "이 가구, 우리 방에 들어갈까? 3D로 미리 배치해 보세요",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="font-sans">{children}</body>
    </html>
  );
}
