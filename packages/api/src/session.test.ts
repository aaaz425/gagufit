import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "./client";
import { ensureSession } from "./session";

function fakeClient(hasSession: boolean) {
  const signInAnonymously = vi.fn(async () => ({ error: null }));
  const client = {
    auth: {
      getSession: async () => ({ data: { session: hasSession ? {} : null } }),
      signInAnonymously,
    },
  } as unknown as ApiClient;
  return { client, signInAnonymously };
}

describe("ensureSession", () => {
  it("동시 호출해도 익명 로그인은 한 번", async () => {
    const { client, signInAnonymously } = fakeClient(false);
    await Promise.all([ensureSession(client), ensureSession(client)]);
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it("세션이 있으면 로그인하지 않음", async () => {
    const { client, signInAnonymously } = fakeClient(true);
    await ensureSession(client);
    expect(signInAnonymously).not.toHaveBeenCalled();
  });
});
