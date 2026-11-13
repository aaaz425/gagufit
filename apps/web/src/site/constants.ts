export const COUPANG_NOTICE =
  "이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있어요";

// 배포 주소는 환경변수로, 호스팅 전용 변수에 기대지 않음
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gagufit.com";

export const OPERATOR_NAME = "박유진";
export const CONTACT_EMAIL = "ytokogg@gmail.com";
export const EFFECTIVE_DATE = "2026-11-09";
export const SUPABASE_REGION = "대한민국(서울 리전)";

// 익명 계정 자동 삭제 기준 - DB 정리 작업과 같은 값
export const ANON_RETENTION_DAYS = 90;

export const LEGAL_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export const SITE_NAME = "gagufit";
export const HEADLINE = "이 가구, 우리 방에 들어갈까?";
export const SITE_TAGLINE = "원룸 가구 배치 시뮬레이터";
export const SITE_DESCRIPTION =
  "평면도에 실제 치수로 놓고 3D로 미리 둘러보세요. 로그인 없이 바로 시작할 수 있어요";
