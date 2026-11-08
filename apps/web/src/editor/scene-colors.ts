// 3D 전용 DESIGN.md 토큰 값 - 2D는 globals.css 변수 사용
export const SCENE_COLORS = {
  primary: "#0B7D61",
  inkMuted: "#5B616E",
  danger: "#C8343A",
  canvas: "#FFFFFF",
  floor: "#F1E8DA",
  wall: "#3D3A36",
} as const;

/** 문 열림 부채꼴·문 앞 통로 - 평소 ink-muted 옅게, 선택 시 primary - 2D 공용 */
export const DOOR_AREA_OPACITY = 0.16;
