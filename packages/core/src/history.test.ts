import { describe, expect, it } from "vitest";
import * as history from "./history";

describe("history", () => {
  it("push → undo → redo", () => {
    let h = history.create(0);
    expect(history.canUndo(h)).toBe(false);
    h = history.push(h, 1);
    h = history.push(h, 2);
    expect(h.present).toBe(2);
    h = history.undo(h);
    expect(h.present).toBe(1);
    expect(history.canRedo(h)).toBe(true);
    h = history.undo(h);
    expect(h.present).toBe(0);
    expect(history.canUndo(h)).toBe(false);
    h = history.redo(h);
    h = history.redo(h);
    expect(h.present).toBe(2);
    expect(history.canRedo(h)).toBe(false);
  });

  it("새 push는 redo 비움", () => {
    let h = history.push(history.push(history.create(0), 1), 2);
    h = history.undo(h);
    h = history.push(h, 3);
    expect(history.canRedo(h)).toBe(false);
    expect(h.present).toBe(3);
    expect(history.undo(h).present).toBe(1);
  });

  it("기본 50단계 넘으면 가장 오래된 것 버림", () => {
    let h = history.create(0);
    for (let i = 1; i <= 60; i++) h = history.push(h, i);
    let steps = 0;
    while (history.canUndo(h)) {
      h = history.undo(h);
      steps++;
    }
    expect(steps).toBe(50);
    expect(h.present).toBe(10);
  });

  it("끌기 - 시작 값 기억 → replace 반복 → commit, undo 한 번에 시작 값", () => {
    let h = history.push(history.create({ x: 0 }), { x: 10 });
    const before = h.present;
    for (let x = 11; x <= 20; x++) h = history.replace(h, { x });
    h = history.commit(h, before);
    expect(h.present).toEqual({ x: 20 });
    expect(history.canRedo(h)).toBe(false);
    h = history.undo(h);
    expect(h.present).toBe(before);
    h = history.undo(h);
    expect(h.present).toEqual({ x: 0 });
    expect(history.redo(history.redo(h)).present).toEqual({ x: 20 });
  });

  it("움직이지 않은 끌기는 기록 안 함", () => {
    const h = history.push(history.create(0), 1);
    expect(history.commit(h, h.present)).toBe(h);
  });
});
