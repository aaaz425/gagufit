import { sendGAEvent } from "@next/third-parties/google";

export function trackCoupangClick(product: {
  id: string;
  name: string;
  /** 판매처 참고가, 원 정수 */
  referencePrice: number;
}) {
  // GA ID가 없으면(로컬·미리보기) 초기화가 안 돼 경고가 나므로 건너뜀
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent("event", "coupang_click", {
    product_id: product.id,
    product_name: product.name,
    reference_price: product.referencePrice,
  });
}
