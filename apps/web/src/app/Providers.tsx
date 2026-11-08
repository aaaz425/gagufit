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
      <p className="p-6 text-sm text-ink-muted">Supabase 설정이 필요해요</p>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={client}>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
