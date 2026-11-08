import type { Metadata } from "next";
import { CONTACT_EMAIL, OPERATOR_NAME } from "@/site/constants";
import { LegalPage, type LegalSection } from "@/site/LegalPage";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "gagufit이 처리하는 정보와 보관·삭제 방법",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. 수집하는 정보",
    paragraphs: [
      "gagufit은 이름, 이메일, 전화번호 같은 개인정보를 받지 않아요. 서비스를 쓰는 동안 아래 정보만 처리해요.",
    ],
    items: [
      "익명 이용자 번호 - 서비스를 처음 열면 자동으로 만들어지는 임시 계정의 무작위 번호예요",
      "저장한 방 데이터 - 방 이름, 방 구조(치수·문·창문), 가구 배치",
    ],
  },
  {
    title: "2. 이용 목적",
    paragraphs: [
      "내 방을 저장하고 다시 불러오는 데만 써요. 다른 목적으로 쓰거나 이용자를 식별해 분석하지 않아요.",
    ],
  },
  {
    title: "3. 보관 장소와 기간",
    items: [
      "서버 - 익명 이용자 번호와 저장한 방 데이터는 Supabase에 보관해요. 이용자가 방을 지우기 전까지 보관해요",
      "브라우저 - 로그인 상태 정보, 서버 저장에 실패한 방의 임시 보관본, 화면 품질 설정을 이용 중인 브라우저에 저장해요. 브라우저 데이터를 지우면 함께 없어져요",
    ],
  },
  {
    title: "4. 삭제 방법",
    items: [
      "방 삭제 - 내 방 목록에서 방을 지우면 서버에 저장된 그 방 데이터가 삭제돼요",
      "브라우저 데이터 삭제 - 브라우저 설정에서 사이트 데이터를 지우면 브라우저에 저장된 정보가 없어져요",
      `익명 이용자 번호까지 지우고 싶으면 ${CONTACT_EMAIL}로 요청해 주세요`,
    ],
  },
  {
    title: "5. 쿠키와 분석 도구",
    paragraphs: ["방문 분석 도구와 광고 쿠키를 쓰지 않아요."],
  },
  {
    title: "6. 제3자 제공과 처리 위탁",
    paragraphs: [
      "이용자의 정보를 제3자에게 제공하지 않아요.",
      "저장과 익명 로그인 처리를 위해 Supabase에 정보 처리를 맡겨요.",
    ],
  },
  {
    title: "7. 쿠팡 링크 이동",
    paragraphs: [
      "서비스 안의 쿠팡 링크를 누르면 쿠팡 사이트로 이동해요. 이동한 뒤의 정보 처리는 쿠팡의 정책을 따라요.",
    ],
  },
  {
    title: "8. 문의처",
    paragraphs: [
      `운영자 ${OPERATOR_NAME}, 이메일 ${CONTACT_EMAIL}로 문의해 주세요.`,
    ],
  },
  {
    title: "9. 변경 안내",
    paragraphs: ["이 방침을 바꾸면 이 페이지에 시행일과 함께 알려요."],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="개인정보처리방침" sections={SECTIONS} />;
}
