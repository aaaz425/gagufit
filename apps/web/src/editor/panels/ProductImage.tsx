"use client";

import type { FurniturePreset } from "@gagufit/core";
import { useState } from "react";
import { FurnitureThumb } from "../plan/FurnitureSymbol";

/** 상품 사진 - 없거나 불러오지 못하면 평면 기호, 외부 주소라 next/image 없이 일반 img */
export function ProductImage({
  preset,
  px,
  square = false,
}: {
  preset: FurniturePreset;
  px: number;
  /** 카드 안에서 모서리는 카드가 자름 */
  square?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = preset.imageUrl;
  if (url && failedUrl !== url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(url)}
        style={{ width: px, height: px }}
        className={`shrink-0 bg-canvas object-cover ${
          square ? "" : "rounded-md border border-border"
        }`}
      />
    );
  }
  return (
    <span className={square ? "flex shrink-0 [&>span]:rounded-none" : "flex"}>
      <FurnitureThumb category={preset.category} size={preset.size} px={px} />
    </span>
  );
}
