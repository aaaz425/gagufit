let cached: boolean | undefined;

/** 3D 전환 가능 여부 - 서버에서는 false */
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = gl !== null;
    // 확인용 컨텍스트가 브라우저 컨텍스트 수 제한을 차지하지 않게
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
