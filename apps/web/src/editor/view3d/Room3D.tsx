"use client";

import { wallFrame, type Room } from "@gagufit/core";
import { FURNITURE_PRESETS } from "@gagufit/data";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ComponentRef,
  type RefObject,
} from "react";
import type { QualitySettings } from "../quality";
import { SCENE_COLORS } from "../scene-colors";
import { FurnitureMesh } from "./furniture-mesh";
import { m } from "./geometry";
import { RoomShell } from "./room-shell";

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;

export type Room3DProps = {
  room: Room;
  selectedId: string | null;
  warningIds: ReadonlySet<string>;
  quality: QualitySettings;
  onSelect: (id: string | null) => void;
};

/** 끌기로 판단하는 포인터 이동 거리 px - 회전 후 놓을 때 선택이 바뀌지 않게 */
const DRAG_THRESHOLD = 4;
const FOV = 45;
/** 처음 시점 - 위 45° 내려다보기, 앞 오른쪽에서 */
const VIEW_ELEVATION = Math.PI / 4;
const VIEW_AZIMUTH = Math.PI / 6;

/** 창문 쪽 햇빛 방향 - 창문 없으면 왼쪽 위 뒤에서 */
function sunPosition(room: Room): [number, number, number] {
  const opening = room.openings.find((o) => o.kind === "window");
  const reach = m(Math.max(room.width, room.depth));
  if (!opening) return [-reach, reach * 1.5, -reach * 0.6];
  const { start, u } = wallFrame(room, opening.wall);
  const mid = opening.offset + opening.width / 2;
  // 방 가운데 원점 기준, 창문 바깥쪽 위
  const x = m(start.x + u.x * mid - room.width / 2) + u.y * reach;
  const z = m(start.y + u.y * mid - room.depth / 2) - u.x * reach;
  return [x, reach * 1.2, z];
}

function Lights({ room, shadows }: { room: Room; shadows: boolean }) {
  const half = m(Math.max(room.width, room.depth)) * 0.75;
  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["white", SCENE_COLORS.floor, 0.6]} />
      <directionalLight
        position={sunPosition(room)}
        intensity={1.6}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-half}
        shadow-camera-right={half}
        shadow-camera-top={half}
        shadow-camera-bottom={-half}
        shadow-camera-far={20}
      />
    </>
  );
}

type CameraRigProps = {
  room: Room;
  controls: RefObject<OrbitControlsImpl | null>;
  resetKey: number;
};

/** 방 전체가 화면에 들어오게 비스듬히 - 방 크기가 바뀌거나 리셋할 때만 */
function CameraRig({ room, controls, resetKey }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const invalidate = useThree((s) => s.invalidate);
  const radius = Math.hypot(m(room.width), m(room.depth), m(room.height)) / 2;

  useEffect(() => {
    const vfov = (FOV * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.05;
    const target: [number, number, number] = [0, m(room.height) * 0.25, 0];
    camera.position.set(
      Math.sin(VIEW_AZIMUTH) * Math.cos(VIEW_ELEVATION) * distance,
      target[1] + Math.sin(VIEW_ELEVATION) * distance,
      Math.cos(VIEW_AZIMUTH) * Math.cos(VIEW_ELEVATION) * distance,
    );
    const c = controls.current;
    if (c) {
      c.target.set(...target);
      c.update();
    }
    invalidate();
    // 창 크기 변화마다 시점을 되돌리지 않게 aspect는 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, controls, radius, room.height, resetKey, invalidate]);
  return null;
}

/**
 * 3D 방 보기 - 클라이언트 전용, next/dynamic ssr false로 불러올 것
 * 가구 크기는 배치 가구의 size, 프리셋에 없으면 기본 상자
 */
export default function Room3D({
  room,
  selectedId,
  warningIds,
  quality,
  onSelect,
}: Room3DProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [resetKey, reset] = useReducer((n: number) => n + 1, 0);

  const handleFurnitureClick = useCallback(
    (e: ThreeEvent<MouseEvent>, id: string) => {
      e.stopPropagation();
      if (e.delta <= DRAG_THRESHOLD) onSelect(id);
    },
    [onSelect],
  );
  const handleEmptyClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta <= DRAG_THRESHOLD) onSelect(null);
    },
    [onSelect],
  );

  const furniture = useMemo(
    () =>
      room.furniture.map((f) => ({
        furniture: f,
        // 저장 데이터의 presetId가 상속 키일 수 있음
        preset: Object.hasOwn(FURNITURE_PRESETS, f.presetId)
          ? FURNITURE_PRESETS[f.presetId]
          : undefined,
      })),
    [room.furniture],
  );

  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop="demand"
        dpr={quality.hiDpi ? [1, 2] : 1}
        shadows={quality.shadows && "percentage"}
        camera={{ fov: FOV, near: 0.05, far: 100 }}
        onPointerMissed={(e) => {
          if (e.type === "click") onSelect(null);
        }}
      >
        <Lights room={room} shadows={quality.shadows} />
        <group position={[-m(room.width) / 2, 0, -m(room.depth) / 2]}>
          <RoomShell
            room={room}
            hiRes={quality.hiDpi}
            onClick={handleEmptyClick}
          />
          {furniture.map(({ furniture: f, preset }) => (
            <FurnitureMesh
              key={f.id}
              furniture={f}
              preset={preset}
              selected={f.id === selectedId}
              warning={warningIds.has(f.id)}
              onClick={handleFurnitureClick}
            />
          ))}
        </group>
        <OrbitControls
          // 초기화 때 새로 만들어 끌기 뒤 남은 damping 회전을 버림
          key={resetKey}
          ref={controls}
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={0.5}
          maxDistance={
            Math.hypot(m(room.width), m(room.depth), m(room.height)) * 3
          }
        />
        <CameraRig room={room} controls={controls} resetKey={resetKey} />
        {quality.post && (
          <EffectComposer multisampling={0} enableNormalPass>
            <SSAO radius={0.08} intensity={20} luminanceInfluence={0.5} />
          </EffectComposer>
        )}
      </Canvas>
      <button
        type="button"
        aria-label="시점 초기화"
        onClick={reset}
        className="absolute bottom-6 left-6 flex size-11 items-center justify-center rounded-sm bg-canvas text-ink shadow-raised hover:bg-surface"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
