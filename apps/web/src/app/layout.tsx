import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME } from "@/site/constants";
import { Providers } from "./Providers";

// 배포 주소는 환경변수로, 호스팅 전용 변수에 기대지 않음
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gagufit.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s - ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
