import type { Opening } from "@gagufit/core";
import { BoxGeometry, MeshStandardMaterial } from "three";
import { SCENE_COLORS } from "../scene-colors";
import { m } from "./geometry";

const UNIT = new BoxGeometry(1, 1, 1);
const TRIM = new MeshStandardMaterial({
  color: SCENE_COLORS.canvas,
  roughness: 0.55,
});
const LEAF = new MeshStandardMaterial({
  color: SCENE_COLORS.floor,
  roughness: 0.6,
});
const METAL = new MeshStandardMaterial({
  color: SCENE_COLORS.inkMuted,
  roughness: 0.3,
  metalness: 0.7,
});
const GLASS = new MeshStandardMaterial({
  color: "#CFE3EC",
  roughness: 0.05,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});

const BASEBOARD_HEIGHT = 8;
const FRAME = 3;
const HANDLE_HEIGHT = 95;

type BlockProps = {
  /** 벽 따라 구간 cm */
  x: [number, number];
  /** 바닥부터 높이 구간 cm */
  y: [number, number];
  /** 안쪽 벽면에서 방 안쪽으로 나온 구간 cm - 음수는 벽 속 */
  z: [number, number];
  material: MeshStandardMaterial;
  /** 벽 로컬 z에서 방 안쪽이 향하는 부호 */
  inner: 1 | -1;
  /** 벽 두께 절반 cm */
  half: number;
};

function Block({ x, y, z, material, inner, half }: BlockProps) {
  const near = inner * (half + z[0]);
  const far = inner * (half + z[1]);
  return (
    <mesh
      geometry={UNIT}
      material={material}
      scale={[m(x[1] - x[0]), m(y[1] - y[0]), m(Math.abs(far - near))]}
      position={[
        m((x[0] + x[1]) / 2),
        m((y[0] + y[1]) / 2),
        m((near + far) / 2),
      ]}
    />
  );
}

type Props = {
  /** 벽 길이 cm - 안쪽 치수 */
  length: number;
  /** 보이는 벽 높이 cm */
  top: number;
  openings: Opening[];
  inner: 1 | -1;
  half: number;
};

/** 걸레받이 - 문 자리는 뺌, 창문 틀·유리·턱, 문 틀·문짝·손잡이 */
export function WallTrim({ length, top, openings, inner, half }: Props) {
  const c = { inner, half };
  const shown = openings.filter((o) => o.sill < top);
  const gaps = shown
    .filter((o) => o.sill < BASEBOARD_HEIGHT)
    .map((o) => [o.offset, o.offset + o.width] as const)
    .sort((a, b) => a[0] - b[0]);
  const runs: [number, number][] = [];
  let x = 0;
  for (const [from, to] of gaps) {
    if (from > x) runs.push([x, from]);
    x = Math.max(x, to);
  }
  if (length > x) runs.push([x, length]);
  return (
    <>
      {runs.map(([from, to], i) => (
        <Block
          key={i}
          x={[from, to]}
          y={[0, Math.min(BASEBOARD_HEIGHT, top)]}
          z={[0, 1.2]}
          material={TRIM}
          {...c}
        />
      ))}
      {shown.map((o) => {
        const x0 = o.offset;
        const x1 = o.offset + o.width;
        const y0 = o.sill;
        const full = o.sill + o.height;
        const y1 = Math.min(full, top);
        // 위 틀은 벽을 낮춰 잘리지 않았을 때만
        const capped = full <= top;
        const frame = (
          <>
            <Block
              x={[x0, x0 + FRAME]}
              y={[y0, y1]}
              z={[0, 2]}
              material={TRIM}
              {...c}
            />
            <Block
              x={[x1 - FRAME, x1]}
              y={[y0, y1]}
              z={[0, 2]}
              material={TRIM}
              {...c}
            />
            {capped && (
              <Block
                x={[x0, x1]}
                y={[y1 - FRAME, y1]}
                z={[0, 2]}
                material={TRIM}
                {...c}
              />
            )}
          </>
        );
        if (o.kind === "window") {
          const mid = (x0 + x1) / 2;
          return (
            <group key={o.id}>
              {frame}
              <Block
                x={[x0 + FRAME, x1 - FRAME]}
                y={[y0, y0 + FRAME]}
                z={[0, 2]}
                material={TRIM}
                {...c}
              />
              <Block
                x={[x0, x1]}
                y={[y0 - 2, y0]}
                z={[0, 6]}
                material={TRIM}
                {...c}
              />
              <Block
                x={[mid - 1, mid + 1]}
                y={[y0, y1]}
                z={[0, 2]}
                material={TRIM}
                {...c}
              />
              <Block
                x={[x0 + FRAME, x1 - FRAME]}
                y={[y0 + FRAME, y1]}
                z={[-1.5, -0.5]}
                material={GLASS}
                {...c}
              />
            </group>
          );
        }
        const handleX =
          o.kind === "hinged" && o.hinge === "right" ? x0 + 8 : x1 - 8;
        const handleY = y0 + HANDLE_HEIGHT;
        return (
          <group key={o.id}>
            {frame}
            <Block
              x={[x0 + FRAME, x1 - FRAME]}
              y={[y0, capped ? y1 - FRAME : y1]}
              z={[-3, -0.5]}
              material={LEAF}
              {...c}
            />
            {handleY < y1 && (
              <Block
                x={[handleX - 5, handleX + 2]}
                y={[handleY - 1, handleY + 1]}
                z={[-0.5, 2.5]}
                material={METAL}
                {...c}
              />
            )}
          </group>
        );
      })}
    </>
  );
}
