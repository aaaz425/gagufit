import {
  doorPassageCorners,
  roomCorners,
  wallSegment,
  type Opening,
  type Room,
  type Vec2,
  type WallIndex,
} from "@gagufit/core";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FLOOR_MATERIALS } from "@gagufit/data";
import {
  DoubleSide,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
} from "three";
import { DOOR_AREA_OPACITY, SCENE_COLORS } from "../scene-colors";
import { floorPolygon, m, worldUvBox } from "./geometry";
import { useSurfaceMaterial } from "./surface-material";

/** 벽 두께 - 방 안쪽 치수를 지키게 바깥으로 */
const WALL_THICKNESS = 10;
/** 카메라 쪽 벽을 낮춘 높이 */
const LOWERED_WALL_HEIGHT = 90;
/** 낮춘 벽 위 창문 표시 두께 */
const MARK_HEIGHT = 1;

type Piece = {
  /** 벽 시작점부터 */
  from: number;
  to: number;
  bottom: number;
  top: number;
};

/** 개구부를 뺀 벽 조각 - 끝쪽 모서리는 이 벽이 채움 */
function wallPieces(length: number, top: number, openings: Opening[]) {
  const pieces: Piece[] = [];
  const marks: Piece[] = [];
  const holes = openings
    .map((o) => ({
      from: o.offset,
      to: o.offset + o.width,
      bottom: o.sill,
      top: Math.min(o.sill + o.height, top),
    }))
    .sort((a, b) => a.from - b.from);
  let x = 0;
  for (const hole of holes) {
    if (hole.bottom >= top) {
      marks.push({ ...hole, bottom: top, top: top + MARK_HEIGHT });
      continue;
    }
    if (hole.from > x) pieces.push({ from: x, to: hole.from, bottom: 0, top });
    if (hole.bottom > 0) pieces.push({ ...hole, top: hole.bottom, bottom: 0 });
    if (hole.top < top) pieces.push({ ...hole, bottom: hole.top, top });
    x = Math.max(x, hole.to);
  }
  const end = length + WALL_THICKNESS;
  if (end > x) pieces.push({ from: x, to: end, bottom: 0, top });
  return { pieces, marks };
}

function wallFrame(room: Room, wall: WallIndex) {
  const { start, end } = wallSegment(room, wall);
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  const u = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
  // 꼭짓점이 시계 방향이라 바깥은 진행 방향 왼쪽
  const out = { x: u.y, y: -u.x };
  return { start, length, u, out, angle: Math.atan2(-u.y, u.x) };
}

function pieceGeometry(piece: Piece) {
  const w = m(piece.to - piece.from);
  const h = m(piece.top - piece.bottom);
  const cx = m((piece.from + piece.to) / 2);
  const cy = m((piece.bottom + piece.top) / 2);
  return {
    geometry: worldUvBox([w, h, m(WALL_THICKNESS)], [cx, cy, 0]),
    along: cx,
    y: cy,
  };
}

type WallProps = {
  room: Room;
  wall: WallIndex;
  lowered: boolean;
  material: Material;
};

function Wall({ room, wall, lowered, material }: WallProps) {
  const frame = wallFrame(room, wall);
  const top = lowered
    ? Math.min(LOWERED_WALL_HEIGHT, room.height)
    : room.height;
  const openings = room.openings.filter((o) => o.wall === wall);
  const { pieces, marks } = useMemo(() => {
    const result = wallPieces(frame.length, top, openings);
    return {
      pieces: result.pieces.map(pieceGeometry),
      marks: result.marks.map(pieceGeometry),
    };
    // openings 배열은 렌더마다 새로 만들어져 room.openings로 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.length, top, room.openings, wall]);

  useEffect(
    () => () => {
      for (const p of [...pieces, ...marks]) p.geometry.dispose();
    },
    [pieces, marks],
  );

  const half = m(WALL_THICKNESS) / 2;
  return (
    <group
      position={[
        m(frame.start.x) + frame.out.x * half,
        0,
        m(frame.start.y) + frame.out.y * half,
      ]}
      rotation-y={frame.angle}
    >
      {pieces.map((p, i) => (
        <mesh
          key={i}
          geometry={p.geometry}
          material={material}
          position={[p.along, p.y, 0]}
          castShadow
          receiveShadow
        />
      ))}
      {marks.map((p, i) => (
        <mesh
          key={`mark-${i}`}
          geometry={p.geometry}
          position={[p.along, p.y, 0]}
        >
          <meshBasicMaterial color={SCENE_COLORS.wall} />
        </mesh>
      ))}
    </group>
  );
}

function Floor({ room, material }: { room: Room; material: Material }) {
  const geometry = useMemo(
    () =>
      worldUvBox(
        [m(room.width), 0.02, m(room.depth)],
        [m(room.width) / 2, -0.01, m(room.depth) / 2],
      ),
    [room.width, room.depth],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[m(room.width) / 2, -0.01, m(room.depth) / 2]}
      receiveShadow
    />
  );
}

/** 문 열림 영역 - 안쪽 여닫이는 부채꼴, 미닫이·바깥 여닫이는 문 앞 통로 */
function doorArea(room: Room, door: Opening): Vec2[] | null {
  if (door.kind === "window") return null;
  if (door.kind === "sliding" || door.swing === "out") {
    return doorPassageCorners(room, door);
  }
  const { start, end } = wallSegment(room, door.wall);
  const len = Math.hypot(end.x - start.x, end.y - start.y);
  const u = { x: (end.x - start.x) / len, y: (end.y - start.y) / len };
  const inward = { x: -u.y, y: u.x };
  const along = door.hinge === "left" ? door.offset : door.offset + door.width;
  const hinge = { x: start.x + u.x * along, y: start.y + u.y * along };
  // 닫힌 문 방향 - 경첩에서 반대쪽 문틀로
  const closed = door.hinge === "left" ? u : { x: -u.x, y: -u.y };
  const points: Vec2[] = [hinge];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = ((Math.PI / 2) * i) / steps;
    const c = Math.cos(t);
    const s = Math.sin(t);
    points.push({
      x: hinge.x + (closed.x * c + inward.x * s) * door.width,
      y: hinge.y + (closed.y * c + inward.y * s) * door.width,
    });
  }
  return points;
}

