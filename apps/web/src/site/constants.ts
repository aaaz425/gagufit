export const COUPANG_NOTICE =
  "이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있어요";

// 약관 공개 전 실제 값으로 교체
export const OPERATOR_NAME = "[운영자 이름]";
export const CONTACT_EMAIL = "[연락 이메일]";
export const EFFECTIVE_DATE = "[시행일]";
export const DATA_REGION = "[보관 국가]";

export const LEGAL_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export const SITE_NAME = "gagufit";
export const HEADLINE = "이 가구, 우리 방에 들어갈까?";
export const SITE_TAGLINE = "원룸 가구 배치 시뮬레이터";
export const SITE_DESCRIPTION =
  "사기 전에 실제 치수로 미리 놓아 보세요. 로그인 없이 바로 시작할 수 있어요";

// 배포 주소는 환경변수로, 호스팅 전용 변수에 기대지 않음
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gagufit.com";
