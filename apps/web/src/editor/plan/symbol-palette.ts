// 가구 평면 기호 색 - 몸체는 고른 색 그대로, 외곽선·장식은 몸체 밝기에 맞춰 도출

export type SymbolPalette = {
  body: string;
  line: string;
  /** 침대 이불 */
  soft: string;
  /** 베개·상판·문 등 밝은 장식 */
  hi: string;
  /** TV 화면 */
  screen: string;
  rug: string;
  rugLine: string;
  /** 속 빈 가구(행거) 바닥 - 선만 있으면 바닥색에 묻힘 */
  ghost: string;
};

const DEFAULT: SymbolPalette = {
  body: "var(--color-scene-furniture)",
  line: "var(--color-scene-furniture-line)",
  soft: "var(--color-scene-furniture-soft)",
  hi: "rgb(255 255 255 / 0.5)",
  screen: "var(--color-scene-wall)",
  rug: "var(--color-scene-rug)",
  rugLine: "var(--color-scene-furniture)",
  ghost: "none",
};

type Rgb = [number, number, number];

const parse = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const css = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`;

const brightness = ([r, g, b]: Rgb) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255;

const INK: Rgb = [38, 30, 24];
const WHITE: Rgb = [255, 255, 255];

export function symbolPalette(hex?: string): SymbolPalette {
  if (!hex) return DEFAULT;
  const c = parse(hex);
  // 어두운 몸체는 밝은 선, 밝은 몸체는 어두운 선
  const dark = brightness(c) < 0.4;
  const line = dark ? mix(c, WHITE, 0.55) : mix(c, INK, 0.5);
  return {
    body: hex,
    line: css(line),
    soft: css(mix(c, line, 0.18)),
    hi: css(dark ? mix(c, line, 0.3) : mix(c, WHITE, 0.55)),
    screen: dark ? css(line) : "var(--color-scene-wall)",
    rug: hex,
    rugLine: css(line),
    ghost: `rgb(${c[0]} ${c[1]} ${c[2]} / 0.5)`,
  };
}