function DoorAreas({ room }: { room: Room }) {
  const geometries = useMemo(
    () =>
      room.openings
        .map((o) => doorArea(room, o))
        .filter((p): p is Vec2[] => p !== null)
        .map((p) => floorPolygon(p, 0.002)),
    // 문 위치·방 크기만 영향
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [room.openings, room.width, room.depth],
  );
  useEffect(
    () => () => geometries.forEach((g: BufferGeometry) => g.dispose()),
    [geometries],
  );
  return geometries.map((geometry, i) => (
    <mesh key={i} geometry={geometry} renderOrder={1}>
      <meshBasicMaterial
        color={SCENE_COLORS.inkMuted}
        transparent
        opacity={DOOR_AREA_OPACITY}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  ));
}

function TexturedShell(props: ShellProps & { hiRes: boolean }) {
  const floor = useSurfaceMaterial(props.room.floorMaterial, props.hiRes);
  const wall = useSurfaceMaterial(props.room.wallMaterial, props.hiRes);
  return <ShellMeshes {...props} floorMaterial={floor} wallMaterial={wall} />;
}

// 텍스처 받는 동안 잠깐 보이는 벽
const PLAIN_WALL = new MeshStandardMaterial({ color: SCENE_COLORS.floor });

type ShellProps = { room: Room; lowered: ReadonlySet<WallIndex> };

function ShellMeshes({
  room,
  lowered,
  floorMaterial,
  wallMaterial,
}: ShellProps & { floorMaterial: Material; wallMaterial: Material }) {
  return (
    <>
      <Floor room={room} material={floorMaterial} />
      {roomCorners(room).map((_, wall) => (
        <Wall
          key={wall}
          room={room}
          wall={wall}
          lowered={lowered.has(wall)}
          material={wallMaterial}
        />
      ))}
    </>
  );
}

/** 카메라가 벽 바깥쪽에 있으면 그 벽을 낮춤 - 바뀔 때만 다시 그림 */
function useLoweredWalls(room: Room) {
  const [lowered, setLowered] = useState<ReadonlySet<WallIndex>>(new Set());
  useFrame(({ camera }) => {
    // 씬은 방 가운데가 원점
    const cx = camera.position.x * 100 + room.width / 2;
    const cz = camera.position.z * 100 + room.depth / 2;
    const next = new Set<WallIndex>();
    roomCorners(room).forEach((_, wall) => {
      const { start, out } = wallFrame(room, wall);
      if ((cx - start.x) * out.x + (cz - start.y) * out.y > 0) next.add(wall);
    });
    const same =
      next.size === lowered.size && [...next].every((w) => lowered.has(w));
    if (!same) setLowered(next);
  });
  return lowered;
}

type RoomShellProps = {
  room: Room;
  hiRes: boolean;
  /** 벽·바닥 클릭 - 뒤 가구가 선택되지 않게 여기서 멈춤 */
  onClick: (e: ThreeEvent<MouseEvent>) => void;
};

/** 바닥·벽·문 열림 영역 - 방 왼쪽 위 모서리가 원점인 평면 좌표 */
export function RoomShell({ room, hiRes, onClick }: RoomShellProps) {
  const lowered = useLoweredWalls(room);
  const floorColor = FLOOR_MATERIALS[room.floorMaterial].color2d;
  const plainFloor = useMemo(
    () => new MeshStandardMaterial({ color: floorColor }),
    [floorColor],
  );
  useEffect(() => () => plainFloor.dispose(), [plainFloor]);
  const plain = (
    <ShellMeshes
      room={room}
      lowered={lowered}
      floorMaterial={plainFloor}
      wallMaterial={PLAIN_WALL}
    />
  );
  return (
    <group onClick={onClick}>
      <Suspense fallback={plain}>
        <TexturedShell room={room} lowered={lowered} hiRes={hiRes} />
      </Suspense>
      <DoorAreas room={room} />
    </group>
  );
}
