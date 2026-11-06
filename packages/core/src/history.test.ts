import { describe, expect, it } from "vitest";
import { canRedo, canUndo, createHistory, push, redo, undo } from "./history";

describe("history", () => {
  it("push → undo → redo", () => {
    let h = createHistory(0);
    expect(canUndo(h)).toBe(false);
    h = push(h, 1);
    h = push(h, 2);
    expect(h.present).toBe(2);
    h = undo(h);
    expect(h.present).toBe(1);
    expect(canRedo(h)).toBe(true);
    h = undo(h);
    expect(h.present).toBe(0);
    expect(canUndo(h)).toBe(false);
    h = redo(h);
    h = redo(h);
    expect(h.present).toBe(2);
    expect(canRedo(h)).toBe(false);
  });

  it("더 없으면 그대로", () => {
    const h = createHistory("a");
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });

  it("새 push는 redo 비움", () => {
    let h = push(push(createHistory(0), 1), 2);
    h = undo(h);
    h = push(h, 3);
    expect(canRedo(h)).toBe(false);
    expect(h.present).toBe(3);
    expect(undo(h).present).toBe(1);
  });

  it("기본 50단계 넘으면 가장 오래된 것 버림", () => {
    let h = createHistory(0);
    for (let i = 1; i <= 60; i++) h = push(h, i);
    let steps = 0;
    while (canUndo(h)) {
      h = undo(h);
      steps++;
    }
    expect(steps).toBe(50);
    expect(h.present).toBe(10);
  });

  it("원래 값은 바뀌지 않음", () => {
    const h = createHistory(0);
    const next = push(h, 1);
    expect(h.present).toBe(0);
    expect(h.past).toEqual([]);
    expect(next).not.toBe(h);
  });

  it("limit은 1 이상 정수", () => {
    expect(() => createHistory(0, 0)).toThrow(RangeError);
  });
});
