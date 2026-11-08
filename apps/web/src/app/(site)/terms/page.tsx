import type { Metadata } from "next";
import { COUPANG_NOTICE, OPERATOR_NAME } from "@/site/constants";
import { LegalPage, type LegalSection } from "@/site/LegalPage";

export const metadata: Metadata = {
  title: "이용약관",
  description: "gagufit 이용약관",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. 목적",
    paragraphs: [
      `이 약관은 ${OPERATOR_NAME}(이하 "운영자")가 제공하는 gagufit(이하 "서비스")를 이용할 때 필요한 기본 사항을 정해요.`,
    ],
  },
  {
    title: "2. 서비스 내용",
    paragraphs: [
      "서비스는 원룸 같은 방에 가구를 미리 놓아 보는 배치 시뮬레이터예요.",
    ],
    items: [
      "방 치수와 가구 배치를 2D로 편집하고 3D로 둘러볼 수 있어요",
      "가구가 겹치거나 벽 밖으로 나가거나 문을 막으면 경고로 알려요",
      "별도 가입 없이 쓸 수 있고, 운영자는 서비스 내용을 바꾸거나 중단할 수 있어요",
    ],
  },
  {
    title: "3. 내 방 저장",
    paragraphs: [
      "만든 방은 로그인 없이도 자동으로 저장돼요. 저장은 이용 중인 브라우저에 연결되는 임시 계정으로 이뤄져서, 브라우저 데이터를 지우거나 다른 기기를 쓰면 내 방을 다시 불러오지 못할 수 있어요.",
      "중요한 방은 직접 확인해 두세요. 운영자는 저장 데이터의 영구 보관을 보장하지 않아요.",
    ],
  },
  {
    title: "4. 가구 규격과 참고 가격",
    paragraphs: [
      "서비스의 가구 크기는 표준 규격을 바탕으로 한 값이라 실제 제품과 다를 수 있어요. 구매 전에 판매처의 상세 치수를 꼭 확인해 주세요.",
      "참고 가격은 판매처에서 확인한 값을 기준일과 함께 보여 주는 정보예요. 실제 가격은 쿠팡에서 확인해 주세요.",
    ],
  },
  {
    title: "5. 제휴 링크 안내",
    paragraphs: [
      "서비스에는 쿠팡 파트너스 링크가 포함될 수 있어요. 링크를 통해 구매가 이뤄지면 운영자가 일정액의 수수료를 받을 수 있고, 이용자가 내는 가격은 달라지지 않아요.",
      COUPANG_NOTICE + ".",
    ],
  },
  {
    title: "6. 책임 범위",
    paragraphs: [
      "서비스의 배치 결과와 경고는 참고용이에요. 실제 가구가 방에 맞는지는 이용자가 직접 재 보고 판단해야 해요.",
      "운영자는 서비스 이용으로 생긴 구매 결정, 제휴 판매처의 상품·가격·배송에 대해 책임지지 않아요. 다만 운영자의 고의나 과실로 생긴 손해는 관련 법령에 따라 책임져요.",
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="이용약관" sections={SECTIONS} />;
}
