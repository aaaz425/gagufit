"use client";

import { FURNITURE_PRESETS } from "@gagufit/data";
import { useProducts } from "@gagufit/api";
import { CirclePlus, CloudOff, LoaderCircle, Search } from "lucide-react";
import { useState } from "react";
import { addPresetToRoom } from "../actions";
import { CATEGORY_GROUPS } from "../labels";
import { ProductImage } from "./ProductImage";
import { Segment, TOUCH_44 } from "../ui";

/** 검색창 id - 빈 방 안내가 찾아 포커스 */
export const FURNITURE_SEARCH_ID = "furniture-search";

const BASIC = Object.values(FURNITURE_PRESETS);
type Source = "basic" | "product";

/** 검색·칩은 위에 고정, 목록만 스크롤 - 부모가 높이를 정해야 함 */
export function FurniturePanel({ onAdded }: { onAdded?: () => void }) {
  const [group, setGroup] = useState(0);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<Source>("basic");
  const categories = CATEGORY_GROUPS[group].categories;
  const words = query.trim().replace(/\s+/g, "");
  // 실패하면 실제 상품 탭만 다시 시도 안내
  const { data: products = [], isPending, isError, refetch } = useProducts();
  const list = (source === "basic" ? BASIC : products).filter(
    (p) =>
      (!categories || categories.includes(p.category)) &&
      (!words || p.name.replace(/\s+/g, "").includes(words)),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Segment
        full
        label="가구 종류"
        value={source}
        onChange={setSource}
        options={[
          { value: "basic", label: "기본 가구" },
          { value: "product", label: "실제 상품" },
        ]}
      />
      <label className="flex h-11 shrink-0 items-center gap-2 rounded-sm border border-border bg-canvas px-3 focus-within:border-primary focus-within:outline focus-within:outline-1 focus-within:outline-primary">
        <Search size={16} className="shrink-0 text-ink-muted" aria-hidden />
        <input
          id={FURNITURE_SEARCH_ID}
          type="search"
          aria-label={source === "product" ? "상품 검색" : "가구 검색"}
          placeholder={source === "product" ? "상품 검색" : "가구 검색"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
        />
      </label>
      {/* 오른쪽 끝이 흐려져 더 있음을 알림 - 폭은 오른쪽 여백(px-4) */}
      <div className="-mx-4 flex shrink-0 [scrollbar-width:none] gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-16px),transparent)] px-4 md:mx-0 md:flex-wrap md:[mask-image:none] md:px-0">
        {CATEGORY_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            aria-pressed={i === group}
            onClick={() => setGroup(i)}
            className={`h-8 shrink-0 rounded-full px-3 text-sm ${TOUCH_44} ${
              i === group
                ? "bg-primary-soft font-bold text-primary"
                : "border border-border bg-surface font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      {source === "product" && (
        <p className="shrink-0 text-xs text-ink-muted">
          실제 가격은 쿠팡에서 확인
        </p>
      )}
      <ul className="-mr-4 -ml-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-4 pl-1">
        {list.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              onClick={() => {
                addPresetToRoom(preset);
                onAdded?.();
              }}
              className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-surface"
            >
              <ProductImage preset={preset} px={48} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="line-clamp-2 text-sm font-semibold break-keep text-ink">
                  {preset.name}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {preset.size.width} × {preset.size.depth} cm
                </span>
                {preset.offers && (
                  <span className="text-xs text-ink-muted tabular-nums">
                    {preset.offers[0].price.toLocaleString("ko-KR")}원
                  </span>
                )}
              </span>
              <CirclePlus
                size={22}
                className="shrink-0 text-primary"
                aria-hidden
              />
            </button>
          </li>
        ))}
        {source === "product" && isError ? (
          <li className="flex flex-col items-center gap-3 py-6 text-center">
            <CloudOff size={24} className="text-ink-muted" aria-hidden />
            <p className="text-sm text-ink-muted">상품을 불러오지 못했어요</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-11 rounded-sm border border-border bg-canvas px-5 text-sm font-semibold text-ink hover:bg-surface"
            >
              다시 시도
            </button>
          </li>
        ) : source === "product" && isPending ? (
          <li
            role="status"
            className="flex items-center justify-center gap-2 py-6 text-sm text-ink-muted"
          >
            <LoaderCircle size={16} className="animate-spin" aria-hidden />
            상품을 불러오는 중이에요
          </li>
        ) : (
          list.length === 0 && (
            <li className="py-6 text-center text-sm text-ink-muted">
              {source === "product"
                ? "찾는 상품이 없어요"
                : "찾는 가구가 없어요"}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
