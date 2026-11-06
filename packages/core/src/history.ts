/**
 * 실행 취소 기록 - 불변 값, 함수마다 새 History 반환
 * - 공개는 `history.create` 처럼 namespace로
 */
export type History<T> = {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
  /** 되돌릴 수 있는 최대 단계 */
  readonly limit: number;
};

export function create<T>(initial: T, limit = 50): History<T> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit은 1 이상 정수: ${limit}`);
  }
  return { past: [], present: initial, future: [], limit };
}

/** 새 상태 기록 - 다시 실행 기록 비움, limit 넘으면 가장 오래된 것 버림 */
export function push<T>(history: History<T>, next: T): History<T> {
  return {
    ...history,
    past: [...history.past, history.present].slice(-history.limit),
    present: next,
    future: [],
  };
}

export function undo<T>(history: History<T>): History<T> {
  if (!canUndo(history)) return history;
  return {
    ...history,
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: History<T>): History<T> {
  if (!canRedo(history)) return history;
  return {
    ...history,
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
  };
}

export function canUndo(history: History<unknown>): boolean {
  return history.past.length > 0;
}

export function canRedo(history: History<unknown>): boolean {
  return history.future.length > 0;
}
