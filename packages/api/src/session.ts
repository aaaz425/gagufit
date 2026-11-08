import type { ApiClient } from "./client";

const pending = new WeakMap<ApiClient, Promise<void>>();

// 동시 호출은 로그인 한 번만 공유
export function ensureSession(client: ApiClient): Promise<void> {
  let p = pending.get(client);
  if (!p) {
    p = signIn(client).finally(() => pending.delete(client));
    pending.set(client, p);
  }
  return p;
}

async function signIn(client: ApiClient): Promise<void> {
  const { data } = await client.auth.getSession();
  if (data.session) return;
  const { error } = await client.auth.signInAnonymously();
  if (error) throw error;
}
