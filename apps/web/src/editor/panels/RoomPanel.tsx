"use client";

import { resizeRoom, type Opening } from "@gagufit/core";
import { FLOOR_MATERIALS, WALL_MATERIALS } from "@gagufit/data";
import { AppWindow, ChevronRight, DoorOpen, PanelLeftOpen } from "lucide-react";
import { addOpeningToRoom } from "../actions";
import { OPENING_LABELS, openingSummary } from "../labels";
import { useEditor, useRoom } from "../store";
import { NumberField, SectionTitle } from "../ui";

export function OpeningIcon({
  opening,
  size,
}: {
  opening: Opening;
  size: number;
}) {
  const Icon =
    opening.kind === "hinged"
      ? DoorOpen
      : opening.kind === "sliding"
        ? PanelLeftOpen
        : AppWindow;
  return <Icon size={size} aria-hidden />;
}

export function RoomPanel({ onPick }: { onPick?: () => void }) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const select = useEditor((s) => s.select);
  const update = useEditor((s) => s.update);

  const resize = (key: "width" | "depth" | "height") => (value: number) =>
    update(resizeRoom(room, { [key]: value }));

  return (
    <div className="flex flex-col gap-3.5">
      <SectionTitle>방 크기</SectionTitle>
      <div className="flex gap-2">
        <NumberField
          label="가로"
          unit="cm"
          min={1}
          value={room.width}
          onCommit={resize("width")}
        />
        <NumberField
          label="세로"
          unit="cm"
          min={1}
          value={room.depth}
          onCommit={resize("depth")}
        />
        <NumberField
          label="층고"
          unit="cm"
          min={1}
          value={room.height}
          onCommit={resize("height")}
        />
      </div>

      <hr className="border-border" />
      <SectionTitle>문·창문</SectionTitle>
      <ul className="flex flex-col gap-2">
        {room.openings.map((o) => {
          const on = selection?.kind === "opening" && selection.id === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  select({ kind: "opening", id: o.id });
                  onPick?.();
                }}
                className={`flex w-full items-center gap-3 rounded-sm p-2.5 text-left ${
                  on
                    ? "border-[1.5px] border-primary bg-primary-soft"
                    : "border border-border bg-canvas hover:bg-surface"
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-sm ${
                    on ? "bg-canvas text-primary" : "bg-surface text-ink"
                  }`}
                >
                  <OpeningIcon opening={o} size={18} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`text-sm font-semibold ${on ? "text-primary" : "text-ink"}`}
                  >
                    {OPENING_LABELS[o.kind]}
                  </span>
                  <span className="text-xs text-ink-muted tabular-nums">
                    {openingSummary(o)}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-ink-subtle md:hidden"
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <AddButton onClick={() => addOpeningToRoom("hinged")}>+ 문</AddButton>
        <AddButton onClick={() => addOpeningToRoom("window")}>+ 창문</AddButton>
      </div>
      <p className="text-xs leading-normal text-ink-muted">
        추가하면 빈 벽 가운데에 놓여요. 끌어서 벽을 따라 옮기기
      </p>

      <hr className="border-border" />
      <SectionTitle>바닥</SectionTitle>
      <Swatches
        items={Object.values(FLOOR_MATERIALS)}
        value={room.floorMaterial}
        onChange={(floorMaterial) => update({ ...room, floorMaterial })}
      />
      <SectionTitle>벽</SectionTitle>
      <Swatches
        items={Object.values(WALL_MATERIALS)}
        value={room.wallMaterial}
        onChange={(wallMaterial) => update({ ...room, wallMaterial })}
      />
    </div>
  );
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 flex-1 rounded-sm border border-border bg-canvas text-sm font-semibold text-ink hover:bg-surface"
    >
      {children}
    </button>
  );
}

function Swatches<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; name: string; image: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,64px)] justify-between gap-y-3">
      {items.map((m) => {
        const on = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(m.id)}
            className="flex w-16 flex-col items-center gap-1.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 56px 견본, 최적화 불필요 */}
            <img
              src={`/${m.image}`}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              className={`size-14 rounded-md object-cover ${
                on
                  ? "border-2 border-primary shadow-selection"
                  : "border border-border"
              }`}
            />
            <span
              className={`text-[11px] ${on ? "font-bold text-primary" : "font-medium text-ink-muted"}`}
            >
              {m.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
