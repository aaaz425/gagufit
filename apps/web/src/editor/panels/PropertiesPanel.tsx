"use client";

import {
  setOpeningWidth,
  snapRotation,
  type Opening,
  type PlacedFurniture,
  type Room,
} from "@gagufit/core";
import { FURNITURE_COLORS, FURNITURE_PRESETS } from "@gagufit/data";
import { RotateCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import {
  deleteSelected,
  duplicateSelected,
  rotateSelected90,
  setDoorKind,
  updateFurniture,
  updateOpening,
  wallLength,
} from "../actions";
import {
  CATEGORY_LABELS,
  OPENING_LABELS,
  wallLabel,
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
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="truncate text-[17px] font-bold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Warnings({ texts }: { texts: string[] }) {
  return texts.map((text) => (
    <p
      key={text}
      className="flex items-center gap-2.5 rounded-sm bg-danger-soft p-3 text-[13px] font-medium text-danger"
    >
      <TriangleAlert size={16} className="shrink-0" aria-hidden />
      {text}
    </p>
  ));
}

function Actions({ furniture }: { furniture: boolean }) {
  return (
    <div className="flex gap-2.5">
      {furniture && (
        <button
          type="button"
          onClick={duplicateSelected}
          className="h-11 flex-1 rounded-sm border border-border bg-canvas text-sm font-semibold text-ink"
        >
          복제
        </button>
      )}
      <button
        type="button"
        onClick={deleteSelected}
        className="h-11 flex-1 rounded-sm border border-danger bg-canvas text-sm font-semibold text-danger"
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
  if (!preset) return null;
  const set = (patch: Partial<Omit<PlacedFurniture, "id">>) =>
    update(updateFurniture(room, f.id, patch));
  const warnings = warningsOf(room)
    .filter((w) =>
      w.type === "overlap"
        ? w.furnitureIds.includes(f.id)
        : w.furnitureId === f.id,
    )
    .map((w) => warningText(room, w, f.id));

  return (
    <div className="flex flex-col gap-4.5">
      <Header
        icon={<FurnitureThumb preset={preset} size={44} />}
        title={preset.name}
        subtitle={`${CATEGORY_LABELS[preset.category]} · 표준 규격`}
        action={headerAction}
      />
      <SectionTitle>크기</SectionTitle>
      <p className="-mt-2.5 text-sm text-ink tabular-nums">
        {preset.size.width} × {preset.size.depth} cm · 높이 {preset.size.height}{" "}
        cm
      </p>
      <SectionTitle>위치</SectionTitle>
      <div className="flex gap-2.5">
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
      <div className="flex items-end gap-2.5">
        <NumberField
          label="각도"
          unit="°"
          min={-10000}
          value={f.rotation}
          onCommit={(deg) => set({ rotation: snapRotation(deg, 0) })}
        />
        <button
          type="button"
          onClick={rotateSelected90}
          className="flex h-11 items-center gap-1.5 rounded-sm bg-primary-soft px-4 text-sm font-bold text-primary"
        >
          <RotateCw size={16} aria-hidden />
          90°
        </button>
      </div>
      <SectionTitle>색</SectionTitle>
      <div
        className="flex flex-wrap gap-3"
        role="radiogroup"
        aria-label="가구 색"
      >
        {Object.values(FURNITURE_COLORS).map((c) => {
          const on = c.id === f.color;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={c.name}
              title={c.name}
              onClick={() => set({ color: c.id })}
              className="flex size-11 items-center justify-center"
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
      <Warnings texts={warnings} />
      {showActions && <Actions furniture />}
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
  const length = wallLength(room, o.wall);
  const blockers = warningsOf(room)
    .filter((w) => w.type === "doorBlocked" && w.openingId === o.id)
    .map((w) => warningText(room, w, ""));

  return (
    <div className="flex flex-col gap-4.5">
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
            onChange={(kind) => set((item) => setDoorKind(item, kind))}
          />
        </>
      )}
      <SectionTitle>크기</SectionTitle>
      <div className="flex gap-2.5">
        <NumberField
          label="폭"
          unit="cm"
          min={1}
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
      <div className="flex gap-2.5">
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
      <Warnings texts={blockers} />
      {showActions && <Actions furniture={false} />}
    </div>
  );
}
