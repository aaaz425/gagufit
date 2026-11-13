/** 가구 질감 - 나무 결·패브릭 짜임, 어두운 몸체는 밝은 선 */
export type PlanTexture = "wood" | "fabric";

/** scope - 같은 화면에 도면이 여러 개여도 패턴 id가 겹치지 않게 */
export type TextureRef = { kind: PlanTexture; scope: string };

export const textureId = (t: TextureRef, onDark: boolean) =>
  `${t.scope}-${t.kind}-${onDark ? "light" : "dark"}`;
