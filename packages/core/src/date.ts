/** 화면 날짜 표기 YY.MM.DD - 두 자리 연도 */
const pad = (n: number) => String(n % 100).padStart(2, "0");

/** YYYY-MM-DD 문자열 - 시간대 변환 없이 그대로 */
export function formatDay(day: string): string {
  const [y, m, d] = day.split("-");
  return `${y.slice(-2)}.${m}.${d}`;
}

/** ISO 시각 - 사용자 시간대의 날짜 */
export function formatTimestamp(iso: string): string {
  const t = new Date(iso);
  return `${pad(t.getFullYear())}.${pad(t.getMonth() + 1)}.${pad(t.getDate())}`;
}
