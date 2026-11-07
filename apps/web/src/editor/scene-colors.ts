// DESIGN.md 토큰 값 - 2D 탑뷰·3D 씬 공용, globals.css @theme와 같게 유지
export const SCENE_COLORS = {
  primary: "#0B7D61",
  inkMuted: "#5B616E",
  danger: "#C8343A",
  dangerSoft: "#FCEBEC",
  floor: "#F1E8DA",
  wall: "#3D3A36",
  grid: "#E2D7C6",
  furniture: "#D4C3AA",
  furnitureLine: "#B5A285",
  furnitureSoft: "#C8B597",
  rug: "#E6D6BF",
} as const;

/** 문 열림 부채꼴·문 앞 통로 - 평소 ink-muted 옅게, 선택 시 primary */
export const DOOR_AREA_OPACITY = 0.16;
