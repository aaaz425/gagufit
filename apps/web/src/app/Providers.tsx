"use client";

import { ApiProvider, createApiClient } from "@gagufit/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavTracker } from "@/site/BackButton";
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
      <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
        <h1 className="text-xl font-bold text-ink">
          Supabase 환경 설정이 필요해요
        </h1>
      </main>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={client}>
        <NavTracker />
        {children}
      </ApiProvider>
    </QueryClientProvider>
  );
}
