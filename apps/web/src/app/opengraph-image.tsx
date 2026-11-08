import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HEADLINE, SITE_NAME, SITE_TAGLINE } from "@/site/constants";

export const alt = `${SITE_NAME} - ${HEADLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori는 가변 글꼴을 못 읽어 정적 파일 사용, 색은 globals.css 토큰과 같은 값
const C = {
  primary: "#0b7d61",
  ink: "#1f2328",
  inkMuted: "#5b616e",
  canvas: "#ffffff",
  surface: "#f8f6f2",
  primarySelection: "#0b7d6133",
  danger: "#c8343a",
  dangerSoft: "#fcebec",
  floor: "#f1e8da",
  wall: "#3d3a36",
  furniture: "#d4c3aa",
};

const fontDir = join(
  process.cwd(),
  "node_modules/pretendard/dist/public/static",
);
const font = (file: string) => readFile(join(fontDir, file));
const [regular, bold, extraBold] = await Promise.all([
  font("Pretendard-Regular.otf"),
  font("Pretendard-Bold.otf"),
  font("Pretendard-ExtraBold.otf"),
]);

type Box = { x: number; y: number; w: number; h: number };

function Piece({
  box,
  style,
}: {
  box: Box;
  style: Record<string, string | number>;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        ...style,
      }}
    />
  );
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 48,
        background: C.surface,
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", flex: 1, gap: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: C.primary,
            }}
          >
            {/* lucide armchair - 서버 코드에서 lucide 컴포넌트를 못 써서 경로를 직접 둠 */}
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.canvas}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
              <path d="M5 18v2" />
              <path d="M19 18v2" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -0.8,
              color: C.ink,
            }}
          >
            gagufit
          </div>
        </div>
        <div
          style={{
            display: "flex",
            whiteSpace: "pre-line",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1.6,
            lineHeight: 1.25,
            color: C.ink,
          }}
        >
          {HEADLINE.replace(", ", ",\n")}
        </div>
        <div style={{ fontSize: 24, color: C.inkMuted }}>{SITE_TAGLINE}</div>
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          width: 380,
          height: 440,
          background: C.floor,
          boxShadow: `0 0 0 10px ${C.wall}`,
        }}
      >
        <Piece
          box={{ x: 28, y: 428, w: 100, h: 12 }}
          style={{ background: C.canvas }}
        />
        <Piece
          box={{ x: 28, y: 28, w: 120, h: 170 }}
          style={{
            background: C.furniture,
            borderRadius: 10,
            boxShadow: `0 0 0 4px ${C.primary}, 0 0 0 10px ${C.primarySelection}`,
          }}
        />
        <Piece
          box={{ x: 272, y: 28, w: 80, h: 150 }}
          style={{ background: C.furniture, borderRadius: 10 }}
        />
        <Piece
          box={{ x: 172, y: 306, w: 180, h: 84 }}
          style={{ background: C.furniture, borderRadius: 10 }}
        />
        <Piece
          box={{ x: 232, y: 364, w: 60, h: 60 }}
          style={{
            background: C.dangerSoft,
            borderRadius: 10,
            boxShadow: `0 0 0 3px ${C.danger}`,
          }}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
