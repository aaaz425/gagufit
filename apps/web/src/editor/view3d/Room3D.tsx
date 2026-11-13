"use client";

import { wallFrame, type Room } from "@gagufit/core";
import { FURNITURE_PRESETS } from "@gagufit/data";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { RotateCcw } from "lucide-react";
import { NeutralToneMapping } from "three";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
} from "react";
import { prefersReducedMotion, useInitialIds } from "@/motion";
import type { Insets } from "../layout";
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
  /** 캔버스 위 패널에 가려진 영역 px - 맞춤·버튼이 비켜감 */
  insets: Insets;
  onSelect: (id: string | null) => void;
};

/** 끌기로 판단하는 포인터 이동 거리 px - 회전 후 놓을 때 선택이 바뀌지 않게 */
const DRAG_THRESHOLD = 4;
const FOV = 45;
/** 맞춤 때 보이는 영역 가장자리 여백 px */
const FIT_MARGIN = 24;
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

const SUN_COLOR = "#FFF3E0";
const FILL_COLOR = "#DCE6FF";

/** 코드로 만든 작은 환경맵 - 파일·네트워크 없이 부드러운 반사·간접광, 한 번만 그림 */
// 모듈 상수 - 재렌더마다 새로 만들면 환경맵을 다시 구움
const REFLECTIONS = (
  <Environment resolution={64} frames={1} environmentIntensity={0.35}>
    <Lightformer
      form="rect"
      intensity={2.5}
      color={SUN_COLOR}
      position={[0, 6, 0]}
      rotation-x={Math.PI / 2}
      scale={[12, 12, 1]}
    />
  </Environment>
);

function Lights({ room, shadows }: { room: Room; shadows: boolean }) {
  const sun = sunPosition(room);
  const half = m(Math.max(room.width, room.depth)) * 0.75;
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["white", SCENE_COLORS.floor, 0.8]} />
      {/* 햇빛 반대편 약한 보조광 - 그림자 쪽 면이 뭉개지지 않게, 그림자 없음 */}
      <directionalLight
        position={[-sun[0], sun[1] * 0.6, -sun[2]]}
        intensity={0.45}
        color={FILL_COLOR}
      />
      <directionalLight
        position={sun}
        color={SUN_COLOR}
        intensity={2.4}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
        shadow-normalBias={0.05}
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
  insets: Insets;
};

/**
 * 방 전체가 패널에 가리지 않은 영역 가운데 오게 비스듬히 - 처음·리셋·방 크기 변화 때만
 * 패널이 열리고 닫혀도 시점은 그대로
 */
function CameraRig({ room, controls, resetKey, insets }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const radius = Math.hypot(m(room.width), m(room.depth), m(room.height)) / 2;
  /** 맞춘 순간 보이는 영역 중심까지 화면 이동 px */
  const shift = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const margin = 2 * FIT_MARGIN;
    const visibleW = Math.max(
      1,
      size.width - insets.left - insets.right - margin,
    );
    const visibleH = Math.max(
      1,
      size.height - insets.top - insets.bottom - margin,
    );
    // 보이는 영역만큼 좁아진 화각
    const halfV = Math.atan(
      Math.tan((FOV * Math.PI) / 360) * (visibleH / size.height),
    );
    const halfH = Math.atan(Math.tan(halfV) * (visibleW / visibleH));
    const distance = (radius / Math.sin(Math.min(halfV, halfH))) * 1.05;
    const target: [number, number, number] = [0, m(room.height) * 0.25, 0];
    camera.position.set(
      Math.sin(VIEW_AZIMUTH) * Math.cos(VIEW_ELEVATION) * distance,
      target[1] + Math.sin(VIEW_ELEVATION) * distance,
      Math.cos(VIEW_AZIMUTH) * Math.cos(VIEW_ELEVATION) * distance,
    );
    shift.current = {
      x: (insets.left - insets.right) / 2,
      y: (insets.top - insets.bottom) / 2,
    };
    const c = controls.current;
    if (c) {
      c.target.set(...target);
      c.update();
    }
    invalidate();
    // 창 크기·패널 변화마다 시점을 되돌리지 않게 size·insets는 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, controls, radius, room.height, resetKey, invalidate]);

  // 회전 중심은 방 가운데로 두고 투영만 옮김 - 창 크기가 바뀌면 다시 적용
  useEffect(() => {
    const { width, height } = size;
    camera.setViewOffset(
      width,
      height,
      -shift.current.x,
      -shift.current.y,
      width,
      height,
    );
    invalidate();
  }, [camera, size, radius, resetKey, invalidate]);
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
  insets,
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

  const initialIds = useInitialIds(room.furniture.map((f) => f.id));
  // 고해상도를 끈 저사양에서는 3D 움직임 생략
  const [reducedMotion] = useState(prefersReducedMotion);
  const animate = quality.hiDpi && !reducedMotion;

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
    <div className="relative h-full w-full bg-linear-to-b from-canvas to-surface">
      <Canvas
        frameloop="demand"
        // 색을 덜 바꾸는 톤 매핑 - 가구·벽 색이 본래 색에 가깝게
        gl={{ toneMapping: NeutralToneMapping }}
        dpr={quality.hiDpi ? [1, 2] : 1}
        shadows={quality.shadows && "percentage"}
        camera={{ fov: FOV, near: 0.05, far: 100 }}
        onPointerMissed={(e) => {
          if (e.type === "click") onSelect(null);
        }}
      >
        <Lights room={room} shadows={quality.shadows} />
        {REFLECTIONS}
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
              realShadows={quality.shadows}
              animate={animate}
              enter={!initialIds.has(f.id)}
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
        <CameraRig
          room={room}
          controls={controls}
          resetKey={resetKey}
          insets={insets}
        />
        {quality.post && (
          <EffectComposer multisampling={0} enableNormalPass>
            <SSAO radius={0.1} intensity={6} luminanceInfluence={0.6} />
          </EffectComposer>
        )}
      </Canvas>
      <button
        type="button"
        aria-label="시점 초기화"
        onClick={reset}
        // 2D 확대 버튼과 같은 자리 규칙 - 패널 옆
        style={{ left: insets.left + 24, bottom: insets.bottom + 24 }}
        className="absolute flex size-11 items-center justify-center rounded-sm bg-canvas text-ink shadow-raised hover:bg-surface"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
