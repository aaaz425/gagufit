"use client";

import { ApiProvider, createApiClient } from "@gagufit/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [client] = useState(() =>
    SUPABASE_URL && KEY ? createApiClient(SUPABASE_URL, KEY) : null,
  );

  if (!client)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
        <h1 className="text-xl font-bold text-ink">Supabase 설정이 필요해요</h1>
        <p className="text-sm text-ink-muted">
          환경변수에 Supabase 주소와 키를 넣고 다시 시작해 주세요
        </p>
      </main>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={client}>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
