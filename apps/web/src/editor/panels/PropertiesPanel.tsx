"use client";

import {
  centerFromTopLeft,
  FURNITURE_SIZE_LIMITS,
  furnitureTopLeft,
  minSizeOf,
  OPENING_MIN_WIDTH,
  resizeFurniture,
  setOpeningKind,
  setOpeningWidth,
  updateFurniture,
  updateOpening,
  wallFrame,
  type FurnitureCategory,
  type FurniturePreset,
  type Offer,
  type Opening,
  type PlacedFurniture,
  type Room,
  type Size,
} from "@gagufit/core";
import { useProducts } from "@gagufit/api";
import { FURNITURE_COLORS, FURNITURE_PRESETS, presetOf } from "@gagufit/data";
import {
  ExternalLink,
  LoaderCircle,
  RotateCw,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { trackCoupangClick } from "@/site/analytics";
import { COUPANG_NOTICE } from "@/site/constants";
import {
  deleteSelected,
  displayAngle,
  duplicateSelected,
  rotateSelected90,
  rotationFromDisplay,
} from "../actions";
import {
  CATEGORY_LABELS,
  OPENING_LABELS,
  placedName,
  SIZE_CHOICES,
  wallLabel,
  WARNING_TONE,
  type WarningTone,
  warningText,
} from "../labels";
import { FurnitureThumb } from "../plan/FurnitureSymbol";
import { useEditor, useRoom, warningsOf, type Selection } from "../store";
import { NumberField, SectionTitle, Segment, TOUCH_44 } from "../ui";
import { OpeningIcon } from "./RoomPanel";

/** 선택한 가구·문·창문 속성 - header는 모바일 시트 접기 버튼 자리 */
export function PropertiesPanel({
  selection,
  headerAction,
  showActions,
}: {
  selection: NonNullable<Selection>;
  headerAction?: ReactNode;
  showActions?: boolean;
}) {
  const room = useRoom();
  if (selection.kind === "furniture") {
    const f = room.furniture.find((item) => item.id === selection.id);
    return f ? (
      <FurnitureProps
        room={room}
        furniture={f}
        headerAction={headerAction}
        showActions={showActions}
      />
    ) : null;
  }
  const o = room.openings.find((item) => item.id === selection.id);
  return o ? (
    <OpeningProps
      room={room}
      opening={o}
      headerAction={headerAction}
      showActions={showActions}
    />
  ) : null;
}

function Header({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-base font-bold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** 상품 정보는 방과 따로 불러옴 - 줄이 없으면(판매 종료) 링크만 안 보임 */
function ProductOffers({ productId }: { productId: string }) {
  const { data, isPending, isError } = useProducts();
  if (isPending) {
    return (
      <div className="flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface text-xs text-ink-muted">
        <LoaderCircle size={16} className="animate-spin" aria-hidden />
        <span role="status">가격과 링크를 불러오는 중이에요</span>
      </div>
    );
  }
  if (isError) {
    return (
      <p className="text-xs text-ink-muted">가격과 링크를 불러오지 못했어요</p>
    );
  }
  const product = data?.find((p) => p.id === productId);
  // 판매처가 여럿이어도 첫 offer만 표시
  const offer = product?.offers?.[0];
  return product && offer && <Offers product={product} offer={offer} />;
}

/** 판매처 참고가 + 쿠팡 링크 - 대가성 문구는 링크 바로 옆, 접지 않음 */
function Offers({
  product,
  offer: o,
}: {
  product: FurniturePreset;
  offer: Offer;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
      <p className="flex items-baseline gap-2">
        <span className="text-xs text-ink-muted">참고가</span>
        <span className="text-base font-bold text-ink tabular-nums">
          {o.price.toLocaleString("ko-KR")}원
        </span>
        <span className="text-xs text-ink-muted tabular-nums">
          {o.checkedAt} 기준
        </span>
      </p>
      <p className="text-xs text-ink-muted">실제 가격은 쿠팡에서 확인</p>
      <a
        href={o.url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackCoupangClick({
            id: product.id,
            name: product.name,
            referencePrice: o.price,
          })
        }
        className="flex h-11 items-center justify-center gap-2 rounded-sm bg-primary-soft text-sm font-bold text-primary hover:bg-primary hover:text-white"
      >
        쿠팡에서 보기
        <ExternalLink size={16} aria-hidden />
      </a>
      <p className="text-xs leading-[1.4] text-ink-muted">{COUPANG_NOTICE}</p>
    </div>
  );
}

/** 내 가격 입력 상한 원 */
const MAX_PRICE = 1_000_000_000;

/** 입력이 견적에서 상품 참고가보다 먼저 쓰임 - 쿠팡 카드와 모양을 달리해 입력창으로만 보임 */
function OwnPrice({
  value,
  productId,
  onChange,
}: {
  value: number | undefined;
  productId: string | undefined;
  onChange: (price: number | undefined) => void;
}) {
  const { data } = useProducts();
  const ref = productId
    ? data?.find((p) => p.id === productId)?.offers?.[0]
    : undefined;
  return (
    <>
      <NumberField
        label="내 가격"
        unit="원"
        thousands
        rejectBelowMin
        value={value}
        max={MAX_PRICE}
        placeholder={ref ? ref.price.toLocaleString("ko-KR") : "입력 안 함"}
        onCommit={onChange}
        onClear={() => onChange(undefined)}
      />
      <p className="-mt-2 text-xs text-ink-muted">
        {ref
          ? `내가 찾은 가격을 넣으면 견적에 이 값이 먼저 쓰여요. 비우면 참고가 ${ref.price.toLocaleString("ko-KR")}원으로 계산해요`
          : "내가 찾은 가격을 넣으면 견적에 더해져요"}
      </p>
    </>
  );
}

/** 가로·깊이만 바꾸는 빠른 선택 - 현재 값과 같으면 선택됨 */
function SizeChoices({
  choices,
  size,
  onPick,
}: {
  choices: NonNullable<(typeof SIZE_CHOICES)[FurnitureCategory]>;
  size: Size;
  onPick: (choice: (typeof choices)[number]) => void;
}) {
  return (
    <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-0.5 md:mx-0 md:flex-wrap md:px-0">
      {choices.map((c) => {
        const on =
          size.width === c.width &&
          (c.depth === undefined || size.depth === c.depth);
        return (
          <button
            key={c.label}
            type="button"
            aria-pressed={on}
            onClick={() => !on && onPick(c)}
            className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-sm ${TOUCH_44} ${
              on
                ? "bg-primary-soft font-bold text-primary"
                : "border border-border bg-surface font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {c.label}
            <small className="text-xs font-normal tabular-nums opacity-80">
              {c.depth === undefined ? c.width : `${c.width}×${c.depth}`}
            </small>
          </button>
        );
      })}
    </div>
  );
}

const WARNING_STYLE: Record<WarningTone, string> = {
  danger: "bg-danger-soft text-danger",
  caution: "bg-caution-soft text-caution",
};

function Warnings({ items }: { items: { text: string; tone: WarningTone }[] }) {
  return items.map(({ text, tone }) => (
    <p
      key={text}
      className={`flex items-center gap-2 rounded-sm p-3 text-sm font-medium ${WARNING_STYLE[tone]}`}
    >
      <TriangleAlert size={16} className="shrink-0" aria-hidden />
      {text}
    </p>
  ));
}

function Actions({ furniture }: { furniture: boolean }) {
  return (
    <div className="flex gap-2">
      {furniture && (
        <button
          type="button"
          onClick={duplicateSelected}
          className="h-11 flex-1 rounded-sm border border-border bg-canvas text-sm font-semibold text-ink hover:bg-surface"
        >
          복제
        </button>
      )}
      <button
        type="button"
        onClick={deleteSelected}
        className="h-11 flex-1 rounded-sm border border-danger bg-canvas text-sm font-semibold text-danger hover:bg-danger-soft"
      >
        삭제
      </button>
    </div>
  );
}

function FurnitureProps({
  room,
  furniture: f,
  headerAction,
  showActions,
}: {
  room: Room;
  furniture: PlacedFurniture;
  headerAction?: ReactNode;
  showActions?: boolean;
}) {
  const update = useEditor((s) => s.update);
  const showToast = useEditor((s) => s.showToast);
  const preset = presetOf(f.presetId);
  const minSize = minSizeOf(FURNITURE_PRESETS, f.presetId);
  // 실제 상품은 크기가 정해져 있어 빠른 선택을 숨김
  const choices = preset && !f.product && SIZE_CHOICES[preset.category];
  const size = (key: "width" | "depth" | "height") => (value: number) =>
    update(resizeFurniture(room, FURNITURE_PRESETS, f.id, { [key]: value }));
  const set = (patch: Partial<Omit<PlacedFurniture, "id">>) =>
    update(updateFurniture(room, f.id, patch));
  // X·Y는 회전 외곽 상자 왼쪽 위 기준 - 저장은 중심
  const topLeft = furnitureTopLeft(f);
  const moveTo = (p: typeof topLeft) =>
    set({ position: centerFromTopLeft(f, p) });
  const warnings = warningsOf(room)
    .filter((w) =>
      w.type === "overlap"
        ? w.furnitureIds.includes(f.id)
        : w.furnitureId === f.id,
    )
    .map((w) => ({
      text: warningText(room, w, f.id),
      tone: WARNING_TONE[w.type],
    }));

  return (
    <div className="flex flex-col gap-4">
      <Header
        icon={
          <FurnitureThumb
            category={preset?.category}
            size={f.size}
            color={FURNITURE_COLORS[f.color].hex}
            px={44}
          />
        }
        title={placedName(f)}
        subtitle={preset ? CATEGORY_LABELS[preset.category] : "기타"}
        action={headerAction}
      />
      {f.product && <ProductOffers productId={f.product.id} />}
      <SectionTitle>내 가격</SectionTitle>
      <OwnPrice
        value={f.price}
        productId={f.product?.id}
        onChange={(price) => set({ price })}
      />
      <SectionTitle>크기</SectionTitle>
      {choices && (
        <SizeChoices
          choices={choices}
          size={f.size}
          onPick={(c) =>
            update(
              resizeFurniture(room, FURNITURE_PRESETS, f.id, {
                width: c.width,
                depth: c.depth,
              }),
            )
          }
        />
      )}
      <div className="flex gap-2">
        {(
          [
            ["width", "가로"],
            ["depth", "세로"],
            ["height", "높이"],
          ] as const
        ).map(([key, label]) => (
          <NumberField
            key={key}
            label={label}
            unit="cm"
            min={minSize[key]}
            max={FURNITURE_SIZE_LIMITS.max}
            value={f.size[key]}
            onCommit={size(key)}
            onClampMin={() =>
              showToast({
                message: `${placedName(f)} ${label}는 ${minSize[key]}cm부터 가능해요`,
              })
            }
          />
        ))}
      </div>
      <SectionTitle>위치</SectionTitle>
      <div className="flex gap-2">
        <NumberField
          label="X"
          unit="cm"
          min={-10000}
          value={topLeft.x}
          onCommit={(x) => moveTo({ ...topLeft, x })}
        />
        <NumberField
          label="Y"
          unit="cm"
          min={-10000}
          value={topLeft.y}
          onCommit={(y) => moveTo({ ...topLeft, y })}
        />
      </div>
      <SectionTitle>회전</SectionTitle>
      <div className="flex items-end gap-2">
        <NumberField
          label="각도"
          unit="°"
          min={-10000}
          value={displayAngle(f.rotation)}
          onCommit={(deg) => set({ rotation: rotationFromDisplay(deg) })}
        />
        <button
          type="button"
          onClick={rotateSelected90}
          className="flex h-11 items-center gap-2 rounded-sm bg-primary-soft px-4 text-sm font-bold text-primary hover:bg-primary hover:text-white"
        >
          <RotateCw size={16} aria-hidden />
          90°
        </button>
      </div>
      <SectionTitle>색</SectionTitle>
      <ColorPicker value={f.color} onChange={(color) => set({ color })} />
      <Warnings items={warnings} />
      {showActions && <Actions furniture />}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: PlacedFurniture["color"];
  onChange: (color: PlacedFurniture["color"]) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-3"
      role="radiogroup"
      aria-label="가구 색"
    >
      {Object.values(FURNITURE_COLORS).map((c) => {
        const on = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={c.name}
            title={c.name}
            onClick={() => !on && onChange(c.id)}
            className="flex size-11 items-center justify-center rounded-sm hover:bg-surface"
          >
            <span
              className={`size-8 rounded-full ${
                on
                  ? "border-2 border-primary shadow-selection"
                  : "border border-border"
              }`}
              // 견본 색은 데이터 값
              style={{ background: c.hex }}
            />
          </button>
        );
      })}
    </div>
  );
}

function OpeningProps({
  room,
  opening: o,
  headerAction,
  showActions,
}: {
  room: Room;
  opening: Opening;
  headerAction?: ReactNode;
  showActions?: boolean;
}) {
  const update = useEditor((s) => s.update);
  const set = (fn: (o: Opening) => Opening) =>
    update(updateOpening(room, o.id, fn));
  const { length } = wallFrame(room, o.wall);
  const blockers = warningsOf(room)
    .filter((w) => w.type === "doorBlocked" && w.openingId === o.id)
    .map((w) => ({
      text: warningText(room, w, ""),
      tone: WARNING_TONE[w.type],
    }));

  return (
    <div className="flex flex-col gap-4">
      <Header
        icon={
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <OpeningIcon opening={o} size={22} />
          </span>
        }
        title={OPENING_LABELS[o.kind]}
        subtitle={`${o.kind === "window" ? "창문" : "문"} · ${wallLabel(o.wall)}`}
        action={headerAction}
      />
      {o.kind !== "window" && (
        <>
          <SectionTitle>종류</SectionTitle>
          <Segment
            label="문 종류"
            full
            value={o.kind}
            options={[
              { value: "hinged", label: "여닫이" },
              { value: "sliding", label: "미닫이" },
            ]}
            onChange={(kind) => update(setOpeningKind(room, o.id, kind))}
          />
        </>
      )}
      <SectionTitle>크기</SectionTitle>
      <div className="flex gap-2">
        <NumberField
          label="폭"
          unit="cm"
          min={OPENING_MIN_WIDTH}
          max={length}
          value={o.width}
          onCommit={(width) => update(setOpeningWidth(room, o.id, width))}
        />
        <NumberField
          label="높이"
          unit="cm"
          min={1}
          value={o.height}
          onCommit={(height) => set((item) => ({ ...item, height }))}
        />
      </div>
      <SectionTitle>위치</SectionTitle>
      <div className="flex gap-2">
        <NumberField
          label="벽 왼쪽 끝에서"
          unit="cm"
          max={length - o.width}
          value={o.offset}
          onCommit={(offset) => set((item) => ({ ...item, offset }))}
        />
        {o.kind === "window" && (
          <NumberField
            label="바닥에서"
            unit="cm"
            value={o.sill}
            onCommit={(sill) => set((item) => ({ ...item, sill }))}
          />
        )}
      </div>
      {o.kind === "hinged" && (
        <>
          <SectionTitle>열리는 방향</SectionTitle>
          <Segment
            label="경첩"
            full
            value={o.hinge}
            options={[
              { value: "left", label: "경첩 왼쪽" },
              { value: "right", label: "경첩 오른쪽" },
            ]}
            onChange={(hinge) =>
              set((item) =>
                item.kind === "hinged" ? { ...item, hinge } : item,
              )
            }
          />
          <Segment
            label="열리는 쪽"
            full
            value={o.swing}
            options={[
              { value: "in", label: "방 안쪽" },
              { value: "out", label: "바깥쪽" },
            ]}
            onChange={(swing) =>
              set((item) =>
                item.kind === "hinged" ? { ...item, swing } : item,
              )
            }
          />
        </>
      )}
      <Warnings items={blockers} />
      {showActions && <Actions furniture={false} />}
    </div>
  );
}
