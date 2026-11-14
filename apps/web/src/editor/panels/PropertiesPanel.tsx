"use client";

import {
  FURNITURE_SIZE_LIMITS,
  OPENING_MIN_WIDTH,
  resizeFurniture,
  setOpeningKind,
  setOpeningWidth,
  wallFrame,
  type Opening,
  type PlacedFurniture,
  type Room,
} from "@gagufit/core";
import { FURNITURE_COLORS, FURNITURE_PRESETS } from "@gagufit/data";
import { RotateCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import {
  deleteSelected,
  displayAngle,
  duplicateSelected,
  rotateSelected90,
  rotationFromDisplay,
  updateFurniture,
  updateOpening,
} from "../actions";
import {
  CATEGORY_LABELS,
  OPENING_LABELS,
  wallLabel,
  WARNING_TONE,
  type WarningTone,
  warningText,
} from "../labels";
import { FurnitureThumb } from "../plan/FurnitureSymbol";
import { useEditor, useRoom, warningsOf } from "../store";
import { NumberField, SectionTitle, Segment } from "../ui";
import { OpeningIcon } from "./RoomPanel";

/** 선택한 가구·문·창문 속성 - header는 모바일 시트 접기 버튼 자리 */
export function PropertiesPanel({
  headerAction,
  showActions,
}: {
  headerAction?: ReactNode;
  showActions?: boolean;
}) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  if (!selection) return null;
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
  const preset = FURNITURE_PRESETS[f.presetId];
  const size = (key: "width" | "depth" | "height") => (value: number) =>
    update(resizeFurniture(room, f.id, { [key]: value }));
  const set = (patch: Partial<Omit<PlacedFurniture, "id">>) =>
    update(updateFurniture(room, f.id, patch));
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
        title={preset?.name ?? "가구"}
        subtitle={preset ? CATEGORY_LABELS[preset.category] : "기타"}
        action={headerAction}
      />
      <SectionTitle>크기</SectionTitle>
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
            min={FURNITURE_SIZE_LIMITS.min}
            max={FURNITURE_SIZE_LIMITS.max}
            value={f.size[key]}
            onCommit={size(key)}
          />
        ))}
      </div>
      <SectionTitle>위치</SectionTitle>
      <div className="flex gap-2">
        <NumberField
          label="X"
          unit="cm"
          min={-10000}
          value={f.position.x}
          onCommit={(x) => set({ position: { ...f.position, x } })}
        />
        <NumberField
          label="Y"
          unit="cm"
          min={-10000}
          value={f.position.y}
          onCommit={(y) => set({ position: { ...f.position, y } })}
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
